import getInsights from '../../util/getInsights.mjs';
import checkIfRequestValid from '../../errorChecks/checkIfRequestValid.mjs';

async function insights (req, res) {
    const valid = await checkIfRequestValid(req, ['accExists']);

    if (valid === true) {
        const insight = await getInsights();
        return res.status(200).send({ valid: true, insight });
    } 

    return res.status(valid.status).send(valid.response);
}

export default function insightsRoute (app) {
    return app.get('/insights', insights);
}