import test from 'node:test';
import assert from 'assert/strict';
import nodeFetch from 'node-fetch';
import { baseUrl, newAccOptions, getPostOptions } from '../../utils/utils.mjs';

const accOptions = newAccOptions();
const publicKey = {
    crv: 'P-256',
    ext: true,
    key_ops: [],
    kty: 'EC',
    x: 'uNW5zLRC7-XKRu2JEatPdrKAuJPCf0lKTF3NBmdSghw',
    y: '83RxcSiQJelZ9QQeBKjSLXPcCOZAJizUFazgoSPPS-U',
};

test('FAIL getKey', async function (context) {
    // new acc
    const accResponse = await nodeFetch(`${baseUrl}/newAcc`, accOptions);
    const accData = await accResponse.json();
    const cookie = accResponse.headers.get('set-cookie');
    // setKey
    const setKeyBody = {
        publicKey,
    };
    const setKeyOptions = getPostOptions(setKeyBody, cookie);
    await nodeFetch(`${baseUrl}/setkey`, setKeyOptions);
    // fail getKey
    const failBodies = [
        {
            expected: 'MEMBERNOTEXISTING',
            msg: 'accID parameter is missing',
        },
        {
            accID: '',
            expected: 'MEMBERNOTEXISTING',
            msg: 'accID is not existing',
        },
        {
            accID: '23842372847',
            expected: 'MEMBERNOTEXISTING',
            msg: 'accID is not existing',
        },
        {
            accID: null,
            expected: 'MEMBERNOTEXISTING',
            msg: 'accID is not a string',
        },
        {
            accID: {},
            expected: 'MEMBERNOTEXISTING',
            msg: 'accID is not a string',
        },
        {
            accID: [],
            expected: 'MEMBERNOTEXISTING',
            msg: 'accID is not a string',
        },
        {
            accID: 1234,
            expected: 'MEMBERNOTEXISTING',
            msg: 'accID is not a string',
        },
    ];
    const tests = failBodies.map(async function (body) {
        await context.test(body.msg, async () => {
            const options = getPostOptions(body, cookie);
            const response = await nodeFetch(`${baseUrl}/getkey`, options);
            const data = await response.json();

            assert(!data.valid);
            return assert.strictEqual(data.reason, body.expected);
        });
    });

    await Promise.all(tests);
});
