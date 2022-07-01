import redis from '../../util/redis.mjs';
import checkIfRequestValid from '../../errorChecks/checkIfRequestValid.mjs';

async function validRequest(req, res) {
    const rawKey = await redis.hGetAll(`pubkey:${req.body.accID}`);
    const publicKey = { ...rawKey, key_ops: ['deriveKey', 'deriveBits'] };

    return res.status(200).send({ valid: true, publicKey });
}

async function getKey(req, res) {
    const valid = await checkIfRequestValid(req, ['accExists', 'memberExists']);

    if (valid === true) {
        return await validRequest(req, res);
    }

    return res.status(valid.status).send(valid.response);
}

export default function getKeyRoute(app) {
    return app.post('/getkey', getKey);
}
