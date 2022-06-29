import test from 'node:test';
import assert from 'assert/strict';
import nodeFetch from 'node-fetch';
import { baseUrl, newAccOptions, getPostOptions } from '../../utils/utils.mjs';
import randomString from '../../utils/randomString.mjs';
import redis from '../../../lib/util/redis.mjs';

const accOptions = newAccOptions();

test('SUCCESS update destroyCode', async function () {
    const accResponse = await nodeFetch(`${baseUrl}/newAcc`, accOptions);
    const accData = await accResponse.json();
    const cookie = accResponse.headers.get('set-cookie');
    const codeBody = {
        unlockCode: randomString(9),
        destroyCode: randomString(9),
    };
    const codeSetOptions = getPostOptions(codeBody, cookie);
    await nodeFetch(`${baseUrl}/codeset`, codeSetOptions);
    const updateBody = {
        code: randomString(10),
        codeType: 'destroy'
    };
    const updateOptions = getPostOptions(updateBody, cookie);
    const response = await nodeFetch(`${baseUrl}/codeupdate`, updateOptions);
    const data = await response.json();
    const { unlockCode, destroyCode }  = await redis.hGetAll(`codes:${accData.accID}`);
    
    await redis.disconnect();
    assert.strictEqual(unlockCode, codeBody.unlockCode);
    assert.strictEqual(destroyCode, updateBody.code);
    assert(data.destroyUpdated);
    return assert(data.valid);
});
