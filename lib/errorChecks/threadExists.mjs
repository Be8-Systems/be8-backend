import redis from '../util/redis.mjs';

export default async function publicKeyExists(req) {
    const threadID = req.body.threadID;
    const messageAmount = await redis.get(`messageAmount:${threadID}`);

    if (!threadID || typeof threadID !== 'string' || !messageAmount) {
        return {
            status: 400,
            response: {
                error: 'INVALIDTHREADID',
            },
        };
    }

    return true;
}
