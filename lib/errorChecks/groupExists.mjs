import redis from '../util/redis.mjs';

export default async function groupExists (req) {
    const group = await redis.hGet(`group:${req.body.groupID}`, 'nickname');

    if (!group) {
        return { 
            status: 200,
            response: {
                valid: false,
                reason: 'GROUPNOTEXISTING'
            }
        };
    }

    return true;
}