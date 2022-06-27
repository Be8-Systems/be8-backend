import redis from '../util/redis.mjs';

export default async function isMember(req) {
    const groupMembers = await redis.sMembers(`threads:${req.body.groupID}`);
    const accID = req.body.accID;

    if (!groupMembers.includes(accID)) {
        return {
            status: 200,
            response: {
                valid: false,
                reason: 'NOGROUPMEMBER',
            },
        };
    }

    return true;
}
