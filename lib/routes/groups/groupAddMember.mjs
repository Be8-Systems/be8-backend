import redis from '../../util/redis.mjs';
import generateMessage from '../../util/generateMessage.mjs';
import { updateClient } from '../../sockets/event.mjs';
import checkIfRequestValid from '../../errorChecks/checkIfRequestValid.mjs';

async function addedToGroupMessage (groupID, memberID, accID) {
    const GroupNickname = await redis.hGet(`group:${groupID}`, 'nickname');
    const adminNickname = await redis.hGet(`acc:${accID}`, 'nickname');

    return await generateMessage({ 
        text: 'ADDEDTOGROUP',
        threadID: `${memberID}:s1`,
        sender: 's1',
        receiver: memberID,
        type: 'system',
        extra1: accID,
        extra2: GroupNickname,
        extra3: adminNickname
    });
}

async function accAddedToGroupMessage (groupID, userID) {
    const nickname = await redis.hGet(`acc:${userID}`, 'nickname');
    
    return await generateMessage({
        threadID: groupID,
        text: 'ACCADDEDTOGROUP',
        type: 'system',
        extra1: nickname,
        extra2: userID
    });
}

async function validRequest (req, res) {
    const accID = req.session.accID;
    const { groupID, memberID } = req.body;
    
    await redis.multi()
        .sAdd(`threads:${memberID}`, groupID)
        .sAdd(`threads:${groupID}`, memberID)
        .incr('threadAmount')
        .incr('messageAmount')
        .incr(`groupversion:${groupID}`)
        .exec();
    addedToGroupMessage(groupID, memberID, accID);
    accAddedToGroupMessage(groupID, memberID);

    const groupMembers = await redis.sMembers(`threads:${groupID}`);
    const filteredGroupMembers = groupMembers.filter(member => member !== memberID); 
    const eventsProms = filteredGroupMembers.map(member => updateClient(member, { action: 'groupUpdate', groupID }));

    await Promise.all(eventsProms);
    return res.status(200).send({ valid: true, groupMembers });
}

async function groupAddMember (req, res) {
    const checks = ['accExists', 'groupExists', 'memberExists', 'isMember', 'isAdmin', 'alreadyJoined', 'groupMaxReached'];
    const valid = await checkIfRequestValid(req, checks);
    
    if (valid === true) {
        return await validRequest(req, res);
    } 

    return res.status(valid.status).send(valid.response);
}

export default function groupAddMemberRoute (app) {
    return app.post('/groupaddmember', groupAddMember);
}
