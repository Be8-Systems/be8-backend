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

test('SUCCESS setKey', async function () {
    // new acc
    const accResponse = await nodeFetch(`${baseUrl}/newAcc`, accOptions);
    const cookie = accResponse.headers.get('set-cookie');
    // setKey
    const setKeyBody = {
        publicKey,
    };
    const setKeyOptions = getPostOptions(setKeyBody, cookie);
    const response = await nodeFetch(`${baseUrl}/setkey`, setKeyOptions);
    const data = await response.json();

    return assert(data.valid);
});
