import test from 'node:test';
import assert from 'assert/strict';
import nodeFetch from 'node-fetch';
import { baseUrl, newAccOptions, getPostOptions } from '../utils/utils.mjs';
import randomString from '../utils/randomString.mjs';

const firstAccOptions = newAccOptions();
const secondAccOptions = newAccOptions();

test('groupJoinMember', async function () {
    // create accs
    const firstAcc = await nodeFetch(`${baseUrl()}/newAcc`, firstAccOptions);
    const secondAcc = await nodeFetch(`${baseUrl()}/newAcc`, secondAccOptions);
    const secondAccData = await secondAcc.json();
    const cookie = firstAcc.headers.get('set-cookie');
    // create group
    const groupBody = {
        nickname: randomString(7),
        groupType: 'public'
    };
    const groupOptions = getPostOptions(groupBody, cookie);
    const groupResponse = await nodeFetch(`${baseUrl()}/groupcreate`, groupOptions);
    const group = await groupResponse.json();
    // join group
    const joinBody = {
        groupID: group.groupID
    };
    const joinOptions = getPostOptions(joinBody, secondAcc.headers.get('set-cookie'));
    const joinResponse = await nodeFetch(`${baseUrl()}/groupjoinmember`, joinOptions);
    const joined = await joinResponse.json();
    
    return assert(joined.valid);
});