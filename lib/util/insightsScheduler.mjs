import getInsights from './getInsights.mjs';
import redis from './redis.mjs';

const oneHour = 1000 * 60 * 60;

async function fetchAndStoreInsights(key) {
    const allInsights = await getInsights();
    const insightObject = {
        accs: allInsights.accs || 0,
        groups: allInsights.groups || 0,
        threads: allInsights.threads || 0,
        messages: allInsights.messages || 0,
        images: allInsights.images || 0,
        sentInviteLinks: allInsights.sentInviteLinks || 0,
        usedInviteLinks: allInsights.usedInviteLinks || 0,
        sentGrouInviteLinks: allInsights.sentGrouInviteLinks || 0,
        usedGroupInviteLinks: allInsights.usedGroupInviteLinks || 0,
    };

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
