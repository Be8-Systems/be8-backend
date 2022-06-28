import redis from '../../util/redis.mjs';
import checkIfRequestValid from '../../errorChecks/checkIfRequestValid.mjs';

async function validRequest(req, res) {
    const accID = req.session.accID;
    const { code, codeType } = req.body;

    if (codeType === 'unlock') {
        await redis.hSet(`codes:${accID}`, { unlockCode: code });
        return res.status(200).send({ valid: true, isValid: true });
    }
    if (codeType === 'destroy') {
        await redis.hSet(`codes:${accID}`, { destroyCode: code });
        return res.status(200).send({ valid: true, isDestroyCode: true });
    }
    
    return res.status(200).send({ valid: false });
}

async function codeUpdate(req, res) {
    const valid = await checkIfRequestValid(req, ['accExists', 'validCode', 'validCodeType']);

    if (valid === true) {
        return await validRequest(req, res);
    }

    return res.status(valid.status).send(valid.response);
}

export default function meRoute(app) {
    return app.post('/codeupdate', codeUpdate);
}