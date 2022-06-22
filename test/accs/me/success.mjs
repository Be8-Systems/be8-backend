import test from 'node:test';
import assert from 'assert/strict';
import nodeFetch from 'node-fetch';
import { baseUrl, newAccOptions, getGetOptions } from '../../utils/utils.mjs';
import randomString from '../../utils/randomString.mjs';

const nickname = randomString(10);
const accOptions = newAccOptions(nickname);

test('SUCCESS me', async function () {
    const accResponse = await nodeFetch(`${baseUrl()}/newAcc`, accOptions);
    const cookie = accResponse.headers.get('set-cookie');
    const meOptions = getGetOptions(cookie);
    const response = await nodeFetch(`${baseUrl()}/me`, meOptions);
    const data = await response.json();

    assert.strictEqual(typeof data.accObj, 'object');
    assert.strictEqual(typeof data.accObj.nickname, 'string');
    assert.strictEqual(typeof data.accObj.type, 'string');
    assert.strictEqual(typeof data.accObj.expire, 'string');
    assert.strictEqual(typeof data.accObj.id, 'string');
    assert.strictEqual(typeof data.accID, 'string');
    assert.strictEqual(data.accObj.nickname, nickname);
    return assert(data.valid);
});
