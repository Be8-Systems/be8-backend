import test from 'node:test';
import assert from 'node:assert/strict';
import nodeFetch from 'node-fetch';
import { baseUrl, newAccOptions, getPostOptions } from '../../utils/utils.mjs';
import randomString from '../../utils/randomString.mjs';

const nickname = randomString(10);
const accOptions = newAccOptions(nickname);
const failBodies = [
    {
        oldNickname: nickname,
        msg: 'newNickname parameter missing',
    },
    {
        oldNickname: nickname,
        newNickname: '',
        msg: 'newNickname too short (min length 1)',
    },
    {
        oldNickname: nickname,
        newNickname: randomString(21),
        msg: 'newNickname too long (max length 20)',
    },
    {
        oldNickname: nickname,
        newNickname: 100,
        msg: 'newNickname not a string',
    },
    {
        oldNickname: nickname,
        newNickname: [],
        msg: 'newNickname not a string',
    },
    {
        oldNickname: nickname,
        newNickname: true,
        msg: 'newNickname not a string',
    },
    {
        oldNickname: nickname,
        newNickname: {},
        msg: 'newNickname not a string',
    },
];

test('FAIL changeNickname', async function (context) {
    const accResponse = await nodeFetch(`${baseUrl()}/newAcc`, accOptions);
    const cookie = accResponse.headers.get('set-cookie');
    const tests = await failBodies.map(async function (nickBody) {
        await context.test(nickBody.msg, async () => {
            const changeNickOptions = getPostOptions(nickBody, cookie);
            const response = await nodeFetch(`${baseUrl()}/changenickname`, changeNickOptions);
            const data = await response.json();

            return assert.strictEqual(data.error, 'INVALIDNICKNAME', nickBody.msg);
        });
    });

    await Promise.all(tests);
});
