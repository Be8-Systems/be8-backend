import test from 'node:test';
import assert from 'assert/strict';
import nodeFetch from 'node-fetch';
import { baseUrl, newAccOptions, getPostOptions } from '../../utils/utils.mjs';
import randomString from '../../utils/randomString.mjs';

const nickname = randomString(10);
const accOptions = newAccOptions(nickname);

test('FAIL inviteLink', async function () {
    const accResponse = await nodeFetch(`${baseUrl()}/newAcc`, accOptions);
    const cookie = accResponse.headers.get('set-cookie');
    const sentBody = { type: 'false', sentInviteLink: true }; //wrong type failing
    const sentOptions = getPostOptions(sentBody, cookie);
    const sentResponse = await nodeFetch(`${baseUrl()}/invitelink`, sentOptions);
    const sent = await sentResponse.json();

    return assert.strictEqual(sent.error, 'INVALIDINPUT');
});
