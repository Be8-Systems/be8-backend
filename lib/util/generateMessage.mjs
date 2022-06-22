import redis from './redis.mjs';
import globals from '../data/globals.mjs';

export default async function generateMessage(message) {
    const messageID = await redis.incr(`messageAmount:${message.threadID}`);
    const key = `message:${message.threadID}:${messageID}`;

    message.ts = new Date();
    message.messageID = messageID;

    await redis.hSet(key, message);
    redis.incr('messageAmount');
    redis.expire(key, globals.expireTime / 1000);
    return key;
}
