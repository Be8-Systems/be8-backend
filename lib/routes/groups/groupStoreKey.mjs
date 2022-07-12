import redis from '../../util/redis.mjs';
import globals from '../../data/globals.mjs';
import checkIfRequestValid from '../../errorChecks/checkIfRequestValid.mjs';

async function validRequest({ groupID, groupKey, accID, keyholder, iv }, res) {
    const groupVersion = await redis.get(`groupversion:${groupID}`);
    
    await redis.sAdd(`groupversions:${groupID}:${accID}`, groupVersion);
    await redis.hSet(`groupkey:${groupID}:${accID}:${groupVersion}`, {
        groupKey,
        keyholder,
        iv
    });
    await redis.expire(`groupkey:${groupID}:${accID}:${groupVersion}`, (globals.expireTime / 1000) * 2);

    return res.status(200).send({ valid: true, groupVersion });
}

async function groupStoreKey(req, res) {
    const checks = ['accExists', 'groupExists', 'memberExists', 'isMember', 'isInGroup', 'keyholderExists', 'validGroupKey'];
    const valid = await checkIfRequestValid(req, checks);
    
    if (valid === true) {
        return await validRequest(req.body, res);
    }
    
    return res.status(valid.status).send(valid.response);
}

export default function groupStoreKeyRoute(app) {
    return app.post('/groupstorekey', groupStoreKey);
}
