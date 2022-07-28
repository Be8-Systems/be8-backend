import getInsights from './getInsights.mjs';
import redis from './redis.mjs';

const oneHour = 1000 * 60 * 60;

async function fetchAndStoreInsights(key) {
    const allInsights = await getInsights();
    const insightsPairs = allInsights.map(pair => [pair.name, pair.value || 0]);
    const insightObject = Object.fromEntries(insightsPairs);

    return await redis.hSet(key, insightObject);
}

async function checkInsights() {
    const now = new Date();
    const day = now.getDate();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();
    const hour = now.getHours();
    const key = `insights:${day}:${month}:${year}:${hour}`;
    const accs = await redis.hGet(key, 'accs');

    if (!accs) {
        return fetchAndStoreInsights(key);
    }

    return true;
}

export default async function insightsScheduler() {
    checkInsights();

    return setInterval(function () {
        checkInsights();
    }, oneHour);
}
