import getInsights from '../../util/getInsights.mjs';

async function insights(_, res) {
    const insights = await getInsights();
    return res.status(200).send({ valid: true, insights });
}

export default function insightsRoute(app) {
    return app.get('/insights', insights);
}
