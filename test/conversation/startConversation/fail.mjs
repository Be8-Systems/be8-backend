import test from 'node:test';
import assert from 'assert/strict';
import nodeFetch from 'node-fetch';
import { baseUrl, newAccOptions, getPostOptions } from '../../utils/utils.mjs';

const firstAccOptions = newAccOptions();

test('FAIL startConversation', async function () {
    // create accs
    const firstAcc = await nodeFetch(`${baseUrl}/newAcc`, firstAccOptions);
    const firstAccData = await firstAcc.json();
    const cookie = firstAcc.headers.get('set-cookie');
    // start conversation
    const failBodies = [
        {
            receiverID: '113434543', // not existing accID
            expected: 'ACCNOTEXISTS',
        },
        {
            receiverID: firstAccData.accID + '', // own accID
            expected: 'CIRCULARCONVERSATION',
        },
    ];
    const proms = failBodies.map(function (convBody) {
        const startConversationOptions = getPostOptions(convBody, cookie);
        return nodeFetch(`${baseUrl}/startconversation`, startConversationOptions);
    });
    const responses = await Promise.all(proms);

    responses.forEach(async function (response, i) {
        const data = await response.json();
        assert.strictEqual(data.error, failBodies[i].expected);
    });
});
