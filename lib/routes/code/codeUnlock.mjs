import redis from '../../util/redis.mjs';
import checkIfRequestValid from '../../errorChecks/checkIfRequestValid.mjs';
import deleteAcc from '../../util/deleteAcc.mjs';

async function validRequest(req, res) {
    const accID = req.session.accID;
    const { unlockCode, destroyCode } = await redis.hGetAll(`codes:${accID}`);

    if (unlockCode === req.body.code) {
        return res.status(200).send({ valid: true, isValid: true });
    }
    if (destroyCode === req.body.code) {
        await deleteAcc(accID, req.session);
        return res.status(200).send({ valid: true, isDestroyCode: true });
    }
    
    return res.status(200).send({ valid: false, inValid: true });
}

async function codeUnlock(req, res) {
    const valid = await checkIfRequestValid(req, ['accExists', 'validCode']);

    if (valid === true) {
        return await validRequest(req, res);
    }

    return res.status(valid.status).send(valid.response);
}

export default function meRoute(app) {
    return app.post('/codeunlock', codeUnlock);
}