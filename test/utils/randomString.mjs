const charset =
    '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
const random = (min, max) => Math.floor(Math.random() * (max - min + 1) + min);

export default function randomString(leng) {
    return [...new Array(leng)]
        .map(function () {
            return charset[random(0, charset.length - 1)];
        })
        .join('');
}
