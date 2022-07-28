import checkIfRequestValid from '../../errorChecks/checkIfRequestValid.mjs';
import redis from '../../util/redis.mjs';

const twentyForHours = 86400000;

async function getInsightsForOneDay(date, hour = 0) {
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    const key = `insights:${day}:${month}:${year}:${hour}`;
    const insights = await redis.hGetAll(key);

    if (!insights.accs && hour < 24) {
        hour++;
        return await getInsightsForOneDay(date, hour);
    }

    return { insights: Object.entries(insights), date };
}

async function validRequest(req, res) {
    const { start, end } = req.body;
    const startDate = new Date(start);
    const endDate = new Date(end);
    const days = (endDate - startDate) / twentyForHours + 1;
    const proms = [...new Array(days)].map(function (_, i) {
        const day = new Date(new Date(start).setDate(startDate.getDate() + i));
        return getInsightsForOneDay(day);
    });
    const insights = await Promise.all(proms);

    return res.status(200).json({ valid: true, insights });
}

async function insightsUntil(req, res) {
    const valid = await checkIfRequestValid(req, ['accExists']);

    if (valid === true) {
        return await validRequest(req, res);
    }

    return res.status(valid.status).send(valid.response);
}

export default function insightsUntilRoute(app) {
    return app.post('/insightsuntil', insightsUntil);
}
