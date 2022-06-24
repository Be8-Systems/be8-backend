import test from 'node:test';
import assert from 'assert/strict';
import nodeFetch from 'node-fetch';
import { baseUrl, newAccOptions, getPostOptions, getGetOptions } from '../../utils/utils.mjs';

const firstAccOptions = newAccOptions();
const secondAccOptions = newAccOptions();

test('SUCCESS getThreads', async function () {
    // create accs
    const firstAcc = await nodeFetch(`${baseUrl}/newAcc`, firstAccOptions);
    const secondAcc = await nodeFetch(`${baseUrl}/newAcc`, secondAccOptions);
    const firstAccData = await firstAcc.json();
    const secondAccData = await secondAcc.json();
    const cookie = firstAcc.headers.get('set-cookie');
    // start conversation
    const convBody = { receiverID: secondAccData.accID };
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
    assert.strictEqual(systemThread.type, 'system');
    assert.strictEqual(systemThread.nickname, 'be8');
    assert.strictEqual(systemThread.threadID, `${firstAccData.accID}:s1`);
    assert.strictEqual(firstConv.sender, secondAccData.accID + '');
    assert.strictEqual(firstConv.type, 'user');
    assert.strictEqual(firstConv.threadID, conversation.threadID);
    return assert(threads.valid);
});
