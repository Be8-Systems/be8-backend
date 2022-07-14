import redis from '../../util/redis.mjs';
import globals from '../../data/globals.mjs';
import generateMessage from '../../util/generateMessage.mjs';
import checkIfRequestValid from '../../errorChecks/checkIfRequestValid.mjs';

async function accJoinedGroupMessage(groupID, accID) {
    const nickname = await redis.hGet(`acc:${accID}`, 'nickname');

    return await generateMessage({
        text: 'ACCJOINEDGROUP',
        sender: groupID,
        threadID: groupID,
        messageType: 'system',
        extra1: accID,
        extra2: nickname,
    });
}

async function validRequest(req, res) {
    const accID = req.session.accID;
    const groupID = req.body.groupID;

    await redis
        .multi()
        .sAdd(`threads:${accID}`, groupID)
        .sAdd(`threads:${groupID}`, accID)
        .expire(`threads:${accID}`, globals.expireTime / 1000)
        .expire(`threads:${groupID}`, globals.expireTime / 1000)
        .incr('threadAmount')
        .incr('messageAmount')
        .exec();
    accJoinedGroupMessage(groupID, accID);

    return res.status(200).send({ valid: true });
}

async function groupJoinMember(req, res) {
    const valid = await checkIfRequestValid(req, ['accExists', 'groupExists', 'alreadyJoined', 'groupMaxReached']);

    if (valid === true) {
        return await validRequest(req, res);
    }

    return res.status(valid.status).send(valid.response);
}

export default function groupJoinMemberRoute(app) {
    return app.post('/groupjoinmember', groupJoinMember);
}
