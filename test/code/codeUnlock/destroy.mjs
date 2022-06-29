import test from 'node:test';
import assert from 'assert/strict';
import nodeFetch from 'node-fetch';
import { baseUrl, newAccOptions, getPostOptions, getGetOptions } from '../../utils/utils.mjs';
import randomString from '../../utils/randomString.mjs';

const accOptions = newAccOptions();

test('SUCCESS codeDestroy', async function () {
    const accResponse = await nodeFetch(`${baseUrl}/newAcc`, accOptions);
    const cookie = accResponse.headers.get('set-cookie');
    const codeBody = {
        unlockCode: randomString(9),
        destroyCode: randomString(9),
    };
    const codeSetOptions = getPostOptions(codeBody, cookie);
    await nodeFetch(`${baseUrl}/codeset`, codeSetOptions);
    const unlockBody = {
        code: codeBody.destroyCode
    };
    const unlockOptions = getPostOptions(unlockBody, cookie);
    const response = await nodeFetch(`${baseUrl}/codeunlock`, unlockOptions);
    const data = await response.json();
    const meOptions = getGetOptions(cookie);
    const meResponse = await nodeFetch(`${baseUrl}/me`, meOptions);
    const me = await meResponse.json();
    
    assert.strictEqual(me.error, 'NOTAUTH');
    assert(data.isDestroyCode);
    return assert(data.valid);
});
