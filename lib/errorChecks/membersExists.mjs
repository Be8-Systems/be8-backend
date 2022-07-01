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

    const proms = memberIDs.map(memberID => redis.hGet(`acc:${memberID}`, 'nickname'));
    const members = await Promise.all(proms);
    const areNoMembers = members.some(function (member, i) {
        const notValidID = !memberIDs[i] || typeof memberIDs[i] !== 'string';
        return notValidID || !member;
    });
    
    if (areNoMembers) {
        return errorObj;
    }

    return true;
}
