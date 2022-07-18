import test from 'node:test';
import assert from 'assert/strict';
import nodeFetch from 'node-fetch';
import { baseUrl, newAccOptions, getPostOptions } from '../../utils/utils.mjs';

const accOptions = newAccOptions();

test('FAIL endlessValidate', async function (context) {
    const accResponse = await nodeFetch(`${baseUrl}/newAcc`, accOptions);
    await accResponse.json();
    const cookie = accResponse.headers.get('set-cookie');
    const failBodies = [
        {
            expected: 'INVALIDTOKEN',
            msg: 'token paremeter missing',
        },
        {
            token: '',
            expected: 'INVALIDTOKEN',
            msg: 'token too short',
        },
        {
            token: null,
            expected: 'INVALIDTOKEN',
            msg: 'token not a string',
        },
        {
            token: {},
            expected: 'INVALIDTOKEN',
            msg: 'token not a string',
        },
        {
            token: [],
            expected: 'INVALIDTOKEN',
            msg: 'token not a string',
        },
        {
            token: 1234,
            expected: 'INVALIDTOKEN',
            msg: 'token not a string',
        },
    ];
    const tests = await failBodies.map(async function (body) {
        await context.test(body.msg, async () => {
            const options = getPostOptions(body, cookie);
            const response = await nodeFetch(`${baseUrl}/endlessvalidate`, options);
            const data = await response.json();

            assert(!data.valid);
            return assert.strictEqual(data.reason, body.expected);
        });
    });

    await Promise.all(tests);
});
