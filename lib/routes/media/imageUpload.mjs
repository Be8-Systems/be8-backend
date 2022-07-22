import { writeFile, stat, mkdir } from 'fs/promises';
import generateMessage from '../../util/generateMessage.mjs';
import sendPush from '../../util/sendPush.mjs';
import redis from '../../util/redis.mjs';
import checkIfRequestValid from '../../errorChecks/checkIfRequestValid.mjs';
import updateAfterSend from '../../util/updateAfterSend.mjs';

//const runningUploads = new Map(); ToDo?

async function sendPushNotification({ sender, receiver, nickname }) {
    if (receiver.includes('g')) {
        const groupMembers = await redis.sMembers(`threads:${receiver}`);
        const filteredMembers = groupMembers.filter(member => member !== sender);
        const pushProms = filteredMembers.map(member => sendPush(member, nickname, sender));

        return Promise.all(pushProms);
    }

    return sendPush(receiver, nickname, sender);
}

async function validRequest(req, res, staticPath) {
    const { content, ...rest } = req.body;
    const path = `${staticPath}/../images/${rest.sender}/`;

    try {
        await stat(path);
    } catch (err) {
        await mkdir(path, { recursive: true });
    }

    await writeFile(`${path}${rest.sender}_${rest.contentID}.bin`, content);
    await generateMessage(rest);
    await sendPushNotification(rest);
    await updateAfterSend(rest);
    return res.status(200).send({ valid: true });
}

function imageUploadClr (staticPath) {
    return async function imageUpload(req, res) {
        const valid = await checkIfRequestValid(req, ['accExists']);
        
        if (valid === true) {
            return await validRequest(req, res, staticPath);
        }
    
        return res.status(valid.status).send(valid.response);
    };
}

export default function imageUploadRoute(app, staticPath) {
    return app.post('/imageupload', imageUploadClr(staticPath));
}
