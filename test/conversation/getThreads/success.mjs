import test from 'node:test';
import assert from 'assert/strict';
import nodeFetch from 'node-fetch';
import { baseUrl, newAccOptions, getPostOptions, getGetOptions } from '../../utils/utils.mjs';
import randomString from '../../utils/randomString.mjs';

const nickname = randomString(10);
const firstAccOptions = newAccOptions();
const secondAccOptions = newAccOptions(nickname);

test('SUCCESS getThreads', async function () {
    // create accs
    const firstAcc = await nodeFetch(`${baseUrl}/newAcc`, firstAccOptions);
    const secondAcc = await nodeFetch(`${baseUrl}/newAcc`, secondAccOptions);
    const firstAccData = await firstAcc.json();
    const secondAccData = await secondAcc.json();
    const cookie = firstAcc.headers.get('set-cookie');
    // start conversation
    const convBody = { receiverID: secondAccData.accID + '' };
    const startConversationOptions = getPostOptions(convBody, cookie);
    const convResponse = await nodeFetch(`${baseUrl}/startconversation`, startConversationOptions);
    const conversation = await convResponse.json();
    // get threads
    const getThreadsOptions = getGetOptions(cookie);
    const threadsResponse = await nodeFetch(`${baseUrl}/getthreads`, getThreadsOptions);
    const threads = await threadsResponse.json();
    const systemThread = threads.threads[0];
    const firstConv = threads.threads[1];

    assert.strictEqual(threads.threads.length, 2);
    assert.strictEqual(systemThread.sender, 's1');
    assert.strictEqual(systemThread.type, 'user');
    assert.strictEqual(systemThread.nickname, nickname);
    assert.strictEqual(systemThread.threadID, `${firstAccData.accID}:${secondAccData.accID}`);
    assert.strictEqual(firstConv.sender, 's1');
    assert.strictEqual(firstConv.type, 'system');
    return assert(threads.valid);
});
