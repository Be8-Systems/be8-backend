import test from 'node:test';
import assert from 'assert/strict';
import nodeFetch from 'node-fetch';
import { baseUrl, newAccOptions, getPostOptions } from '../../utils/utils.mjs';

const accOptions = newAccOptions();

test('SUCCESS setKey', async function () {
    // new acc
    const accResponse = await nodeFetch(`${baseUrl}/newAcc`, accOptions);
    const cookie = accResponse.headers.get('set-cookie');
    // setKey
    const setKeyBody = {};
    const setKeyOptions = getPostOptions(setKeyBody, cookie);
    const response = await nodeFetch(`${baseUrl}/setkey`, setKeyOptions);
    const data = await response.json();

    return assert(data.error, 'NOPUBLICKEY');
});
