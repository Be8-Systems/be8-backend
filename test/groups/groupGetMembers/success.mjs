import test from 'node:test';
import assert from 'assert/strict';
import nodeFetch from 'node-fetch';
import { baseUrl, newAccOptions, getPostOptions } from '../../utils/utils.mjs';
import randomString from '../../utils/randomString.mjs';

const nickname1 = randomString(10);
const nickname2 = randomString(10);
const firstAccOptions = newAccOptions(nickname1);
const secondAccOptions = newAccOptions(nickname2);

test('SUCCESS groupGetMembers', async function () {
    // create accs
    const firstAcc = await nodeFetch(`${baseUrl}/newAcc`, firstAccOptions);
    const secondAcc = await nodeFetch(`${baseUrl}/newAcc`, secondAccOptions);
    const firstAccData = await firstAcc.json();
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
    // get members
    const membersBody = {
        groupID: group.groupID,
    };
    const membersOptions = getPostOptions(membersBody, cookie);
    const membersResponse = await nodeFetch(`${baseUrl}/groupgetmembers`, membersOptions);
    const members = await membersResponse.json();
    const member1 = members.members[0];
    const member2 = members.members[1];

    assert.strictEqual(member1.id, firstAccData.accID + '');
    assert.strictEqual(member1.type, 'user');
    assert.strictEqual(member1.nickname, nickname1);
    assert.strictEqual(member2.id, secondAccData.accID + '');
    assert.strictEqual(member2.type, 'user');
    assert.strictEqual(member2.nickname, nickname2);
    return assert(members.valid);
});
