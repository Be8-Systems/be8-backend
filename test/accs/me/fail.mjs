import test from 'node:test';
import assert from 'assert/strict';
import nodeFetch from 'node-fetch';
import { baseUrl, newAccOptions, getGetOptions } from '../../utils/utils.mjs';
import randomString from '../../utils/randomString.mjs';

const nickname = randomString(10);
const accOptions = newAccOptions(nickname);

test('FAIL me', async function () {
    await nodeFetch(`${baseUrl()}/newAcc`, accOptions);

    const cookie = 'invalid';
    const meOptions = getGetOptions(cookie);
    const response = await nodeFetch(`${baseUrl()}/me`, meOptions);
    const data = await response.json();
    
    return assert.strictEqual(data.error, 'NOTAUTH');
});