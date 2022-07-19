import redis from './redis.mjs';
import generateMessage from './generateMessage.mjs';
import { updateClient } from '../sockets/event.mjs';

async function groupDeletedMessages(groupID, groupMembers, nickname) {
    const deleteMessageProms = groupMembers.map(function (memberID) {
        return generateMessage({
            text: 'GROUPDELETED',
            threadID: `${memberID}:s1`,
            sender: 's1',
            receiver: memberID,
            messageType: 'system',
            extra1: groupID,
            extra2: nickname,
        });
    });

    return await Promise.all(deleteMessageProms);
}

export default async function deleteGroup(groupID) {
    const groupMembers = await redis.sMembers(`threads:${groupID}`);
    const nickname = await redis.hGet(`group:${groupID}`, 'nickname');
    const membersDeleteProms = groupMembers.map(memberID => redis.sRem(`threads:${memberID}`, groupID));
    const eventsProms = groupMembers.map(member =>
        updateClient(member, {
            action: 'groupMemberRemove',
            groupID,
            threadID: groupID,
            leavingMember: member,
            type: group
        })
    );

    await Promise.all(membersDeleteProms);
    await redis.del(`group:${groupID}`);
    await groupDeletedMessages(groupID, groupMembers, nickname);
    await Promise.all(eventsProms);
}
