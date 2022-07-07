import redis from '../../util/redis.mjs';
import checkIfRequestValid from '../../errorChecks/checkIfRequestValid.mjs';
import globals from '../../data/globals.mjs';

async function setEndless ({ session, body }, token) {
    const time = token.type === 'endless' ? globals.hundredYears : parseInt(token.validTime);
    console.log(time, typeof time);
    const accID = session.accID;
    const codes = await redis.hGetAll(`codes:${accID}`);
    const expire = new Date(Date.now() + time);
    console.log(expire);
    if (codes) {
        redis.expire(`codes:${accID}`, time / 1000);
    }
    if (token.type === 'promo') {console.log('_________________________');
        redis.del(`token:${body.token}`);
        redis.hSet(`acc:${accID}`, { expire });
    }
    if (token.type === 'endless') {
        redis.hSet(`token:${body.token}`, { active: true });
        redis.hSet(`acc:${accID}`, { expire, endless: true, endlessToken: body.token });
    }
    
    return redis.expire(`acc:${accID}`, time / 1000);
}

async function validRequest(req, res) {
    const token = req.body.token;
    const dbToken = await redis.hGetAll(`token:${token}`);
    
    if (!dbToken.type) {
        return res.status(400).send({ error: 'TOKENNOTEXIST' });
    }
    if (dbToken.active === 'false') {
        await setEndless(req, dbToken);
        return res.status(200).send({ valid: true, validate: true });
    }

    return res.status(200).send({ valid: false, tokenInUse: true });
}

async function endlessValidate(req, res) {
    const valid = await checkIfRequestValid(req, ['accExists', 'validToken']);

    if (valid === true) {
        return await validRequest(req, res);
    }

    return res.status(valid.status).send(valid.response);
}

export default function endlessValidateRoute(app) {
    return app.post('/endlessvalidate', endlessValidate);
}
