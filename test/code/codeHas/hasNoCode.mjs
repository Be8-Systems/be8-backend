import test from 'node:test';
import assert from 'assert/strict';
import nodeFetch from 'node-fetch';
import { baseUrl, newAccOptions, getGetOptions } from '../../utils/utils.mjs';

const accOptions = newAccOptions();

test('SUCCESS hasNoCode', async function () {
    const accResponse = await nodeFetch(`${baseUrl}/newAcc`, accOptions);
    const cookie = accResponse.headers.get('set-cookie');
    const codeSetOptions = getGetOptions(cookie);
    const response = await nodeFetch(`${baseUrl}/codehas`, codeSetOptions);
    const data = await response.json();

    assert(!data.hasCode);
    return assert(data.valid);
});
