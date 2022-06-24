import test from 'node:test';
import assert from 'assert/strict';
import nodeFetch from 'node-fetch';
import { baseUrl, newAccOptions, getPostOptions } from '../../utils/utils.mjs';
import randomString from '../../utils/randomString.mjs';

const firstAccOptions = newAccOptions();
const secondAccOptions = newAccOptions();
const thirdAccOptions = newAccOptions();

test('FAIL groupAddMember maxReached', async function () {
    // create accs
    const firstAcc = await nodeFetch(`${baseUrl}/newAcc`, firstAccOptions);
    const secondAcc = await nodeFetch(`${baseUrl}/newAcc`, secondAccOptions);
    const secondAccData = await secondAcc.json();
    const thirdAcc = await nodeFetch(`${baseUrl}/newAcc`, thirdAccOptions);
    const thirdAccData = await thirdAcc.json();
    const cookie = firstAcc.headers.get('set-cookie');
    // create group
    const groupBody = {
        nickname: randomString(7),
        groupType: 'public',
        maxMembers: 2,
    };
    const groupOptions = getPostOptions(groupBody, cookie);
    const groupResponse = await nodeFetch(`${baseUrl}/groupcreate`, groupOptions);
    const group = await groupResponse.json();
    // add to group
    const addBody = {
        groupID: group.groupID,
        memberID: secondAccData.accID + '',
    };
    const addOptions = getPostOptions(addBody, cookie);
    const addResponse = await nodeFetch(`${baseUrl}/groupaddmember`, addOptions);
    const added = await addResponse.json();
    // third acc is too much
    const addThirdBody = {
        groupID: group.groupID,
        memberID: thirdAccData.accID + '',
    };

    const addThirdOptions = getPostOptions(addThirdBody, cookie);
    const addThirdResponse = await nodeFetch(`${baseUrl}/groupaddmember`, addThirdOptions);
    const addedThird = await addThirdResponse.json();

    return assert.strictEqual(addedThird.error, 'GROUPMAXREACHED');
});
