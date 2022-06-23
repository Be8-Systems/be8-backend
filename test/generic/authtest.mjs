import test from 'node:test';
import assert from 'assert/strict';
import nodeFetch from 'node-fetch';
import { baseUrl, newAccOptions, getPostOptions, getGetOptions } from '../utils/utils.mjs';
import randomString from '../utils/randomString.mjs';

const nickname = randomString(10);
const accOptions = newAccOptions(nickname);
const cookie = 'invalid';
const postOptions = getPostOptions({}, cookie);
const getOptions = getGetOptions(cookie);
const routesWithAuth = [
    [
        `${baseUrl()}/getmessages`,
        postOptions
    ], [
        `${baseUrl()}/me`,
        getOptions
    ]
    // ToDo: add all routes 
];

test('FAIL getMessages', async function (context) {
    await nodeFetch(`${baseUrl()}/newAcc`, accOptions);

    const tests = await routesWithAuth.map(async function (options) {
        await context.test(options[1], async () => {
            const response = await nodeFetch(...options);
            const data = await response.json();

            return assert.strictEqual(data.error, 'NOTAUTH');
        });
    });

    return await Promise.all(tests);
});
