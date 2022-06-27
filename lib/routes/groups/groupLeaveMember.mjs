import leaveGroup from '../../util/leaveGroup.mjs';
import checkIfRequestValid from '../../errorChecks/checkIfRequestValid.mjs';

async function groupLeaveMember(req, res) {
    const valid = await checkIfRequestValid(req, ['accExists', 'groupExists', 'isMember']);
    const accID = req.session.accID;

    if (valid === true) {
        const groupMembers = await leaveGroup(accID, req.body.groupID);
        return res.status(200).send({ valid: true, groupMembers });
    }

    return res.status(valid.status).send(valid.response);
}

export default function groupLeaveMemberRoute(app) {
    return app.post('/groupleavemember', groupLeaveMember);
}
