import test from 'node:test';
import assert from 'assert/strict';
import nodeFetch from 'node-fetch';
import { baseUrl, newAccOptions, getPostOptions } from '../../utils/utils.mjs';
import randomString from '../../utils/randomString.mjs';

const firstAccOptions = newAccOptions();
const secondAccOptions = newAccOptions();

test('SUCCESS groupKickMember', async function () {
    // create accs
    const firstAcc = await nodeFetch(`${baseUrl}/newAcc`, firstAccOptions);
    const secondAcc = await nodeFetch(`${baseUrl}/newAcc`, secondAccOptions);
    const secondAccData = await secondAcc.json();
    const cookie = firstAcc.headers.get('set-cookie');
    // create group
    const groupBody = {
        nickname: randomString(7),
        groupType: 'public',
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
    // kicked from group
    const kickBody = {
        groupID: group.groupID,
        accID: secondAccData.accID + '',
    };
    const kickOptions = getPostOptions(kickBody, cookie);
    const kickResponse = await nodeFetch(`${baseUrl}/groupkickmember`, kickOptions);
    const kicked = await kickResponse.json();

    return assert(kicked.valid);
});
