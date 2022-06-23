import test from 'node:test';
import assert from 'assert/strict';
import nodeFetch from 'node-fetch';
import { baseUrl, newAccOptions, getPostOptions } from '../../utils/utils.mjs';
import randomString from '../../utils/randomString.mjs';

const nickname1 = randomString(10);
const nickname2 = randomString(10);
const firstAccOptions = newAccOptions(nickname1);
const secondAccOptions = newAccOptions(nickname2);
const thirdAccOptions = newAccOptions();

test('FAIL groupGetMembers', async function () {
    // create accs
    const firstAcc = await nodeFetch(`${baseUrl()}/newAcc`, firstAccOptions);
    const secondAcc = await nodeFetch(`${baseUrl()}/newAcc`, secondAccOptions);
    const firstAccData = await firstAcc.json();
    const secondAccData = await secondAcc.json();
    const cookie = firstAcc.headers.get('set-cookie');
    const thirdAcc = await nodeFetch(`${baseUrl()}/newAcc`, thirdAccOptions);
    const thirdAccCookie = thirdAcc.headers.get('set-cookie');
    // create group
    const groupBody = {
        nickname: randomString(7),
        groupType: 'public',
    };
    const groupOptions = getPostOptions(groupBody, cookie);
    const groupResponse = await nodeFetch(`${baseUrl()}/groupcreate`, groupOptions);
    const group = await groupResponse.json();
    // add to group
    const addBody = {
        groupID: group.groupID,
        memberID: secondAccData.accID + '',
    };
    const addOptions = getPostOptions(addBody, cookie);
    const addResponse = await nodeFetch(`${baseUrl()}/groupaddmember`, addOptions);
    const added = await addResponse.json();
    // get members
    const membersBody = {
        groupID: group.groupID,
    };
    const membersOptions = getPostOptions(membersBody, thirdAccCookie);
    const membersResponse = await nodeFetch(`${baseUrl()}/groupgetmembers`, membersOptions);
    const failMembers = await membersResponse.json();

    assert.strictEqual(failMembers.reason, 'NOGROUPMEMBER');
    return assert(!failMembers.valid);
});
