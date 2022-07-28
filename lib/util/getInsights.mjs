import redis from '../util/redis.mjs';
import globals from '../data/globals.mjs';

export default async function getInsights() {
    const proms = [
        redis.get('accAmount'),
        redis.get('groupAmount'),
        redis.get('threadAmount'),
        redis.get('messageAmount'),
        redis.get('imageAmount'),
        redis.get('panicAmount'),
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
    const [threads, messages, images, panic, sentInviteLinks, usedInviteLinks, sentGrouInviteLinks, usedGroupInviteLinks] = rest;

    return Object.freeze([{
        name: 'accs',
        value: cleanedAccs
    }, {
        name: 'groups',
        value: cleanedGroups
    }, {
        name: 'threads',
        value: threads
    }, {
        name: 'messages',
        value: messages
    }, {
        name: 'images',
        value: images
    }, {
        name: 'panic',
        value: panic
    }, {
        name: 'sentInviteLinks',
        value: sentInviteLinks
    }, {
        name: 'usedInviteLinks',
        value: usedInviteLinks
    }, {
        name: 'sentGrouInviteLinks',
        value: sentGrouInviteLinks
    }, {
        name: 'usedGroupInviteLinks',
        value: usedGroupInviteLinks
    }]);
}
