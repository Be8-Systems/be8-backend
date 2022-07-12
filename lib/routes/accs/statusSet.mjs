import redis from '../../util/redis.mjs';
import checkIfRequestValid from '../../errorChecks/checkIfRequestValid.mjs';

async function validRequest(req, res) {
    const accID = req.session.accID;
    const status = req.body.userStatus;

    await redis.hSet(`acc:${accID}`, { userStatus });
    return res.status(200).send({ valid: true });
}

async function userStatusSet(req, res) {
    const valid = await checkIfRequestValid(req, ['accExists', 'validStatus']);

    if (valid === true) {
        return await validRequest(req, res);
    }

    return res.status(valid.status).send(valid.response);
}

export default function statusSetRoute(app) {
    return app.post('/userstatusset', userStatusSet);
}
