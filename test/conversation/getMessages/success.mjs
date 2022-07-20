import test from 'node:test';
import assert from 'assert/strict';
import nodeFetch from 'node-fetch';
import { baseUrl, newAccOptions, getPostOptions } from '../../utils/utils.mjs';
import randomString from '../../utils/randomString.mjs';

const nickname = randomString(10);
const firstAccOptions = newAccOptions(nickname);
const secondAccOptions = newAccOptions();

test('SUCCESS getMessages', async function () {
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
    // write message
    const writeBody = {
        receiver: secondAccData.accID + '',
        nickname,
        sender: firstAccData.accID + '',
        text: randomString(20),
        threadID: conversation.threadID,
        messageType: 'text',
        type: 'user'
    };
    const writeMessageOptions = getPostOptions(writeBody, cookie);
    const writeResponse = await nodeFetch(`${baseUrl}/writemessage`, writeMessageOptions);
    // get message
    const messagesBody = { threadID: conversation.threadID };
    const getMessagesOptions = getPostOptions(messagesBody, cookie);
    const messagesResponse = await nodeFetch(`${baseUrl}/getmessages`, getMessagesOptions);
    const messages = await messagesResponse.json();
    const systemMessage = messages.messages[0];
    const firstMessage = messages.messages[1];

    assert.strictEqual(messages.messages.length, 2);
    assert.strictEqual(systemMessage.messageID, '1');
    assert.strictEqual(systemMessage.messageType, 'system');
    assert.strictEqual(firstMessage.messageID, '2');
    assert.strictEqual(firstMessage.messageType, 'text');
    assert.strictEqual(firstMessage.receiver, secondAccData.accID + '');
    assert.strictEqual(firstMessage.sender, firstAccData.accID + '');
    assert.strictEqual(firstMessage.nickname, nickname);
    assert.strictEqual(firstMessage.threadID, conversation.threadID);
    return assert(messages.valid);
});
