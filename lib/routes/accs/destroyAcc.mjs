import deleteAcc from '../../util/deleteAcc.mjs';
import checkIfRequestValid from '../../errorChecks/checkIfRequestValid.mjs';

async function validRequest (req, res) {
    const accID = req.session.accID;

    await deleteAcc(accID);
    req.session.accID = undefined;
    req.session.destroy();
    return res.status(200).send({ valid: true });
}

async function destroyAcc (req, res) {
    const valid = await checkIfRequestValid(req, ['accExists']);

    if (valid === true) {
        return await validRequest(req, res);
    } 

    return res.status(valid.status).send(valid.response);
}

export default function destroyAccRoute (app) {
    return app.get('/destroyacc', destroyAcc);
}