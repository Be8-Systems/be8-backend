import redis from '../util/redis.mjs';

export default async function isAdmin (req) {
    const accID = req.session.accID;
    const { admin, groupType } = await redis.hGetAll(`group:${req.body.groupID}`);

    if (groupType === 'private' && admin !== accID) {
        return { 
            status: 200,
            response: {
                valid: false,
                reason: 'NOTADMIN'
            }
        };
    }

    return true;
}