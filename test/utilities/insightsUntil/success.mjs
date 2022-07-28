import test from 'node:test';
import assert from 'assert/strict';
import nodeFetch from 'node-fetch';
import { baseUrl, newAccOptions, getPostOptions } from '../../utils/utils.mjs';

const accOptions = newAccOptions();

test('SUCCESS insightsUntil', async function () {
    const accResponse = await nodeFetch(`${baseUrl}/newAcc`, accOptions);
    const cookie = accResponse.headers.get('set-cookie');
    const body = {
        start: '2022-07-01',
        end: '2022-07-28',
    };
    const insightOptions = getPostOptions(body, cookie);
    const response = await nodeFetch(`${baseUrl}/insightsuntil`, insightOptions);
    const { valid, insights } = await response.json();

    insights.forEach(function ({ insights, date }) {
        const parsedDate = new Date(date);

        assert.strictEqual(typeof parsedDate, 'object');
        assert.notStrictEqual(parsedDate.toString(), 'Invalid Date');
        assert.strictEqual(typeof insights, 'object');

        if (insights.length > 0) {
            insights.forEach(function (insight) {
                assert.strictEqual(typeof insight[0], 'string');
                assert.strictEqual(typeof parseInt(insight[1]), 'number');
                assert.notStrictEqual(parseInt(insight[1]).toString(), 'NaN');
            });
        }
    });

    return assert(valid);
});
