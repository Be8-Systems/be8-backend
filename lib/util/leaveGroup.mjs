import redis from './redis.mjs';
import generateMessage from './generateMessage.mjs';
import groupUpdates from './groupUpdates.mjs';
import deleteGroup from './deleteGroup.mjs';

async function leftGroupMessage(groupID, memberID) {
    const groupNickname = await redis.hGet(`group:${groupID}`, 'nickname');

    return await generateMessage({
        text: 'LEFTGROUP',
        threadID: `${memberID}:s1`,
        sender: 's1',
        receiver: memberID,
        messageType: 'system',
        extra1: groupID,
        extra2: groupNickname,
    });
}

async function accLeftGroupMessage(groupID, memberID) {
    const nickname = await redis.hGet(`acc:${memberID}`, 'nickname');

    return await generateMessage({
        threadID: groupID,
        text: 'ACCLEFTGROUP',
        messageType: 'system',
        sender: groupID,
        extra1: memberID,
        extra2: nickname || 'Expired User',
    });
}

async function checkAdminAndDelete (groupID, accID) {
    const admin = await redis.hGet(`group:${groupID}`, 'admin');
    console.log(admin, accID);
    if (admin === accID) {
        return await deleteGroup(groupID);
    }
}

export default async function leaveGroup(accID, groupID) {
    await groupUpdates({ groupID, type: 'leavegroup' }, accID);
    await redis.multi().sRem(`threads:${accID}`, groupID).sRem(`threads:${groupID}`, accID).exec();
    await leftGroupMessage(groupID, accID);
    await accLeftGroupMessage(groupID, accID);
    await checkAdminAndDelete(groupID, accID);
    return await redis.sMembers(`threads:${groupID}`);
}
