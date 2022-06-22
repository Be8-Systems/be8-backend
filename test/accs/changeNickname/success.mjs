import test from 'node:test';
import assert from 'assert/strict';
import nodeFetch from 'node-fetch';
import { baseUrl, newAccOptions, getPostOptions } from '../../utils/utils.mjs';
import randomString from '../../utils/randomString.mjs';

const nickname = randomString(10);
const accOptions = newAccOptions(nickname);

test('SUCCESS changeNickname', async function () {
    const accResponse = await nodeFetch(`${baseUrl()}/newAcc`, accOptions);
    const cookie = accResponse.headers.get('set-cookie');
    const nickBody = {
        oldNickname: nickname,
        newNickname: randomString(9),
    };
    const changeNickOptions = getPostOptions(nickBody, cookie);
    const response = await nodeFetch(
        `${baseUrl()}/changenickname`,
        changeNickOptions
    );
    const data = await response.json();

    return assert(data.valid);
});
