import redis from '../../util/redis.mjs';
import globals from '../../data/globals.mjs';
import checkIfRequestValid from '../../errorChecks/checkIfRequestValid.mjs';

async function createdGroupMessage(groupID, accID) {
    const messageID = await redis.incr(`messageAmount:${accID}:s1`);
    const nickname = await redis.hGet(`group:${groupID}`, 'nickname');
    const key = `message:${accID}:s1:${messageID}`;
    const message = {
        messageID,
        text: 'CREATEDGROUP',
        ts: new Date(),
        type: 'system',
        sender: 's1',
        receiver: accID,
        extra1: groupID,
        extra2: nickname,
    };

    await redis.hSet(key, message);
}

async function validRequest(req, res) {
    const accID = req.session.accID;
    const groupNumber = await redis.incr('groupAmount');
    const groupID = `g${groupNumber}`;
    const group = {
        groupID,
        nickname: req.body.nickname,
        type: 'group',
        groupType: req.body.groupType,
        admin: accID,
        maxMembers: req.body.maxMembers || globals.maxMembers,
    };
    const key = `group:${groupID}`;

    await redis.hSet(key, group);
    redis.sAdd(`threads:${groupID}`, accID);
    createdGroupMessage(groupID, accID);
    return res.status(200).send({ valid: true, groupID });
}

async function groupCreate(req, res) {
    const valid = await checkIfRequestValid(req, ['accExists', 'validNickname', 'groupType']);

    if (valid === true) {
        return await validRequest(req, res);
    }

    return res.status(valid.status).send(valid.response);
}

export default function groupCreateRoute(app) {
    return app.post('/groupcreate', groupCreate);
}
