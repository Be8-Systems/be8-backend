import redis from '../../util/redis.mjs';
import checkIfRequestValid from '../../errorChecks/checkIfRequestValid.mjs';

async function validRequest({ body, session }, res) {
    const deviceKeys = JSON.stringify(body);
    const accID = session.accID;

    await redis.sAdd(`devices:${accID}`, deviceKeys);
    return res.status(201).json({ valid: true, subscribe: true });
}

async function subscribe(req, res) {
    const valid = await checkIfRequestValid(req, ['accExists']);

    if (valid === true) {
        return await validRequest(req, res);
    }

    return res.status(valid.status).send(valid.response);
}

export default function subscribeRoute(app) {
    app.post('/subscribe', subscribe);
}
