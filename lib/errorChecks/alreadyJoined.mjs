import redis from '../util/redis.mjs';

export default async function allreadyJoined(req) {
    const groupID = typeof req.body.groupID === 'string' ? req.body.groupID : '';
    const allreadyJoined = await redis.sIsMember(`threads:${req.session.accID}`, groupID);

    if (allreadyJoined) {
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
