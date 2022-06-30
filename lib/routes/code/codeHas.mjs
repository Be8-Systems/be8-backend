import redis from '../../util/redis.mjs';
import checkIfRequestValid from '../../errorChecks/checkIfRequestValid.mjs';

async function validRequest(req, res) {
    const accID = req.session.accID;
    const codes = await redis.hGetAll(`codes:${accID}`);
    console.log(codes);
    return res.status(200).send({ valid: true, hasCode: !!codes.unlockCode });
}

async function codeHas(req, res) {
    const valid = await checkIfRequestValid(req, ['accExists']);

    if (valid === true) {
        return await validRequest(req, res);
    }

    return res.status(valid.status).send(valid.response);
}

export default function codeHasRoute(app) {
    return app.get('/codehas', codeHas);
}