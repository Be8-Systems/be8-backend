import redis from '../../util/redis.mjs';
import generateMessage from '../../util/generateMessage.mjs';
import { updateClient } from '../../sockets/event.mjs';
import checkIfRequestValid from '../../errorChecks/checkIfRequestValid.mjs';
import removeGroupMessages from '../../util/removeGroupMessages.mjs';

async function kickedFromGroupMessage(groupID, memberID) {
    const groupNickname = await redis.hGet(`group:${groupID}`, 'nickname');

    return await generateMessage({
        text: 'KICKEDFROMGROUP',
        threadID: `${memberID}:s1`,
        sender: 's1',
        receiver: memberID,
        messageType: 'system',
        extra1: groupID,
        extra2: groupNickname,
    });
}

async function accKickedFromGroupMessage(groupID, memberID) {
    const nickname = await redis.hGet(`acc:${memberID}`, 'nickname');

    return await generateMessage({
        threadID: groupID,
        text: 'ACCKICKEDFROMGROUP',
        sender: groupID,
        messageType: 'system',
        extra1: memberID,
        extra2: nickname,
    });
}

async function validRequest(req, res) {
    const { accID, groupID } = req.body;
    const groupMembers = await redis.sMembers(`threads:${groupID}`);
    const eventsProms = groupMembers.map(function (member) {
        return updateClient(member, {
            action: 'groupMemberRemove',
            groupID,
            threadID: groupID,
            leavingMember: accID,
            type: 'group',
        });
    });

    await redis.multi().sRem(`threads:${accID}`, groupID).sRem(`threads:${groupID}`, accID).exec();
    await kickedFromGroupMessage(groupID, accID);
    await accKickedFromGroupMessage(groupID, accID);
    await Promise.all(eventsProms);
    await removeGroupMessages(accID, groupID);

    return res.status(200).send({ valid: true });
}

async function groupKickMember(req, res) {
    const valid = await checkIfRequestValid(req, ['accExists', 'groupExists', 'isAdmin', 'isInGroup', 'circularKick']);

    if (valid === true) {
        return await validRequest(req, res);
    }

    return res.status(valid.status).send(valid.response);
}

export default function groupKickMemberRoute(app) {
    return app.post('/groupkickmember', groupKickMember);
}
