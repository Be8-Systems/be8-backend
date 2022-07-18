import { readFile } from 'fs/promises';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import redis from '../../util/redis.mjs';
import checkIfRequestValid from '../../errorChecks/checkIfRequestValid.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));

async function validRequest(req, res) {
    const { sender, contentID, messageID, threadID } = req.body;
    const message = await redis.hGetAll(`message:${threadID}:${messageID}`);

    try {
        const content = await readFile(`${__dirname}/../../images/${sender}/${sender}_${contentID}.bin`, 'utf8');
        return res.status(200).send({ valid: true, ...message, sender, contentID, content, type: 'image' });
    } catch (err) {
        return res.status(200).send({ valid: false });
    }
}

async function imageGet(req, res) {
    const valid = await checkIfRequestValid(req, ['accExists']);

    if (valid === true) {
        return await validRequest(req, res);
    }

    return res.status(valid.status).send(valid.response);
}

export default function imageGetRoute(app) {
    return app.post('/imageget', imageGet);
}
