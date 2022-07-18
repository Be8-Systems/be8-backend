export default async function validPassword(req) {
    const password = req.body.password;

    if (typeof password !== 'string' || password.length < 1) {
        return {
            status: 400,
            response: {
                error: 'INVALIDPASSWORD',
            },
        };
    }

    return true;
}
