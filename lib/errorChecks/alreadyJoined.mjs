import redis from '../util/redis.mjs';

export default async function alreadyJoined(req) {
    const groupID = typeof req.body.groupID === 'string' ? req.body.groupID : '';
    const alreadyJoined = await redis.sIsMember(`threads:${req.body.memberID}`, groupID);

    if (alreadyJoined) {
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
