import redis from '../util/redis.mjs';
import globals from '../data/globals.mjs';

export default async function getInsights() {
    const proms = [
        redis.get('accAmount'),
        redis.get('groupAmount'),
        redis.get('threadAmount'),
        redis.get('messageAmount'),
        redis.get('sentInviteLinkAmmount'),
        redis.get('usedInviteLinkAmmount'),
        redis.get('sentGroupInviteLinkAmmount'),
        redis.get('usedGroupInviteLinkAmmount'),
    ];
    // ToDo:  remove 10k from all
    const insights = await Promise.all(proms);
    const [accs, groups, ...rest] = insights;
    const cleanedAccs = accs - globals.reservedAccs + globals.soldAccs;
    const cleanedGroups = groups - globals.reservedGroups + globals.soldGroups;

    return [cleanedAccs, cleanedGroups, ...rest];
}
