import redis from './redis.mjs';
import generateMessage from './generateMessage.mjs';
import { updateClient } from '../sockets/event.mjs';

async function leftGroupMessage(groupID, memberID) {
    const groupNickname = await redis.hGet(`group:${groupID}`, 'nickname');

    return await generateMessage({
        text: 'LEFTGROUP',
        threadID: `${memberID}:s1`,
        sender: 's1',
        receiver: memberID,
        type: 'system',
        extra1: groupID,
        extra2: groupNickname,
    });
}

async function accLeftGroupMessage(groupID, memberID) {
    const nickname = await redis.hGet(`acc:${memberID}`, 'nickname');

    return await generateMessage({
        threadID: groupID,
        text: 'ACCLEFTGROUP',
        type: 'system',
        extra1: memberID,
        extra2: nickname || 'Expired User',
    });
}

// ToDo: Eine/r der Programmierer:innen bitte checken ob nicht mit triggersseupdate getauscht werden kann.
async function sendUpdateClient(accID, groupID, groupMembers) {
    const filteredGroupMembers = groupMembers.filter(
        (member) => member !== accID
    );
    const eventsProms = filteredGroupMembers.map((member) =>
        updateClient(member, { action: 'groupUpdate', groupID })
    );

    return await Promise.all(eventsProms);
}

export default async function leaveGroup(accID, groupID) {
    const groupMembers = await redis.sMembers(`threads:${groupID}`);

    await redis
        .multi()
        .sRem(`threads:${accID}`, groupID)
        .sRem(`threads:${groupID}`, accID)
        .exec();
    await leftGroupMessage(groupID, accID);
    await accLeftGroupMessage(groupID, accID);
    await sendUpdateClient(accID, groupID, groupMembers);
    return await redis.sMembers(`threads:${groupID}`);
}
