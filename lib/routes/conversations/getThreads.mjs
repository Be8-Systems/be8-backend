import redis from '../../util/redis.mjs';
import checkIfRequestValid from '../../errorChecks/checkIfRequestValid.mjs';

async function createThread(accID, threadID, otherAcc) {
    const lastMessageID = await redis.get(`messageAmount:${threadID}`);
    const lastMessage = await redis.hGetAll(`message:${threadID}:${lastMessageID}`);
    const { password, ...accObj } = otherAcc; // eslint-disable-line
    const msgStatus = await redis.sMembers(`status:${threadID}:${lastMessageID}`);
    const status = msgStatus.includes(accID) || lastMessage.sender === accID ? 'read' : 'unread';
    const isImageMessage = lastMessage.messageType === 'image';
    const imageText = accID === lastMessage.sender ? 'SENTIMAGE' : 'RECEIVEDIMAGE';
    const partner = accObj.groupID || accObj.id;

    return {
        ...accObj,
        endless: accObj.endless === 'true',
        codes: accObj.codes === 'true',
        threadID,
        ts: lastMessage.ts,
        messageType: isImageMessage ? 'system' : lastMessage.messageType,
        text: isImageMessage ? imageText : lastMessage.text,
        sender: lastMessage.sender,
        receiver: lastMessage.receiver,
        status,
        groupVersionKey: lastMessage.groupVersionKey,
        iv: lastMessage.iv,
        partner,
    };
}

async function getAllThreads(accID, threadIDs) {
    const allIDs = threadIDs.map(function (threadID) {
        const conversationIDs = threadID.split(':');
        return conversationIDs.find(id => id !== accID);
    });
    const proms = allIDs.map(function (id) {
        if (id.includes('g')) {
            return redis.hGetAll(`group:${id}`);
        }

        return redis.hGetAll(`acc:${id}`);
    });
    const accsAndGroups = await Promise.all(proms);
    const threadProms = accsAndGroups.map(function (accOrGroup, i) {
        if (!accOrGroup.nickname) {
            return;
        }

        return createThread(accID, threadIDs[i], accOrGroup);
    });

    return await Promise.all(threadProms);
}

async function validRequest(req, res) {
    const accID = req.session.accID;
    const masterAcc = {
        nickname: 'be8',
        expire: new Date(10000000000000),
        type: 'system',
        id: 's1',
    };
    const threadIDs = await redis.sMembers(`threads:${accID}`);
    const unsortedThreads = await getAllThreads(accID, threadIDs);
    const masterThread = await createThread(accID, `${accID}:s1`, masterAcc);
    const threads = [...unsortedThreads, masterThread]
        .filter(e => e)
        .sort(function (a, b) {
            const aDate = new Date(a.ts);
            const bDate = new Date(b.ts);

            return bDate - aDate;
        });

    return res.status(200).send({ valid: true, threads });
}

async function getThreads(req, res) {
    const valid = await checkIfRequestValid(req, ['accExists']);

    if (valid === true) {
        return await validRequest(req, res);
    }

    return res.status(valid.status).send(valid.response);
}

export default function getThreadsRoute(app) {
    return app.get('/getthreads', getThreads);
}
