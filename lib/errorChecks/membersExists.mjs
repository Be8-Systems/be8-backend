import redis from '../util/redis.mjs';

const errorObj = {
    status: 200,
    response: {
        valid: false,
        reason: 'MEMBERNOTEXISTING',
    },
};

export default async function accExists(req) {
    const memberIDs = req.body.accIDs;

    if (!Array.isArray(memberIDs) || memberIDs.length < 1) {
        return errorObj;
    }

    const proms = memberIDs.map(function (memberID) {
        if (!memberID || typeof memberID !== 'string') {
            return Promise.resolve(false);
        }
        if (memberID.includes('g')) {
            return redis.hGet(`group:${memberID}`, 'nickname');
        }

        return redis.hGet(`acc:${memberID}`, 'nickname');
    });
    const members = await Promise.all(proms);
    const areNoMembers = members.some(member => !member);

    if (areNoMembers) {
        return errorObj;
    }

    return true;
}
