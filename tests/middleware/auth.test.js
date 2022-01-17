import jwt from 'jsonwebtoken';
import { secretKey } from '../../settings';

describe('Auth Middleware', () => {
    it('should return a valid jwt for a given user', async () => {
        const payload = {
            userId: "1",
            email: "user@gmail.com"
        };
        const token = jwt.sign(payload, secretKey, {expiresIn: '7d'});
        const decoded = jwt.verify(token, secretKey);
        expect(decoded).toMatchObject(payload);
    })
})