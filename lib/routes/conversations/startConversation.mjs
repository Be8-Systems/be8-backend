import redis from '../../util/redis.mjs';
import globals from '../../data/globals.mjs';
import checkIfRequestValid from '../../errorChecks/checkIfRequestValid.mjs';

async function checkThreadExists(accID, threadId) {
    return redis.sIsMember(`threads:${accID}`, threadId);
}

async function generateFirstMessage(threadID) {
    const firstID = await redis.incr(`messageAmount:${threadID}`);
    const messageID = `message:${threadID}:${firstID}`;
    const message = {
        messageID: firstID,
        text: 'STARTCONVERSATION',
        ts: new Date(),
        type: 'system',
    };

    await redis.hSet(messageID, message);
    redis.expire(messageID, globals.expireTime / 1000);
}

async function validRequest(req, res) {
    const accID = req.session.accID;
    const receiverID = req.body.receiverID;
    const threadID = `${accID}:${receiverID}`;
    const reverseThreadID = `${receiverID}:${accID}`;
    const threadExists = await checkThreadExists(accID, threadID);
    const reverseThreadExists = await checkThreadExists(accID, reverseThreadID);

    if (threadExists || reverseThreadExists) {
        return res.status(200).send({ valid: true, threadID });
    }

    await redis
        .multi()
        .sAdd(`threads:${accID}`, threadID)
        .sAdd(`threads:${receiverID}`, threadID)
        .incr('threadAmount')
        .incr('messageAmount')
        .exec();
    await generateFirstMessage(threadID);

    return res.status(200).send({ valid: true, threadID });
}

async function startConversation(req, res) {
    const valid = await checkIfRequestValid(req, ['accExists', 'receiverExists', 'circularConv']);

    if (valid === true) {
        return await validRequest(req, res);
    }

    return res.status(valid.status).send(valid.response);
}

export default function startConversationRoute(app) {
    return app.post('/startconversation', startConversation);
}
