import redis from '../util/redis.mjs';

export default async function accExists(req) {
    const memberID = req.body.memberID || req.body.accID;
    const member = await redis.hGet(`acc:${memberID}`, 'nickname');
    
    if (!memberID || typeof memberID !== 'string' || !member) {
        return {
            status: 200,
            response: {
                valid: false,
                reason: 'MEMBERNOTEXISTING',
            },
        };
    }

    return true;
}
