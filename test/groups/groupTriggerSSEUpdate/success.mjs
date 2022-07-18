import test from 'node:test';
import assert from 'assert/strict';
import nodeFetch from 'node-fetch';
import { baseUrl, newAccOptions, getPostOptions } from '../../utils/utils.mjs';
import randomString from '../../utils/randomString.mjs';

const accOptions = newAccOptions();
const accResponse = await nodeFetch(`${baseUrl}/newAcc`, accOptions);
const cookie = accResponse.headers.get('set-cookie');

test('SUCCESS groupTriggerSSEUpdate', async function () {
    // group create
    const groupBody = {
        nickname: randomString(7),
        groupType: 'public',
    };
    const groupOptions = getPostOptions(groupBody, cookie);
    const groupResponse = await nodeFetch(`${baseUrl}/groupcreate`, groupOptions);
    const group = await groupResponse.json();
    // group trigger sse update
    const updateBody = {
        groupID: group.groupID,
        update: 'joinmember',
    };
    const updateOptions = getPostOptions(updateBody, cookie);
    const updateResponse = await nodeFetch(`${baseUrl}/grouptriggersseupdate`, updateOptions);
    const update = await updateResponse.json();

    return assert(update.valid);
});
