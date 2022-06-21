import test from 'node:test';
import assert from 'assert/strict';
import nodeFetch from 'node-fetch';
import { baseUrl, newAccOptions, getPostOptions } from '../utils/utils.mjs';
import randomString from '../utils/randomString.mjs';

const accOptions = newAccOptions();

test('groupCreate', async function () {
    const accResponse = await nodeFetch(`${baseUrl()}/newAcc`, accOptions);
    const cookie = accResponse.headers.get('set-cookie');
    const groupBody = {
        nickname: randomString(7),
        groupType: 'public'
    };
    const groupOptions = getPostOptions(groupBody, cookie);
    const groupResponse = await nodeFetch(`${baseUrl()}/groupcreate`, groupOptions);
    const group = await groupResponse.json();
    
    assert.strictEqual(typeof group.groupID, 'string');
    assert(group.groupID.includes('g'));
    return assert(group.valid);
});