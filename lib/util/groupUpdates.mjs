import redis from './redis.mjs';
import { updateClient } from '../sockets/event.mjs';

function getUpdateObject(groupID, type, accID) {
    if (type === 'joinmember') {
        return { action: 'groupUpdate', groupID };
    }
    if (type === 'leavegroup') {
        return {
            action: 'groupMemberRemove',
            groupID,
            threadID: groupID,
            leavingMember: accID,
            type: 'group',
        };
    }
}

export default async function groupUpdates({ groupID, type }, accID) {
    const updateObj = getUpdateObject(groupID, type, accID);
    const groupMembers = await redis.sMembers(`threads:${groupID}`);
    const eventsProms = groupMembers.map(member => updateClient(member, updateObj));

    return await Promise.all(eventsProms);
}
