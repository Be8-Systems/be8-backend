import test from 'node:test';
import assert from 'assert/strict';
import nodeFetch from 'node-fetch';
import { baseUrl, newAccOptions, getPostOptions } from '../../utils/utils.mjs';
import randomString from '../../utils/randomString.mjs';

const firstAccOptions = newAccOptions();
const secondAccOptions = newAccOptions();
const thirdAccOptions = newAccOptions();

test('FAIL groupJoinMember maxReached', async function () {
    // create accs
    const firstAcc = await nodeFetch(`${baseUrl()}/newAcc`, firstAccOptions);
    const secondAcc = await nodeFetch(`${baseUrl()}/newAcc`, secondAccOptions);
    const thirdAcc = await nodeFetch(`${baseUrl()}/newAcc`, thirdAccOptions);
    const cookie = firstAcc.headers.get('set-cookie');
    const secondAccCookie = secondAcc.headers.get('set-cookie');
    const thirdAccCookie = thirdAcc.headers.get('set-cookie');
    // create group
    const groupBody = {
        nickname: randomString(7),
        groupType: 'public',
        maxMembers: 2,
    };
    const groupOptions = getPostOptions(groupBody, cookie);
    const groupResponse = await nodeFetch(`${baseUrl()}/groupcreate`, groupOptions);
    const group = await groupResponse.json();
    // join group
    const joinBody = {
        groupID: group.groupID,
    };
    const joinOptions = getPostOptions(joinBody, secondAccCookie);
    const joinResponse = await nodeFetch(`${baseUrl()}/groupjoinmember`, joinOptions);
    const joined = await joinResponse.json();
    // third acc is too much
    const joinThirdBody = {
        groupID: group.groupID,
    };

    const joinThirdOptions = getPostOptions(joinThirdBody, thirdAccCookie);
    const joinThirdResponse = await nodeFetch(`${baseUrl()}/groupjoinmember`, joinThirdOptions);
    const joinedThird = await joinThirdResponse.json();

    return assert.strictEqual(joinedThird.error, 'GROUPMAXREACHED');
});
