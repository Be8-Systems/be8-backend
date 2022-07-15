import leaveGroup from '../../util/leaveGroup.mjs';
import checkIfRequestValid from '../../errorChecks/checkIfRequestValid.mjs';
import removeGroupMessages from '../../util/removeGroupMessages.mjs';

async function validRequest (req, res) {
    const accID = req.session.accID;
    const groupMembers = await leaveGroup(accID, req.body.groupID);
    
    await removeGroupMessages(accID, req.body.groupID);
    return res.status(200).send({ valid: true, groupMembers });
}

async function groupLeaveMember(req, res) {
    const valid = await checkIfRequestValid(req, ['accExists', 'groupExists', 'isMember']);

    if (valid === true) {
        return await validRequest(req, res);
    }

    return res.status(valid.status).send(valid.response);
}

export default function groupLeaveMemberRoute(app) {
    return app.post('/groupleavemember', groupLeaveMember);
}
