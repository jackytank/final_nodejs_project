import jwt from 'jsonwebtoken';
import * as configEnv from 'dotenv';

configEnv.config();

export const generate_access_token = (email: string) => {
    return jwt.sign(email, process.env.TOKEN_SECRET as string, { expiresIn: '1800s' }); // 30mins
};
