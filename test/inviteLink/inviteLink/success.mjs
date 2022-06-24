import test from 'node:test';
import assert from 'assert/strict';
import nodeFetch from 'node-fetch';
import { baseUrl, newAccOptions, getPostOptions } from '../../utils/utils.mjs';
import randomString from '../../utils/randomString.mjs';
import redis from '../../../lib/util/redis.mjs';

const nickname = randomString(10);
const accOptions = newAccOptions(nickname);

test('SUCCESS inviteLink', async function (t) {
    const accResponse = await nodeFetch(`${baseUrl}/newAcc`, accOptions);
    const cookie = accResponse.headers.get('set-cookie');

    await t.test('sentInviteLink', async function () {
        const beforeRequest = await redis.get('sentInviteLinkAmmount');
        const sentBody = { type: 'join', sentInviteLink: true };
        const sentOptions = getPostOptions(sentBody, cookie);
        const sentResponse = await nodeFetch(`${baseUrl}/invitelink`, sentOptions);
        const sent = await sentResponse.json();
        const afterRequest = await redis.get('sentInviteLinkAmmount');
        assert.strictEqual(parseInt(beforeRequest) + 1, parseInt(afterRequest));
        return assert(sent.valid);
    });

    await t.test('usedInviteLink', async function () {
        const beforeRequest = await redis.get('usedInviteLinkAmmount');
        const usedBody = { type: 'join', usedInviteLink: true };
        const usedOptions = getPostOptions(usedBody, cookie);
        const usedResponse = await nodeFetch(`${baseUrl}/invitelink`, usedOptions);
        const used = await usedResponse.json();
        const afterRequest = await redis.get('usedInviteLinkAmmount');

        assert.strictEqual(parseInt(beforeRequest) + 1, parseInt(afterRequest));
        return assert(used.valid);
    });

    return await redis.disconnect();
});
