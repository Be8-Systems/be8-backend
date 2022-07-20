import test from 'node:test';
import assert from 'assert/strict';
import nodeFetch from 'node-fetch';
import { baseUrl, newAccOptions, getPostOptions, getGetOptions } from '../../utils/utils.mjs';
import randomString from '../../utils/randomString.mjs';

const accOptions = newAccOptions();

test('SUCCESS statusSet', async function () {
    const accResponse = await nodeFetch(`${baseUrl}/newAcc`, accOptions);
    const cookie = accResponse.headers.get('set-cookie');
    const statusBody = {
        userStatus: randomString(15),
    };
    const statusOptions = getPostOptions(statusBody, cookie);
    const response = await nodeFetch(`${baseUrl}/userstatusset`, statusOptions);
    const data = await response.json();
    const meOptions = getGetOptions(cookie);
    const meResponse = await nodeFetch(`${baseUrl}/me`, meOptions);
    const me = await meResponse.json();
    
    assert.strictEqual(me.accObj.status, statusBody.status);
    return assert(data.valid);
});
