import test from 'node:test';
import assert from 'assert/strict';
import nodeFetch from 'node-fetch';
import { baseUrl, newAccOptions, getPostOptions } from '../../utils/utils.mjs';
import randomString from '../../utils/randomString.mjs';

const nickname = randomString(10);
const firstAccOptions = newAccOptions(nickname);
const secondAccOptions = newAccOptions();

test('SUCCESS writeMessage', async function () {
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
    // write message
    const writeBody = {
        receiver: secondAccData.accID + '',
        nickname,
        sender: firstAccData.accID + '',
        text: randomString(20),
        threadID: conversation.threadID,
        type: 'textMessage',
    };
    const writeMessageOptions = getPostOptions(writeBody, cookie);
    const writeResponse = await nodeFetch(`${baseUrl}/writemessage`, writeMessageOptions);
    const write = await writeResponse.json();
    const messageID = `message:${conversation.threadID}:2`;

    assert.strictEqual(write.messageID, messageID);
    return assert(write.valid);
});
