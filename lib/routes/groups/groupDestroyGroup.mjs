import deleteGroup from '../../util/deleteGroup.mjs';
import checkIfRequestValid from '../../errorChecks/checkIfRequestValid.mjs';

async function groupDestroyGroup (req, res) {
    const valid = await checkIfRequestValid(req, ['accExists', 'isAdmin']);

    if (valid === true) {
        await deleteGroup(req.body.groupID);
        return res.status(200).send({ valid: true });
    } 

    return res.status(valid.status).send(valid.response);
}

export default function groupDestroyGroupRoute (app) {
    return app.post('/groupdestroygroup', groupDestroyGroup);
}