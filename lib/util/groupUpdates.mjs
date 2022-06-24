import redis from './redis.mjs';
import { updateClient } from '../sockets/event.mjs';

function getUpdateObject(groupID, type) {
    if (type === 'joinmember' || type === 'leavegroup') {
        return { action: 'groupUpdate', groupID };
    }
}

export default async function groupUpdates({ groupID, type }, accID) {
    const groupMembers = await redis.sMembers(`threads:${groupID}`);
    const filteredGroupMembers = groupMembers.filter(member => member !== accID);
    const updateObj = getUpdateObject(groupID, type);
    const eventsProms = filteredGroupMembers.map(member => updateClient(member, updateObj));

    return await Promise.all(eventsProms);
}
