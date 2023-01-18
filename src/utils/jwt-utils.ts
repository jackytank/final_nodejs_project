import jwt from 'jsonwebtoken';

export const generate_access_token = (email: string) => {
    return jwt.sign(email, process.env.TOKEN_SECRET as string, { expiresIn: '1800s' }); // 30mins
};