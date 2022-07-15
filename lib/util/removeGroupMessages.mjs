import redis from './redis.mjs';

export default async function removeGroupMessages (accID, groupID) {
    const amountMessages = redis.get(`messageAmount:${groupID}`);
    const proms = [...new Array(amountMessages)].map(function (_, i) {
        return redis.hGetAll(`message:${groupID}:${i}`);
    });
    const allMessages = await Promise.all(proms);
    const messagesToRemove = allMessages.map(function (message) {
        if (message.sender === accID) {
            return message.messageID;
        }
    }).filter(a => a);
    const removeProms = messagesToRemove.map(messageID => redis.hSet(`message:${groupID}:${messageID}`, { messageType: 'removed' }));

    return await Promise.all(removeProms);
}