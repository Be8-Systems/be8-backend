import test from 'node:test';
import assert from 'assert/strict';
import nodeFetch from 'node-fetch';
import { baseUrl, newAccOptions, getGetOptions } from '../../utils/utils.mjs';
import randomString from '../../utils/randomString.mjs';

const nickname = randomString(10);
const accOptions = newAccOptions(nickname);

test('SUCCESS insights', async function () {
    const accResponse = await nodeFetch(`${baseUrl()}/newAcc`, accOptions);
    const cookie = accResponse.headers.get('set-cookie');
    const meOptions = getGetOptions(cookie);
    const response = await nodeFetch(`${baseUrl()}/insights`, meOptions);
    const insights = await response.json();

    insights.insight.forEach(function (insight) {
        const parsedIns = parseInt(insight);

        assert.strictEqual(typeof parsedIns, 'number');
        assert.notStrictEqual(parsedIns.toString(), 'NaN');
    });

    return assert(insights.valid);
});
