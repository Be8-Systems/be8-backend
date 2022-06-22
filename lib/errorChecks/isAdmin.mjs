import redis from '../util/redis.mjs';

export default async function isAdmin(req) {
    const accID = req.session.accID;
    const admin = await redis.hGet(`group:${req.body.groupID}`, 'admin');

    if (admin !== accID) {
        return {
            status: 200,
            response: {
                valid: false,
                reason: 'NOTADMIN',
            },
        };
    }

    return true;
}
