import { updateClient } from '../../sockets/event.mjs';
import generateMessage from '../../util/generateMessage.mjs';
import sendPush from '../../util/sendPush.mjs';
import redis from '../../util/redis.mjs';
import checkIfRequestValid from '../../errorChecks/checkIfRequestValid.mjs';

async function sendUpdate({ sender, receiver, nickname, threadID }) {
    if (receiver.includes('g')) {
        const groupMembers = await redis.sMembers(`threads:${receiver}`);
        const filteredMembers = groupMembers.filter(
            (member) => member !== sender
        );
        const membersInfoProms = filteredMembers.map((member) =>
            redis.hGetAll(`acc:${member}`)
        );
        const rawMembers = await Promise.all(membersInfoProms);
        const members = rawMembers.filter((member) => member.nickname);
        const updateProms = members.map((member) =>
            updateClient(member.id, {
                action: 'newMessage',
                threadID,
                sender,
                nickname,
            })
        );

        return Promise.all(updateProms);
    }

    return updateClient(receiver, {
        action: 'newMessage',
        threadID,
        sender,
        nickname,
    });
}

async function sendPushNotification({ sender, receiver, nickname }) {
    if (receiver.includes('g')) {
        const groupMembers = await redis.sMembers(`threads:${receiver}`);
        const filteredMembers = groupMembers.filter(
            (member) => member !== sender
        );
        const pushProms = filteredMembers.map((member) =>
            sendPush(member, nickname)
        );

        return Promise.all(pushProms);
    }

    return sendPush(receiver, nickname);
}

async function validRequest(req, res) {
    const messageID = await generateMessage(req.body);

    await sendPushNotification(req.body);
    await sendUpdate(req.body);
    return res.status(200).send({ valid: true, messageID });
}

async function writeMessage(req, res) {
    const valid = await checkIfRequestValid(req, ['accExists']);

    if (valid === true) {
        return await validRequest(req, res);
    }

    return res.status(valid.status).send(valid.response);
}

export default function writeMessageRoute(app) {
    return app.post('/writemessage', writeMessage);
}
