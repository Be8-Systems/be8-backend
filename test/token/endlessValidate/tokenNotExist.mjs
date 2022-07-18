import test from 'node:test';
import assert from 'assert/strict';
import nodeFetch from 'node-fetch';
import { baseUrl, newAccOptions, getPostOptions } from '../../utils/utils.mjs';
import randomString from '../../utils/randomString.mjs';

const accOptions = newAccOptions();
const token = randomString(32);

test('SUCCESS token not existing', async function () {
    const accResponse = await nodeFetch(`${baseUrl}/newAcc`, accOptions);
    await accResponse.json();
    const cookie = accResponse.headers.get('set-cookie');
    const codeBody = {
        unlockCode: randomString(9),
        destroyCode: randomString(9),
    };
    const codeSetOptions = getPostOptions(codeBody, cookie);
    await nodeFetch(`${baseUrl}/codeset`, codeSetOptions);
    const endlessBody = {
        token,
    };
    const endlessOptions = getPostOptions(endlessBody, cookie);
    const response = await nodeFetch(`${baseUrl}/endlessvalidate`, endlessOptions);
    const data = await response.json();

    return assert.strictEqual(data.error, 'TOKENNOTEXIST');
});
