import test from 'node:test';
import assert from 'assert/strict';
import nodeFetch from 'node-fetch';
import { baseUrl, newAccOptions, getPostOptions } from '../../utils/utils.mjs';
import randomString from '../../utils/randomString.mjs';

const firstAccOptions = newAccOptions();
const secondAccOptions = newAccOptions();

test('FAIL groupGetCurrentVersion', async function () {
    // create accs
    const firstAcc = await nodeFetch(`${baseUrl()}/newAcc`, firstAccOptions);
    const secondAcc = await nodeFetch(`${baseUrl()}/newAcc`, secondAccOptions);
    const cookie = firstAcc.headers.get('set-cookie');
    const nonGroupCookie = secondAcc.headers.get('set-cookie');
    // create group
    const groupBody = {
        nickname: randomString(7),
        groupType: 'public',
    };
    const groupOptions = getPostOptions(groupBody, cookie);
    const groupResponse = await nodeFetch(`${baseUrl()}/groupcreate`, groupOptions);
    const group = await groupResponse.json();
    // get current version
    const versionOptions = getPostOptions({ groupID: group.groupID }, nonGroupCookie);
    const currentVersionResponse = await nodeFetch(`${baseUrl()}/groupgetcurrentversion`, versionOptions);
    const failVersion = await currentVersionResponse.json();

    assert.strictEqual(failVersion.reason, 'NOGROUPMEMBER');
    return assert(!failVersion.valid);
});
