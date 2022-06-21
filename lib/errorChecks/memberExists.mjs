import redis from '../util/redis.mjs';

export default async function accExists (req) {
    const member = await redis.hGet(`acc:${req.body.memberID}`, 'nickname');
    
    if (!member) {
        return { 
            status: 200,
            response: {
                valid: false
            }
        };
    }

    return true;
}
