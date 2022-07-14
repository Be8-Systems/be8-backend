import redis from '../../util/redis.mjs';
import { updateClient } from '../../sockets/event.mjs';
import globals from '../../data/globals.mjs';
import checkIfRequestValid from '../../errorChecks/checkIfRequestValid.mjs';

async function validRequest(req, res) {
    const accID = req.session.accID;
    const { threadID } = req.body;
    const messageAmount = await redis.get(`messageAmount:${threadID}`);
    const fetchAbleMessages = 100;
    const begin = messageAmount < fetchAbleMessages ? 0 : messageAmount - fetchAbleMessages;
    const proms = [];

    for (let i = begin + 1; i <= messageAmount; i++) {
        const messageID = `message:${threadID}:${i}`;
        const multi = redis.multi().hGetAll(messageID).sMembers(`status:${threadID}:${i}`, accID).exec();

        proms.push(multi);
    }

    const redisResponse = await Promise.all(proms);
    const messages = redisResponse.map(function ([message, status]) {
        message.status = status;
        message.valid = true;

        if (!status.includes(accID) && message.sender !== accID) {
            redis.sAdd(`status:${threadID}:${message.messageID}`, accID);
            redis.expire(`status:${threadID}:${message.messageID}`, globals.expireTime / 1000);
            message.status.push(accID);
            updateClient(message.sender, {
                action: 'messageRead',
                threadID,
                receiver: message.receiver,
                messageID: message.messageID,
            });
        }

        return message;
    });

    return res.status(200).send({ valid: true, messages });
}

async function getMessages(req, res) {
    const valid = await checkIfRequestValid(req, ['accExists', 'threadExists']);

    if (valid === true) {
        return await validRequest(req, res);
    }

    return res.status(valid.status).send(valid.response);
}

export default function getMessagesRoute(app) {
    return app.post('/getmessages', getMessages);
}
