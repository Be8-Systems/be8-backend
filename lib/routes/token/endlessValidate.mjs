import redis from '../../util/redis.mjs';
import checkIfRequestValid from '../../errorChecks/checkIfRequestValid.mjs';

const hundredYears = 3153600000000; // in milliseconds

async function setEndless ({ session, body }) {
    const accID = session.accID;
    const codes = await redis.hGet(`codes:${accID}`);

    if (codes) {
        redis.expire(`codes:${accID}`, hundredYears / 1000);
    }

    session.cookie.maxAge = hundredYears;
    session.cookie.expires = new Date(Date.now() + hundredYears);

    redis.set(`token:${body.token}`, accID);
    return redis.expire(`acc:${accID}`, hundredYears / 1000);
}

async function validRequest(req, res) {
    const token = req.body.token;
    const tokenStatus = await redis.get(`token:${token}`);
    
    if (tokenStatus === null) {
        return res.status(400).send({ error: 'TOKENNOTEXIST' });
    }
    if (tokenStatus === false) {
        await setEndless(req);
        return res.status(200).send({ valid: true, validate: true });
    }

    return res.status(200).send({ valid: false, tokenInUse: true });
}

async function endlessValidate(req, res) {
    const valid = await checkIfRequestValid(req, ['accExists', 'validToken']);

    if (valid === true) {
        return await validRequest(req, res);
    }

    return res.status(valid.status).send(valid.response);
}

export default function meRoute(app) {
    return app.post('/endlessvalidate', endlessValidate);
}
