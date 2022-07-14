import redis from '../../util/redis.mjs';
import checkIfRequestValid from '../../errorChecks/checkIfRequestValid.mjs';

async function groupIncreaseVersion(req, res) {
    const valid = await checkIfRequestValid(req, ['accExists', 'groupExists', 'isMember']);

    if (valid === true) {
        const groupVersion = await redis.incr(`groupversion:${req.body.groupID}`);
        return res.status(200).send({ valid: true, groupVersion });
    }

    return res.status(valid.status).send(valid.response);
}

export default function groupGetCurrentVersionRoute(app) {
    return app.post('/groupincreaseversion', groupIncreaseVersion);
}
