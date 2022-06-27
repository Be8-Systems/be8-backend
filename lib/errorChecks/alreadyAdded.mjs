import redis from '../util/redis.mjs';

export default async function allreadyAdded(req) {
    const groupID = typeof req.body.groupID === 'string' ? req.body.groupID : '';
    const allreadyAdded = await redis.sIsMember(`threads:${req.body.memberID}`, groupID);

    if (allreadyAdded) {
        return {
            status: 200,
            response: {
                valid: false,
                reason: 'ISALREADYMEMBER',
            },
        };
    }

    return true;
}
