import test from 'node:test';
import assert from 'assert/strict';
import nodeFetch from 'node-fetch';
import { baseUrl, newAccOptions, getPostOptions, getGetOptions } from '../utils/utils.mjs';
import randomString from '../utils/randomString.mjs';

test('FAIL getMessages', async function (context) {
    const accOptions = newAccOptions();
    const accResponse = await nodeFetch(`${baseUrl}/newAcc`, accOptions);
    const acc = await accResponse.json();
    const validCookie = accResponse.headers.get('set-cookie');
    const groupBody = {
        nickname: randomString(7),
        groupType: 'public',
    };
    const groupOptions = getPostOptions(groupBody, validCookie);
    const groupResponse = await nodeFetch(`${baseUrl}/groupcreate`, groupOptions);
    const group = await groupResponse.json();
    const invalidCookie = 'invalid';
    const body = {
        groupID: group.groupID,
        accID: acc.accID + ''
    };
    const postOptions = getPostOptions(body, invalidCookie);
    const getOptions = getGetOptions(invalidCookie);
    const routesWithAuth = [
        [`${baseUrl}/me`, getOptions],
        [`${baseUrl}/changenickname`, postOptions],
        [`${baseUrl}/getmessages`, postOptions],
        [`${baseUrl}/getthreads`, getOptions],
        [`${baseUrl}/startconversation`, postOptions],
        [`${baseUrl}/writemessage`, postOptions],
        [`${baseUrl}/groupaddmember`, postOptions],
        [`${baseUrl}/groupcreate`, postOptions],
        [`${baseUrl}/groupgetcurrentversion`, postOptions],
        [`${baseUrl}/groupgetkeys`, postOptions],
        [`${baseUrl}/groupgetmembers`, postOptions],
        [`${baseUrl}/groupjoinmember`, postOptions],
        [`${baseUrl}/groupkickmember`, postOptions],
        [`${baseUrl}/groupleavemember`, postOptions],
        [`${baseUrl}/groupstorekey`, postOptions],
        [`${baseUrl}/invitelink`, postOptions],
        [`${baseUrl}/getkey`, postOptions],
        [`${baseUrl}/getkeys`, postOptions],
        [`${baseUrl}/setkey`, postOptions],
        [`${baseUrl}/insights`, getOptions],
        [`${baseUrl}/subscribe`, postOptions],
        [`${baseUrl}/codehas`, getOptions],
        [`${baseUrl}/codeset`, postOptions],
        [`${baseUrl}/codeunlock`, postOptions],
        [`${baseUrl}/codeupdate`, postOptions],
        [`${baseUrl}/endlessvalidate`, postOptions]
    ];

    const tests = await routesWithAuth.map(async function (options) {
        await context.test(options[0], async () => {
            const response = await nodeFetch(...options);
            const data = await response.json();

            return assert.strictEqual(data.error, 'NOTAUTH');
        });
    });

    return await Promise.all(tests);
});
