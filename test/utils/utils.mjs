import randomString from './randomString.mjs';

const port = 3000;

export function baseUrl() {
    return `http://127.0.0.1:${port}`;
}

export function newAccOptions(nickname = false) {
    return {
        method: 'POST',
        body: JSON.stringify({
            password: randomString(14),
            nickname: nickname || randomString(10),
        }),
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
    };
}

export function getPostOptions(body, cookie) {
    return {
        method: 'POST',
        body: JSON.stringify(body),
        credentials: 'same-origin',
        headers: {
            'Content-Type': 'application/json',
            cookie,
        },
    };
}

export function getGetOptions(cookie) {
    return {
        method: 'GET',
        credentials: 'same-origin',
        headers: {
            'Content-Type': 'application/json',
            cookie,
        },
    };
}
