import redis from '../util/redis.mjs';

export default async function isPrivate (req) {
    const groupType = await redis.hGet(`group:${req.body.groupID}`, 'groupType');

    if (groupType === 'private') {
        return { 
            status: 200,
            response: {
                valid: false
            }
        };
    }

    return true;
}