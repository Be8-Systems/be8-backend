import redis from '../util/redis.mjs';
import globals from '../data/globals.mjs';

export default async function getInsights() {
    const proms = [
        redis.get('accAmount'),
        redis.get('groupAmount'),
        redis.get('threadAmount'),
        redis.get('messageAmount'),
        redis.get('imageAmount'),
        redis.get('sentInviteLinkAmount'),
        redis.get('usedInviteLinkAmount'),
        redis.get('sentGroupInviteLinkAmount'),
        redis.get('usedGroupInviteLinkAmount'),
    ];
    const insights = await Promise.all(proms);
    const sanInsights = insights.map(i => i || 0);
    const [accs, groups, ...rest] = sanInsights;
    const cleanedAccs = accs - globals.reservedAccs + globals.soldAccs;
    const cleanedGroups = groups - globals.reservedGroups + globals.soldGroups;

    return Object.freeze({
        accs: cleanedAccs,
        groups: cleanedGroups,
        threads: rest[0],
        messages: rest[1],
        images: rest[2],
        sentInviteLinks: rest[3],
        usedInviteLinks: rest[4],
        sentGrouInviteLinks: rest[5],
        usedGroupInviteLinks: rest[6],
    });
}
