import groupUpdates from '../../util/groupUpdates.mjs';
import checkIfRequestValid from '../../errorChecks/checkIfRequestValid.mjs';

async function validRequest(req, res) {
    const accID = req.session.accID;

    await groupUpdates(req.body, accID);
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
