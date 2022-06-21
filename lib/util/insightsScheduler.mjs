import getInsights from './getInsights.mjs';
import redis from './redis.mjs';

const oneHour = 1000 * 60 * 60;

async function fetchAndStoreInsights (key) {
    const allInsights = await getInsights();
    const fixedInsights = allInsights.map(i => !i ? 0 : i);
    const insightObject = {
        accs: fixedInsights[0], 
        groups: fixedInsights[1], 
        threads: fixedInsights[2], 
        messages: fixedInsights[3], 
        sentInviteLinks: fixedInsights[4],
        usedInviteLinks: fixedInsights[5],
        sentGrouInviteLinks: fixedInsights[6],
        usedGroupInviteLinks: fixedInsights[7]
    };

    return await redis.hSet(key, insightObject);
}

async function checkInsights () {
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

export default async function insightsScheduler () {
    checkInsights();

    return setInterval(function () {
        checkInsights();
    }, oneHour);
}
