import generateMessage from '../../util/generateMessage.mjs';
import sendPush from '../../util/sendPush.mjs';
import redis from '../../util/redis.mjs';
import checkIfRequestValid from '../../errorChecks/checkIfRequestValid.mjs';
import updateAfterSend from '../../util/updateAfterSend.mjs';

async function sendPushNotification({ sender, receiver, nickname }) {
    if (receiver.includes('g')) {
        const groupMembers = await redis.sMembers(`threads:${receiver}`);
        const filteredMembers = groupMembers.filter(member => member !== sender);
        const pushProms = filteredMembers.map(member => sendPush(member, nickname, sender));

        return Promise.all(pushProms);
    }

    return sendPush(receiver, nickname, sender);
}

async function validRequest(req, res) {
    const messageID = await generateMessage(req.body);

    await sendPushNotification(req.body);
    await updateAfterSend(req.body, req.session.accID);
    return res.status(200).send({ valid: true, messageID });
}

async function writeMessage(req, res) {
    const checks = ['accExists', 'receiverExists', 'senderExists', 'threadExists', 'messageType'];
    const valid = await checkIfRequestValid(req, checks);

    if (valid === true) {
        return await validRequest(req, res);
    }

    return res.status(valid.status).send(valid.response);
}

export default function writeMessageRoute(app) {
    return app.post('/writemessage', writeMessage);
}
