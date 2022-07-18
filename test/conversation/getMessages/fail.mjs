import test from 'node:test';
import assert from 'assert/strict';
import nodeFetch from 'node-fetch';
import { baseUrl, newAccOptions, getPostOptions } from '../../utils/utils.mjs';

const firstAccOptions = newAccOptions();
const failBodies = [
    {
        msg: 'threadID param is missing',
        expected: 'INVALIDTHREADID',
    },
    {
        threadID: '',
        msg: 'threadID is empty string',
        expected: 'INVALIDTHREADID',
    },
    {
        threadID: false,
        msg: 'threadID is not a string',
        expected: 'INVALIDTHREADID',
    },
    {
        threadID: '392539458:3945495849589',
        msg: 'threadID is not a string',
        expected: 'INVALIDTHREADID',
    },
    {
        threadID: [],
        msg: 'threadID is not a string',
        expected: 'INVALIDTHREADID',
    },
    {
        threadID: {},
        msg: 'threadID is not a string',
        expected: 'INVALIDTHREADID',
    },
    {
        threadID: 123,
        msg: 'threadID is not a string',
        expected: 'INVALIDTHREADID',
    },
];

test('FAIL getMessages', async function (context) {
    // create accs
    const firstAcc = await nodeFetch(`${baseUrl}/newAcc`, firstAccOptions);
    const cookie = firstAcc.headers.get('set-cookie');

    const tests = await failBodies.map(async function (body) {
        await context.test(body.msg, async () => {
            const options = getPostOptions(body, cookie);
            const response = await nodeFetch(`${baseUrl}/getmessages`, options);
            const data = await response.json();

            return assert.strictEqual(data.error, body.expected);
        });
    });

    await Promise.all(tests);
});
