import test from 'node:test';
import assert from 'assert/strict';
import nodeFetch from 'node-fetch';
import { baseUrl, newAccOptions, getPostOptions, getGetOptions } from '../../utils/utils.mjs';
import randomString from '../../utils/randomString.mjs';

const nickname = randomString(10);
const accOptions = newAccOptions(nickname);

test('SUCCESS changeNickname', async function () {
    const accResponse = await nodeFetch(`${baseUrl}/newAcc`, accOptions);
    const cookie = accResponse.headers.get('set-cookie');
    const nickBody = {
        oldNickname: nickname,
        newNickname: randomString(9),
    };
    const changeNickOptions = getPostOptions(nickBody, cookie);
    const response = await nodeFetch(`${baseUrl}/changenickname`, changeNickOptions);
    const data = await response.json();
    const meOptions = getGetOptions(cookie);
    const meResponse = await nodeFetch(`${baseUrl}/me`, meOptions);
    const me = await meResponse.json();

    assert.strictEqual(me.accObj.nickname, nickBody.newNickname);
    return assert(data.valid);
});
