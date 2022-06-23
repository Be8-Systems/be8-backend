import redis from '../../util/redis.mjs';
import globals from '../../data/globals.mjs';

async function groupStoreKey(req, res) {
    const { groupID, groupKey, accID, keyholder } = req.body;
    const groupVersion = await redis.get(`groupversion:${groupID}`);

    await redis.sAdd(`groupversions:${groupID}:${accID}`, groupVersion);
    await redis.hSet(`groupkey:${groupID}:${accID}:${groupVersion}`, {
        groupKey,
        keyholder,
    });
    await redis.expire(`groupkey:${groupID}:${accID}:${groupVersion}`, (globals.expireTime / 1000) * 2);

    return res.status(200).send({ valid: true, groupVersion });
}

export default function groupStoreKeyRoute(app) {
    return app.post('/groupstorekey', groupStoreKey);
}
