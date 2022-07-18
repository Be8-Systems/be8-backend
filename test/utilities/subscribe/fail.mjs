import test from 'node:test';
import assert from 'assert/strict';
import nodeFetch from 'node-fetch';
import { baseUrl, newAccOptions, getPostOptions } from '../../utils/utils.mjs';
import randomString from '../../utils/randomString.mjs';

const nickname = randomString(10);
const accOptions = newAccOptions(nickname);
const validSubscribe = {
    endpoint:
        'https://fcm.googleapis.com/fcm/send/cOq4sGoWZQI:APA91bEWnQ-5W0yB2E58bdf_pVVKvxn3cB4k3GkG2H0R2BQ2RgKYOY7AmO53OmAICU7wacRjWQZ02EeGZVNeO31hWcRD-QYFXHBVaVKvVGWdOj13XtQd3zx_erl5rOo4pmt7hkq3LQP7',
    expirationTime: null,
    keys: {
        p256dh: 'BJ5iO_p2tZ7b-t60jz_ax6msZ_rlhySfz_y7lXGvOgb8gGXeLuYJ5lwssbc5iZhlnd9NBEO_4-E9M9BRxiJskek',
        auth: 'eKOsJ8KlLI6OAWzNmn6Dow',
    },
};

test('FAIL subscribe', async function (context) {
    const accResponse = await nodeFetch(`${baseUrl}/newAcc`, accOptions);
    const accData = await accResponse.json();
    const cookie = accResponse.headers.get('set-cookie');
    const failBodies = [
        {
            expected: 'INVALIDSUBSCRIBE',
            msg: 'all properties are missing',
        },
        {
            ...validSubscribe,
            endpoint: 'bla',
            expected: 'INVALIDSUBSCRIBE',
            msg: 'endpoint is not valid',
        },
        {
            ...validSubscribe,
            endpoint: '',
            expected: 'INVALIDSUBSCRIBE',
            msg: 'endpoint is not valid',
        },
        {
            ...validSubscribe,
            endpoint: null,
            expected: 'INVALIDSUBSCRIBE',
            msg: 'endpoint is not valid',
        },
        {
            ...validSubscribe,
            endpoint: {},
            expected: 'INVALIDSUBSCRIBE',
            msg: 'endpoint is not valid',
        },
        {
            ...validSubscribe,
            endpoint: [],
            expected: 'INVALIDSUBSCRIBE',
            msg: 'endpoint is not valid',
        },
        {
            ...validSubscribe,
            endpoint: 1234,
            expected: 'INVALIDSUBSCRIBE',
            msg: 'endpoint is not valid',
        },
        {
            ...validSubscribe,
            expirationTime: '',
            expected: 'INVALIDSUBSCRIBE',
            msg: 'expirationTime is not valid',
        },
        {
            ...validSubscribe,
            expirationTime: true,
            expected: 'INVALIDSUBSCRIBE',
            msg: 'expirationTime is not valid',
        },
        {
            ...validSubscribe,
            expirationTime: {},
            expected: 'INVALIDSUBSCRIBE',
            msg: 'expirationTime is not valid',
        },
        {
            ...validSubscribe,
            expirationTime: [],
            expected: 'INVALIDSUBSCRIBE',
            msg: 'expirationTime is not valid',
        },
        {
            ...validSubscribe,
            expirationTime: 1234,
            expected: 'INVALIDSUBSCRIBE',
            msg: 'expirationTime is not valid',
        },
        {
            ...validSubscribe,
            keys: 'invalid',
            expected: 'INVALIDSUBSCRIBE',
            msg: 'keys object is not valid',
        },
        {
            ...validSubscribe,
            keys: {},
            expected: 'INVALIDSUBSCRIBE',
            msg: 'keys object is not valid',
        },
        {
            ...validSubscribe,
            keys: [],
            expected: 'INVALIDSUBSCRIBE',
            msg: 'keys object is not valid',
        },
        {
            ...validSubscribe,
            keys: null,
            expected: 'INVALIDSUBSCRIBE',
            msg: 'keys object is not valid',
        },
        {
            ...validSubscribe,
            keys: 1234,
            expected: 'INVALIDSUBSCRIBE',
            msg: 'keys object is not valid',
        },
        {
            ...validSubscribe,
            keys: {
                auth: 'eKOsJ8KlLI6OAWzNmn6Dow',
            },
            expected: 'INVALIDSUBSCRIBE',
            msg: 'p256dh parameter is missing',
        },
        {
            ...validSubscribe,
            keys: {
                p256dh: '',
                auth: 'eKOsJ8KlLI6OAWzNmn6Dow',
            },
            expected: 'INVALIDSUBSCRIBE',
            msg: 'p256dh is invalid',
        },
        {
            ...validSubscribe,
            keys: {
                p256dh: [],
                auth: 'eKOsJ8KlLI6OAWzNmn6Dow',
            },
            expected: 'INVALIDSUBSCRIBE',
            msg: 'p256dh is invalid',
        },
        {
            ...validSubscribe,
            keys: {
                p256dh: {},
                auth: 'eKOsJ8KlLI6OAWzNmn6Dow',
            },
            expected: 'INVALIDSUBSCRIBE',
            msg: 'p256dh is invalid',
        },
        {
            ...validSubscribe,
            keys: {
                p256dh: null,
                auth: 'eKOsJ8KlLI6OAWzNmn6Dow',
            },
            expected: 'INVALIDSUBSCRIBE',
            msg: 'p256dh is invalid',
        },
        {
            ...validSubscribe,
            keys: {
                p256dh: 1234,
                auth: 'eKOsJ8KlLI6OAWzNmn6Dow',
            },
            expected: 'INVALIDSUBSCRIBE',
            msg: 'p256dh is invalid',
        },
        {
            ...validSubscribe,
            keys: {
                p256dh: 'BJ5iO_p2tZ7b-t60jz_ax6msZ_rlhySfz_y7lXGvOgb8gGXeLuYJ5lwssbc5iZhlnd9NBEO_4-E9M9BRxiJskek',
            },
            expected: 'INVALIDSUBSCRIBE',
            msg: 'auth parameter is missing',
        },
        {
            ...validSubscribe,
            keys: {
                p256dh: 'BJ5iO_p2tZ7b-t60jz_ax6msZ_rlhySfz_y7lXGvOgb8gGXeLuYJ5lwssbc5iZhlnd9NBEO_4-E9M9BRxiJskek',
                auth: '',
            },
            expected: 'INVALIDSUBSCRIBE',
            msg: 'auth is invalid',
        },
        {
            ...validSubscribe,
            keys: {
                p256dh: 'BJ5iO_p2tZ7b-t60jz_ax6msZ_rlhySfz_y7lXGvOgb8gGXeLuYJ5lwssbc5iZhlnd9NBEO_4-E9M9BRxiJskek',
                auth: false,
            },
            expected: 'INVALIDSUBSCRIBE',
            msg: 'auth is invalid',
        },
        {
            ...validSubscribe,
            keys: {
                p256dh: 'BJ5iO_p2tZ7b-t60jz_ax6msZ_rlhySfz_y7lXGvOgb8gGXeLuYJ5lwssbc5iZhlnd9NBEO_4-E9M9BRxiJskek',
                auth: {},
            },
            expected: 'INVALIDSUBSCRIBE',
            msg: 'auth is invalid',
        },
        {
            ...validSubscribe,
            keys: {
                p256dh: 'BJ5iO_p2tZ7b-t60jz_ax6msZ_rlhySfz_y7lXGvOgb8gGXeLuYJ5lwssbc5iZhlnd9NBEO_4-E9M9BRxiJskek',
                auth: [],
            },
            expected: 'INVALIDSUBSCRIBE',
            msg: 'auth is invalid',
        },
        {
            ...validSubscribe,
            keys: {
                p256dh: 'BJ5iO_p2tZ7b-t60jz_ax6msZ_rlhySfz_y7lXGvOgb8gGXeLuYJ5lwssbc5iZhlnd9NBEO_4-E9M9BRxiJskek',
                auth: 1234,
            },
            expected: 'INVALIDSUBSCRIBE',
            msg: 'auth is invalid',
        },
    ];
    const tests = failBodies.map(async function (body) {
        await context.test(body.msg, async () => {
            const options = getPostOptions(body, cookie);
            const response = await nodeFetch(`${baseUrl}/subscribe`, options);
            const data = await response.json();

            return assert.strictEqual(data.error, body.expected);
        });
    });

    await Promise.all(tests);
});
