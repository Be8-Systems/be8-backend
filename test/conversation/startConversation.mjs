import test from 'node:test';
import assert from 'assert/strict';
import nodeFetch from 'node-fetch';
import { baseUrl, newAccOptions, getPostOptions } from '../utils/utils.mjs';

const firstAccOptions = newAccOptions();
const secondAccOptions = newAccOptions();

test('startConversation', async function () {
    // create accs
    const firstAcc = await nodeFetch(`${baseUrl()}/newAcc`, firstAccOptions);
    const secondAcc = await nodeFetch(`${baseUrl()}/newAcc`, secondAccOptions);
    const firstAccData = await firstAcc.json();
    const secondAccData = await secondAcc.json();
    const cookie = firstAcc.headers.get('set-cookie');
    // start conversation
    const convBody = { receiverID: secondAccData.accID };
    const startConversationOptions = getPostOptions(convBody, cookie);
    const convResponse = await nodeFetch(`${baseUrl()}/startconversation`, startConversationOptions);
    const conversation = await convResponse.json();
    const checkThreadID = `${firstAccData.accID}:${secondAccData.accID}`;
    
    assert.strictEqual(conversation.threadID, checkThreadID);
    return assert(conversation.valid);
});