import test from 'node:test';
import assert from 'assert/strict';
import nodeFetch from 'node-fetch';
import { baseUrl, newAccOptions, getPostOptions } from '../../utils/utils.mjs';
import randomString from '../../utils/randomString.mjs';

const firstAccOptions = newAccOptions();
const secondAccOptions = newAccOptions();

test('SUCCESS groupIncreaseVersion', async function () {
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
    // increase version
    const increaseBody = {
        groupID: group.groupID,
    };
    const increaseOptions = getPostOptions(increaseBody, cookie);
    const increaseResponse = await nodeFetch(`${baseUrl}/groupincreaseversion`, increaseOptions);
    const increased = await increaseResponse.json();
    // get current version
    const versionOptions = getPostOptions({ groupID: group.groupID }, cookie);
    const currentVersionResponse = await nodeFetch(`${baseUrl}/groupgetcurrentversion`, versionOptions);
    const currentVersion = await currentVersionResponse.json();

    assert.strictEqual(currentVersion.groupVersion, increased.groupVersion + '');
    return assert(currentVersion.valid);
});
