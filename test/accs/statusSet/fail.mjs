import test from 'node:test';
import assert from 'assert/strict';
import nodeFetch from 'node-fetch';
import { baseUrl, newAccOptions, getPostOptions } from '../../utils/utils.mjs';

const accOptions = newAccOptions();

test('FAIL statusSet', async function (context) {
    const accResponse = await nodeFetch(`${baseUrl}/newAcc`, accOptions);
    const cookie = accResponse.headers.get('set-cookie');
    const failBodies = [
        {
            expected: 'INVALIDSTATUS',
            msg: 'status parameter is missing',
        },
        {
            status: '',
            expected: 'INVALIDSTATUS',
            msg: 'status is too short',
        },
        {
            status: true,
            expected: 'INVALIDSTATUS',
            msg: 'status is not a string',
        },
        {
            status: {},
            expected: 'INVALIDSTATUS',
            msg: 'status is not a string',
        },
        {
            status: [],
            expected: 'INVALIDSTATUS',
            msg: 'status is not a string',
        },
        {
            status: 1234,
            expected: 'INVALIDSTATUS',
            msg: 'status is not a string',
        },
    ];
    const tests = failBodies.map(async function (body) {
        await context.test(body.msg, async () => {
            const options = getPostOptions(body, cookie);
            const response = await nodeFetch(`${baseUrl}/statusset`, options);
            const data = await response.json();

            assert(!data.valid);
            return assert.strictEqual(data.reason, body.expected);
        });
    });

    await Promise.all(tests);
});
