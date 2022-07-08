import redis from '../../util/redis.mjs';
import checkIfRequestValid from '../../errorChecks/checkIfRequestValid.mjs';

async function createThread(accID, threadID, otherAcc, otherAccID) {
    const lastMessageID = await redis.get(`messageAmount:${threadID}`);
    const lastMessage = await redis.hGetAll(`message:${threadID}:${lastMessageID}`);
    const { password, ...accObj } = otherAcc; // eslint-disable-line
    const msgStatus = await redis.sMembers(`status:${threadID}:${lastMessageID}`);
    const status = msgStatus.includes(accID) || lastMessage.sender === accID ? 'read' : 'unread';
    const isImageMessage = lastMessage.type === 'imageMessage';
    const imageText = accID === lastMessage.sender ? 'SENTIMAGE' : 'RECEIVEDIMAGE';

    return {
        ...accObj,
        endless: accObj.endless === 'true',
        threadID,
        text: isImageMessage ? imageText : lastMessage.text,
        ts: lastMessage.ts,
        sender: threadID.includes('g') ? lastMessage.sender : otherAccID,
        status,
        groupKeyVersion: lastMessage.groupKeyVersion,
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

        return createThread(accID, threadIDs[i], accOrGroup, allIDs[i]);
    });

    return await Promise.all(threadProms);
}

async function validRequest(req, res) {
    const accID = req.session.accID;
    const masterAcc = {
        nickname: 'be8',
        expire: new Date(10000000000000),
        type: 'system',
    };
    const threadIDs = await redis.sMembers(`threads:${accID}`);
    const unsortedThreads = await getAllThreads(accID, threadIDs);
    const masterThread = await createThread(accID, `${accID}:s1`, masterAcc, 's1');
    const threads = unsortedThreads
        .filter(e => e)
        .sort(function (a, b) {
            const aDate = new Date(a.ts);
            const bDate = new Date(b.ts);

            return bDate - aDate;
        });

    return res.status(200).send({ valid: true, threads: [masterThread, ...threads] });
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
