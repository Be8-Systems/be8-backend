import redis from '../../util/redis.mjs';
import globals from '../../data/globals.mjs';
import checkIfRequestValid from '../../errorChecks/checkIfRequestValid.mjs';

async function validRequest(req, res) {
    const accID = req.session.accID;
    const { unlockCode, destroyCode } = req.body;

    await redis.hSet(`codes:${accID}`, { unlockCode, destroyCode });
    redis.expire(`codes:${accID}`, globals.expireTime / 1000);
    return res.status(200).send({ valid: true });
}

async function codeSet(req, res) {
    const valid = await checkIfRequestValid(req, ['accExists', 'validUnlockCode', 'validDestroyCode']);

    if (valid === true) {
        return await validRequest(req, res);
    }

    return res.status(valid.status).send(valid.response);
}

export default function codeSetRoute(app) {
    return app.post('/codeset', codeSet);
}
