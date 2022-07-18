import randomString from './randomString.mjs';
import CryptoJS from 'crypto-js';

const port = 3000;
const baseUrl = `http://127.0.0.1:${port}`;
// ToDo change me to static data
export { baseUrl };

export function newAccOptions(nickname = false) {
    const password = randomString(14);
    const salt = Date.now() + '';
    const cipherPassword = CryptoJS.AES.encrypt(password, salt).toString();

    return {
        method: 'POST',
        body: JSON.stringify({
            password: 'U2FsdGVkX19fIs07t/DUfTAkWvalf6lI0Xg5kZ5cCii84zSeQfIlQ21WjFBYZVIzBqcelpRk+zqoa9wXxNr07g==',
            nickname: nickname || randomString(10),
            salt: '1657105032826',
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
