import redis from '../../util/redis.mjs';
import checkIfRequestValid from '../../errorChecks/checkIfRequestValid.mjs';

async function validRequest(req, res) {
    const accID = req.session.accID;
    const { oldCode, codeType, code } = req.body;

    if (codeType === 'unlock') {
        const oldUnlockCode = await redis.hGet(`codes:${accID}`, 'unlockCode');
        
        if (oldCode === oldUnlockCode) {
            await redis.hSet(`codes:${accID}`, { unlockCode: code });
            return res.status(200).send({ valid: true, unlockUpdated: true });
        }
        
        return res.status(200).send({ valid: false, reason: 'OLDCODEWRONG' });
    }
    if (codeType === 'destroy') {
        const oldDestroyCode = await redis.hGet(`codes:${accID}`, 'destroyCode');

        if (oldCode === oldDestroyCode) {
            await redis.hSet(`codes:${accID}`, { destroyCode: code });
            return res.status(200).send({ valid: true, destroyUpdated: true });
        }
        
        return res.status(200).send({ valid: false, reason: 'OLDCODEWRONG' });
    }
    
    return res.status(200).send({ valid: false });
}

async function codeUpdate(req, res) {
    const valid = await checkIfRequestValid(req, ['accExists', 'validCode', 'validOldCode', 'validCodeType']);

    if (valid === true) {
        return await validRequest(req, res);
    }

    return res.status(valid.status).send(valid.response);
}

export default function codeUpdateRoute(app) {
    return app.post('/codeupdate', codeUpdate);
}