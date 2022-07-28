import { updateClient } from '../sockets/event.mjs';
import redis from './redis.mjs';

export default async function updateAfterSend({ sender, receiver, nickname, threadID }, accID) {
    const isGroup = receiver.includes('g');
    const updateObj = {
        action: 'newMessage',
        threadID,
        groupID: threadID,
        sender,
        nickname,
        type: isGroup ? 'group' : 'user',
    };

    if (isGroup) {
        const groupMembers = await redis.sMembers(`threads:${receiver}`);
        const membersInfoProms = groupMembers.map(member => redis.hGetAll(`acc:${member}`));
        const rawMembers = await Promise.all(membersInfoProms);
        const members = rawMembers.filter(member => member.nickname);
        const updateProms = members.map(member => updateClient(member.id, updateObj));

        return Promise.all(updateProms);
    }

    updateClient(accID, updateObj);
    return updateClient(receiver, updateObj);
}
