import redis from '../util/redis.mjs';

export default async function senderExists(req) {
    const senderID = req.body.sender;
    const senderExists = await redis.hGet(`acc:${senderID}`, 'nickname');

    if (!senderExists) {
        return {
            status: 400,
            response: {
                error: 'ACCNOTEXISTS',
            },
        };
    }

    return true;
}
