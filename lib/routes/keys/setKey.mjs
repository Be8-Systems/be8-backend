import redis from '../../util/redis.mjs';
import checkIfRequestValid from '../../errorChecks/checkIfRequestValid.mjs';

async function validRequest(req, res) {
    const accID = req.session.accID;
    const { key_ops, ...rest } = req.body.publicKey; // eslint-disable-line

    await redis.hSet(`pubkey:${accID}`, rest);
    return res.status(200).send({ valid: true });
}

async function setKey(req, res) {
    const valid = await checkIfRequestValid(req, ['accExists', 'validPublicKey']);

    if (valid === true) {
        return await validRequest(req, res);
    }

    return res.status(valid.status).send(valid.response);
}

export default function setKeyRoute(app) {
    return app.post('/setkey', setKey);
}
