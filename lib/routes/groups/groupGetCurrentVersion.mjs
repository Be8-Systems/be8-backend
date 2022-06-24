import redis from '../../util/redis.mjs';
import checkIfRequestValid from '../../errorChecks/checkIfRequestValid.mjs';

async function groupGetCurrentVersion(req, res) {
    const valid = await checkIfRequestValid(req, ['accExists']);

    if (valid === true) {
        const groupVersion = await redis.get(`groupversion:${req.body.groupID}`);
        return res.status(200).send({ valid: true, groupVersion });
    }

    return res.status(valid.status).send(valid.response);
}

export default function groupGetCurrentVersionRoute(app) {
    return app.post('/groupgetcurrentversion', groupGetCurrentVersion);
}
