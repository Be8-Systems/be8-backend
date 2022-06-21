import redis from '../../util/redis.mjs';
import checkIfRequestValid from '../../errorChecks/checkIfRequestValid.mjs';

async function validRequest (req, res) {
    const versions = await redis.sMembers(`groupversions:${req.body.groupID}:${req.body.accID}`);
    const keyProms = versions.map(version => redis.hGetAll(`groupkey:${req.body.groupID}:${req.body.accID}:${version}`));
    const keys = await Promise.all(keyProms);
    const groupKeys = keys.map(function (keyObject, i) {
        if (keyObject) {
            return {
                groupVersion: versions[i],
                groupKey: keyObject.groupKey,
                keyholder: keyObject.keyholder
            };
        }
    }).filter(e => e);

    return res.status(200).send({ valid: true, groupKeys });
}

async function groupGetKeys (req, res) {
    const valid = await checkIfRequestValid(req, ['accExists', 'isMember']);

    if (valid === true) {
        return await validRequest(req, res);
    } 

    return res.status(valid.status).send(valid.response);
}

export default function groupGetKeysRoute (app) {
    return app.post('/groupgetkeys', groupGetKeys);
}