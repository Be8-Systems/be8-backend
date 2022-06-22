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

test('SUCCESS getKey', async function () {
    // new acc
    const accResponse = await nodeFetch(`${baseUrl()}/newAcc`, accOptions);
    const accData = await accResponse.json();
    const cookie = accResponse.headers.get('set-cookie');
    // setKey
    const setKeyBody = {
        publicKey
    };
    const setKeyOptions = getPostOptions(setKeyBody, cookie);
    const response = await nodeFetch(`${baseUrl()}/setkey`, setKeyOptions);
    // getKey
    const getKeyBody = {
        accID: accData.accID + ''
    };
    const getKeyOptions = getPostOptions(getKeyBody, cookie);
    const getResponse = await nodeFetch(`${baseUrl()}/getkey`, getKeyOptions);
    const data = await getResponse.json();
    const fetchedKey = data.publicKey;
    
    assert.strictEqual(typeof fetchedKey, 'object');
    assert.strictEqual(fetchedKey.crv, publicKey.crv);
    assert.strictEqual(fetchedKey.ext, publicKey.ext + '');
    assert.strictEqual(fetchedKey.kty, publicKey.kty);
    assert.strictEqual(fetchedKey.x, publicKey.x);
    assert.strictEqual(fetchedKey.y, publicKey.y);
    assert(fetchedKey.key_ops.includes('deriveKey'));
    assert(fetchedKey.key_ops.includes('deriveBits'));
    return assert(data.valid);
});