import redis from '../../util/redis.mjs';
import { updateClient } from '../../sockets/event.mjs';
import checkIfRequestValid from '../../errorChecks/checkIfRequestValid.mjs';

function getUpdateObject(groupID, type) {
    if (type === 'joinmember') {
        return { action: 'groupUpdate', groupID };
    }
}

async function validRequest(req, res) {
    const accID = req.session.accID;
    const { groupID, type } = req.body;
    const groupMembers = await redis.sMembers(`threads:${groupID}`);
    const filteredGroupMembers = groupMembers.filter(member => member !== accID);
    const updateObj = getUpdateObject(groupID, type);
    const eventsProms = filteredGroupMembers.map(member => updateClient(member, updateObj));

    await Promise.all(eventsProms);
    return res.status(200).send({ valid: true });
}

async function groupTriggerSSEUpdate(req, res) {
    const valid = await checkIfRequestValid(req, ['accExists']);

    if (valid === true) {
        return await validRequest(req, res);
    }

    return res.status(valid.status).send(valid.response);
}

export default function groupTriggerSSEUpdateRoute(app) {
    return app.post('/grouptriggersseupdate', groupTriggerSSEUpdate);
}
