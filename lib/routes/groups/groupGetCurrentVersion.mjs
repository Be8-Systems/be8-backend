import redis from '../../util/redis.mjs';

async function groupGetCurrentVersion(req, res) {
    const groupVersion = await redis.get(`groupversion:${req.body.groupID}`);
    return res.status(200).send({ valid: true, groupVersion });
}

export default function groupGetCurrentVersionRoute(app) {
    return app.post('/groupgetcurrentversion', groupGetCurrentVersion);
}
