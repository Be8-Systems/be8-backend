import redis from '../../util/redis.mjs';
import checkIfRequestValid from '../../errorChecks/checkIfRequestValid.mjs';

async function me(req, res) {
    const accID = req.session.accID;
    const valid = await checkIfRequestValid(req, ['accExists']);
    
    if (valid === true) {
        const { password, ...accObj } = await redis.hGetAll(`acc:${accID}`);

        if (!password) {
            return res.status(401).send({ error: 'NOTAUTH' });
        }

        return res.status(200).send({ valid: true, accObj, accID });
    }

    return res.status(valid.status).send(valid.response);
}

export default function meRoute(app) {
    return app.get('/me', me);
}
