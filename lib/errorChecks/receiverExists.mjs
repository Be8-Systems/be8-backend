import redis from '../util/redis.mjs';

export default async function receiverExists(req) {
    const receiverID = req.body.receiverID || req.body.receiver;
    const receiverExists = typeof receiverID === 'string' && receiverID.includes('g')
        ? await redis.hGet(`group:${receiverID}`, 'nickname')
        : await redis.hGet(`acc:${receiverID}`, 'nickname');

    if (!receiverExists) {
        return {
            status: 400,
            response: {
                error: 'ACCNOTEXISTS',
            },
        };
    }

    return true;
}
