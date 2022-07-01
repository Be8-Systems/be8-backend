import redis from '../../util/redis.mjs';
import checkIfRequestValid from '../../errorChecks/checkIfRequestValid.mjs';

async function validRequest(req, res) {
    const accIDs = req.body.accIDs;
    const proms = accIDs.map(accID => redis.hGetAll(`pubkey:${accID}`));
    const keys = await Promise.all(proms);
    const publicKeys = keys.map(function (key, i) {
        return {
            accID: accIDs[i],
            publicKey: {
                ...key,
                key_ops: ['deriveKey', 'deriveBits'],
            },
        };
    });

    return res.status(200).send({ valid: true, publicKeys });
}

async function getKeys(req, res) {
    const valid = await checkIfRequestValid(req, ['accExists', 'membersExists']);

    if (valid === true) {
        return await validRequest(req, res);
    }

    return res.status(valid.status).send(valid.response);
}

export default function getKeysRoute(app) {
    return app.post('/getkeys', getKeys);
}
