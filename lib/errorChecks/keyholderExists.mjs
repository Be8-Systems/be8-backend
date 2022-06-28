import redis from '../util/redis.mjs';

export default async function keyholderExists(req) {
    const memberID = req.body.keyholder;
    const member = await redis.hGet(`acc:${memberID}`, 'nickname');
    
    if (!memberID || typeof memberID !== 'string' || !member) {
        return {
            status: 200,
            response: {
                valid: false,
                reason: 'KEYHOLDERNOTEXISTING',
            },
        };
    }

    return true;
}
