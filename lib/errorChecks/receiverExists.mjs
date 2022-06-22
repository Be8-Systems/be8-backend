import redis from '../util/redis.mjs';

async function checkReceiverExists(receiverID) {
    return redis.hGet(`acc:${receiverID}`, 'nickname').then(function (nick) {
        return !!nick;
    });
}

export default async function receiverExists(req) {
    const receiverID = req.body.receiverID;
    const receiverExists = await checkReceiverExists(receiverID);

    if (!receiverExists) {
        return {
            status: 400,
            response: {
                error: 'ACCNOTEXISTS',
            },
        };
    }

    return true;
}
