import { readFile } from 'fs/promises';
import redis from '../../util/redis.mjs';
import checkIfRequestValid from '../../errorChecks/checkIfRequestValid.mjs';

async function validRequest(req, res, staticPath) {
    const { sender, contentID, messageID, threadID } = req.body;
    const message = await redis.hGetAll(`message:${threadID}:${messageID}`);

    try {
        const content = await readFile(`${staticPath}/../images/${sender}/${sender}_${contentID}.bin`, 'utf8');
        return res.status(200).send({ valid: true, ...message, sender, contentID, content, type: 'image' });
    } catch (err) {
        return res.status(200).send({ valid: false });
    }
}

async function imageGetClr (staticPath) {
    return async function imageGet(req, res) {
        const valid = await checkIfRequestValid(req, ['accExists']);
    
        if (valid === true) {
            return await validRequest(req, res, staticPath);
        }
    
        return res.status(valid.status).send(valid.response);
    }
}

export default function imageGetRoute(app, staticPath) {
    return app.post('/imageget', imageGetClr(staticPath));
}
