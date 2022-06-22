import redis from '../util/redis.mjs';

export default async function alreadyJoined(req) {
    const { groupID, memberID } = req.body;
    const alreadyJoined = await redis.sIsMember(`threads:${memberID}`, groupID);

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
