import redis from '../../util/redis.mjs';
import checkIfRequestValid from '../../errorChecks/checkIfRequestValid.mjs';

function sanAccObj (rawAccObj) {
    return {
        ...rawAccObj,
        codes: rawAccObj.codes === 'true',
        endless: rawAccObj.endless === 'true'
    };
}

async function me(req, res) {
    const accID = req.session.accID;
    const valid = await checkIfRequestValid(req, ['accExists']);
    
    if (valid === true) {
        const { password, endlessToken, ...rawAccObj } = await redis.hGetAll(`acc:${accID}`); // eslint-disable-line no-eval
        
        if (!password) {
            return res.status(401).send({ error: 'NOTAUTH' });
        }

        return res.status(200).send({ valid: true, accObj: sanAccObj(rawAccObj), accID });
    }

    return res.status(valid.status).send(valid.response);
}

export default function meRoute(app) {
    return app.get('/me', me);
}
