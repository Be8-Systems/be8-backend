import redis from '../util/redis.mjs';

export default async function groupExists(req) {
    const groupMembers = await redis.sMembers(`threads:${req.body.groupID}`);
    const maxMembers = await redis.hGet(`group:${req.body.groupID}`, 'maxMembers');

    if (groupMembers.length >= maxMembers) {
        return {
            status: 400,
            response: {
                error: 'GROUPMAXREACHED',
            },
        };
    }

    return true;
}
