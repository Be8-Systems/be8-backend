import randomString from './randomString.mjs';
import CryptoJS from 'crypto-js';

const port = 3000;
const baseUrl = `http://127.0.0.1:${port}`;
// ToDo change me to static data
export {
    baseUrl
};

export function newAccOptions(nickname = false) {
    const password = randomString(14);
    const salt = Date.now() + '';
    const cipherPassword = CryptoJS.AES.encrypt(password, salt).toString();

    return {
        method: 'POST',
        body: JSON.stringify({
            password: cipherPassword,
            nickname: nickname || randomString(10),
            salt
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

export function getOptionsWithoutCookie(body) {
    return {
        method: 'POST',
        body: JSON.stringify(body),
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
    };
}