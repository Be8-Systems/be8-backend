import { writeFile, stat, mkdir } from 'fs/promises';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { updateClient } from '../../sockets/event.mjs';
import generateMessage from '../../util/generateMessage.mjs';
import sendPush from '../../util/sendPush.mjs';
import redis from '../../util/redis.mjs';
import checkIfRequestValid from '../../errorChecks/checkIfRequestValid.mjs';

//const runningUploads = new Map(); ToDo?
const __dirname = dirname(fileURLToPath(import.meta.url));

async function sendUpdate({ sender, receiver, nickname, threadID }) {
    if (receiver.includes('g')) {
        const groupMembers = await redis.sMembers(`threads:${receiver}`);
        const filteredMembers = groupMembers.filter(member => member !== sender);
        const membersInfoProms = filteredMembers.map(member => redis.hGetAll(`acc:${member}`));
        const rawMembers = await Promise.all(membersInfoProms);
        const members = rawMembers.filter(member => member.nickname);
        const updateProms = members.map(member =>
            updateClient(member.id, {
                action: 'newMessage',
                threadID,
                sender,
                nickname,
                type: 'group'
            })
        );

        return Promise.all(updateProms);
    }

    return updateClient(receiver, {
        action: 'newMessage',
        threadID,
        sender,
        nickname,
        type: 'user'
    });
}

async function sendPushNotification({ sender, receiver, nickname, sender }) {
    if (receiver.includes('g')) {
        const groupMembers = await redis.sMembers(`threads:${receiver}`);
        const filteredMembers = groupMembers.filter(member => member !== sender);
        const pushProms = filteredMembers.map(member => sendPush(member, nickname, sender));

        return Promise.all(pushProms);
    }

    return sendPush(receiver, nickname, sender);
}

async function validRequest(req, res) {
    const { content, ...rest } = req.body;
    const path = `${__dirname}/../../images/${rest.sender}/`;

    try {
        await stat(path);
    } catch (err) {
        await mkdir(path, { recursive: true });
    }

    await writeFile(`${path}${rest.sender}_${rest.contentID}.bin`, content);
    await generateMessage(rest);
    await sendPushNotification(rest);
    await sendUpdate(rest);
    return res.status(200).send({ valid: true });
}

async function imageUpload(req, res) {
    const valid = await checkIfRequestValid(req, ['accExists']);

    if (valid === true) {
        return await validRequest(req, res);
    }

    return res.status(valid.status).send(valid.response);
}

export default function imageUploadRoute(app) {
    return app.post('/imageupload', imageUpload);
}
