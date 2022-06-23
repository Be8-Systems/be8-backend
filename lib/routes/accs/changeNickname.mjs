import redis from '../../util/redis.mjs';
import generateMessage from '../../util/generateMessage.mjs';
import checkIfRequestValid from '../../errorChecks/checkIfRequestValid.mjs';

async function writeChangeMessage(accID, oldNickname, newNickname) {
    return await generateMessage({
        text: 'CHANGENICKNAME',
        threadID: `${accID}:s1`,
        sender: 's1',
        receiver: accID,
        type: 'system',
        extra1: oldNickname,
        extra2: newNickname,
    });
}

async function validRequest(req, res) {
    const accID = req.session.accID;
    const newNickname = req.body.newNickname;

    await redis.hSet(`acc:${accID}`, 'nickname', newNickname);
    writeChangeMessage(accID, req.body.oldNickname, newNickname);
    return res.status(200).send({ valid: true });
}

async function changeNickName(req, res) {
    const valid = await checkIfRequestValid(req, ['accExists', 'validNickname']);

    if (valid === true) {
        return await validRequest(req, res);
    }

    return res.status(valid.status).send(valid.response);
}

export default function changeNickNameRoute(app) {
    return app.post('/changenickname', changeNickName);
}
