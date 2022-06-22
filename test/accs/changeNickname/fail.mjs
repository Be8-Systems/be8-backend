import test from 'node:test';
import assert from 'assert/strict';
import nodeFetch from 'node-fetch';
import { baseUrl, newAccOptions, getPostOptions } from '../../utils/utils.mjs';
import randomString from '../../utils/randomString.mjs';

const nickname = randomString(10);
const accOptions = newAccOptions(nickname);
const failBodies = [
    {
        oldNickname: nickname,
        // new nick missing
    },
    {
        oldNickname: nickname,
        newNickname: '', // new nick too short (min length 1)
    },
    {
        oldNickname: nickname,
        newNickname: randomString(21), // new nick too long (max length 20)
    },
    {
        oldNickname: nickname,
        newNickname: 100, // new nick not a string
    },
];

test('FAIL changeNickname', async function () {
    const accResponse = await nodeFetch(`${baseUrl()}/newAcc`, accOptions);
    const cookie = accResponse.headers.get('set-cookie');
    const proms = failBodies.map(function (nickBody) {
        const changeNickOptions = getPostOptions(nickBody, cookie);
        return nodeFetch(`${baseUrl()}/changenickname`, changeNickOptions);
    });
    const responses = await Promise.all(proms);

    responses.forEach(async function (response) {
        const data = await response.json();
        assert.strictEqual(data.error, 'INVALIDNICKNAME');
    });
});
