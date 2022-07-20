import test from 'node:test';
import assert from 'assert/strict';
import nodeFetch from 'node-fetch';
import { baseUrl, newAccOptions, getPostOptions } from '../../utils/utils.mjs';
import randomString from '../../utils/randomString.mjs';

const nickname = randomString(10);
const firstAccOptions = newAccOptions(nickname);
const secondAccOptions = newAccOptions();

test('FAIL writeMessage', async function (context) {
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
    // fail messages
    const validMessage = {
        receiver: secondAccData.accID + '',
        nickname,
        sender: firstAccData.accID + '',
        text: randomString(20),
        threadID: conversation.threadID,
        messageType: 'textMessage',
    };
    const failBodies = [
        {
            ...validMessage,
            receiver: '1323424342323',
            expected: 'ACCNOTEXISTS',
            msg: 'receiver id does not exist.',
        },
        {
            ...validMessage,
            receiver: [],
            expected: 'ACCNOTEXISTS',
            msg: 'receiver id does not exist.',
        },
        {
            ...validMessage,
            receiver: '',
            expected: 'ACCNOTEXISTS',
            msg: 'receiver id does not exist.',
        },
        {
            ...validMessage,
            receiver: {},
            expected: 'ACCNOTEXISTS',
            msg: 'receiver id does not exist.',
        },
        {
            ...validMessage,
            sender: '1323424342323',
            expected: 'ACCNOTEXISTS',
            msg: 'sender id does not exist.',
        },
        {
            ...validMessage,
            sender: [],
            expected: 'ACCNOTEXISTS',
            msg: 'sender id does not exist.',
        },
        {
            ...validMessage,
            sender: '',
            expected: 'ACCNOTEXISTS',
            msg: 'sender id does not exist.',
        },
        {
            ...validMessage,
            sender: {},
            expected: 'ACCNOTEXISTS',
            msg: 'sender id does not exist.',
        },
        {
            ...validMessage,
            threadID: '392539458:3945495849589',
            expected: 'INVALIDTHREADID',
            msg: 'thread id does not exist.',
        },
        {
            ...validMessage,
            threadID: [],
            expected: 'INVALIDTHREADID',
            msg: 'threadID is not a string',
        },
        {
            ...validMessage,
            threadID: {},
            expected: 'INVALIDTHREADID',
            msg: 'threadID is not a string',
        },
        {
            ...validMessage,
            threadID: 123,
            expected: 'INVALIDTHREADID',
            msg: 'threadID is not a string',
        },
        {
            ...validMessage,
            threadID: false,
            expected: 'INVALIDTHREADID',
            msg: 'threadID is not a string',
        },
        {
            ...validMessage,
            messageType: 'blaMessage',
            expected: 'INVALIDMESSAGETYPE',
            msg: 'wrong messagemessageType',
        },
        {
            ...validMessage,
            messageType: false,
            expected: 'INVALIDMESSAGETYPE',
            msg: 'messagemessageType is not a string',
        },
        {
            ...validMessage,
            messageType: '',
            expected: 'INVALIDMESSAGETYPE',
            msg: 'messagemessageType is not a string',
        },
        {
            ...validMessage,
            messageType: {},
            expected: 'INVALIDMESSAGETYPE',
            msg: 'messagemessageType is not a string',
        },
        {
            ...validMessage,
            messageType: [],
            expected: 'INVALIDMESSAGETYPE',
            msg: 'messagemessageType is not a string',
        },
        {
            ...validMessage,
            messageType: 123,
            expected: 'INVALIDMESSAGETYPE',
            msg: 'messagemessageType is not a string',
        },
    ];

    const tests = await failBodies.map(async function (body) {
        await context.test(body.msg, async () => {
            const options = getPostOptions(body, cookie);
            const response = await nodeFetch(`${baseUrl}/writemessage`, options);
            const data = await response.json();

            return assert.strictEqual(data.error, body.expected);
        });
    });

    await Promise.all(tests);
});
