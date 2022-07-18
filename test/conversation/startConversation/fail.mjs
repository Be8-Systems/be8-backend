import test from 'node:test';
import assert from 'assert/strict';
import nodeFetch from 'node-fetch';
import { baseUrl, newAccOptions, getPostOptions } from '../../utils/utils.mjs';

const firstAccOptions = newAccOptions();

test('FAIL startConversation', async function (context) {
    // create accs
    const firstAcc = await nodeFetch(`${baseUrl}/newAcc`, firstAccOptions);
    const firstAccData = await firstAcc.json();
    const cookie = firstAcc.headers.get('set-cookie');
    const failBodies = [
        {
            receiverID: '113434543',
            expected: 'ACCNOTEXISTS',
            msg: 'Acc id is not existing.',
        },
        {
            receiverID: [],
            expected: 'ACCNOTEXISTS',
            msg: 'Acc id is not existing.',
        },
        {
            receiverID: {},
            expected: 'ACCNOTEXISTS',
            msg: 'Acc id is not existing.',
        },
        {
            receiverID: '',
            expected: 'ACCNOTEXISTS',
            msg: 'Acc id is not existing.',
        },
        {
            receiverID: firstAccData.accID + '',
            expected: 'CIRCULARCONVERSATION',
            msg: 'You cannot start a conversation with yourself.',
        },
    ];

    const tests = await failBodies.map(async function (body) {
        await context.test(body.msg, async () => {
            const options = getPostOptions(body, cookie);
            const response = await nodeFetch(`${baseUrl}/startconversation`, options);
            const data = await response.json();

            return assert.strictEqual(data.error, body.expected);
        });
    });

    await Promise.all(tests);
});
