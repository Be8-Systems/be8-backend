import test from 'node:test';
import assert from 'assert/strict';
import nodeFetch from 'node-fetch';
import { baseUrl, newAccOptions, getPostOptions } from '../../utils/utils.mjs';
import randomString from '../../utils/randomString.mjs';

const firstAccOptions = newAccOptions();
const secondAccOptions = newAccOptions();
const thirdAccOptions = newAccOptions();
const groupKey = 'J8KFhFn+obMLmvcJVc0rOocIgDvK3EWApKERyStxltLYViM8QmSc5+8H09cvbi3xGRuVfocSWXtGyamSKbxyfC721PGKM4KXUkGKLq+UJbj2HcPsUjki/kwmajGFbRbj6x8vNQ4CaaUER3s668Kzcvq/9s329crMPnXg/tzrZXfWJmAM9dqt5Rk4LyOcB7xDDniLOTQmSk3sKOJ3Pk0aLfydj3dmr1fBJrfPBdPIDqIdRN/FCySqcsgiLWanT0s5dqk9k1hurWmZdbuHjCiF2wa+NWGKydQF6Vk9Ve5L/iRJgvXFNXk6q24u6PPFaWIJ';

test('FAIL groupGetKeys', async function () {
    // create accs
    const firstAcc = await nodeFetch(`${baseUrl()}/newAcc`, firstAccOptions);
    const secondAcc = await nodeFetch(`${baseUrl()}/newAcc`, secondAccOptions);
    const secondAccData = await secondAcc.json();
    const accID = secondAccData.accID + '';
    const cookie = firstAcc.headers.get('set-cookie');
    const thirdAcc = await nodeFetch(`${baseUrl()}/newAcc`, thirdAccOptions);
    const thirdCookie = thirdAcc.headers.get('set-cookie');
    // create group
    const groupBody = {
        nickname: randomString(7),
        groupType: 'public'
    };
    const groupOptions = getPostOptions(groupBody, cookie);
    const groupResponse = await nodeFetch(`${baseUrl()}/groupcreate`, groupOptions);
    const group = await groupResponse.json();
    // add to group
    const addBody = {
        groupID: group.groupID,
        memberID: accID
    };
    const addOptions = getPostOptions(addBody, cookie);
    const addResponse = await nodeFetch(`${baseUrl()}/groupaddmember`, addOptions);
    // store key
    const storeBody = {
        accID,
        groupID: group.groupID,
        groupKey, 
        keyholder: accID
    };
    const storeOptions = getPostOptions(storeBody, cookie);
    const storeResponse = await nodeFetch(`${baseUrl()}/groupstorekey`, storeOptions);
    const stored = await storeResponse.json();
    // failing because non group member (third acc cookies) trying to get keys
    const keysBody = {
        accID,
        groupID: group.groupID
    };
    const keysOptions = getPostOptions(keysBody, thirdCookie);
    const keysResponse = await nodeFetch(`${baseUrl()}/groupgetkeys`, keysOptions);
    const keyRes = await keysResponse.json();
    
    assert.strictEqual(keyRes.reason, 'NOGROUPMEMBER');
    return assert(!keyRes.valid);
});