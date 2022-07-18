import { rm, stat } from 'fs/promises';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import redis from './redis.mjs';
import generateMessage from './generateMessage.mjs';
import deleteGroup from './deleteGroup.mjs';
import leaveGroup from './leaveGroup.mjs';
import { updateClient } from '../sockets/event.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));

async function writeDeleteMessage(accID, otherAccID) {
    return await generateMessage({
        text: 'ACCDELETED',
        threadID: `${otherAccID}:s1`,
        sender: 's1',
        receiver: otherAccID,
        messageType: 'system',
        extra1: accID,
    });
}

async function deleteImages(accID) {
    const path = `${__dirname}/../../images/${accID}/`;

    try {
        await stat(path);
        return await rm(path, { recursive: true });
    } catch (err) {
        return;
    }
}

async function deleteThreadsAndGroups(accID) {
    const threads = await redis.sMembers(`threads:${accID}`);
    const threadsWithoutMaster = threads.filter(thread => thread !== 's1');
    const threadsProms = threadsWithoutMaster.map(function (threadID) {
        const otherAccID = threadID.split(':').find(id => id !== accID);

        writeDeleteMessage(accID, otherAccID);
        updateClient(otherAccID, { action: 'expiredAcc', accID });
        return redis.sRem(`threads:${otherAccID}`, threadID);
    });
    const groups = threadsWithoutMaster.filter(threadID => threadID.includes('g'));
    const fullGroupsProms = groups.map(function (groupID) {
        return redis.hGetAll(`group:${groupID}`);
    });
    const fullGroups = await Promise.all(fullGroupsProms);
    const groupsIsAdmin = fullGroups.filter(group => group.admin === accID);
    const groupsIsMember = fullGroups.filter(group => group.admin !== accID);
    const groupDeleteProms = groupsIsAdmin.map(({ groupID }) => deleteGroup(groupID));
    const groupLeaveProms = groupsIsMember.map(({ groupID }) => leaveGroup(accID, groupID));

    await Promise.all([...threadsProms, ...groupDeleteProms, ...groupLeaveProms]);
    deleteImages(accID);
    return await redis.del(`threads:${accID}`);
}

async function deleteToken(accID) {
    const { endless, endlessToken } = await redis.hGetAll(`acc:${accID}`);

    if (endless === 'true') {
        return await redis.hSet(`token:${endlessToken}`, { active: false });
    }
}

export default async function deleteAcc(accID, session = undefined) {
    await deleteToken(accID);
    await deleteThreadsAndGroups(accID);

    if (session) {
        session.accID = undefined;
        session.destroy();
    }

    return redis.del(`acc:${accID}`);
}
