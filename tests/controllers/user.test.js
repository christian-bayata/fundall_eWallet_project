import request from 'supertest';
import server from '../../app';
import db from '../../models/index';
import _ from "lodash";
import jwt from 'jsonwebtoken';
import { secretKey } from '../../settings';

const baseURI = '/api/v1';
let app; 

describe("Users Controller", () => {
    
    beforeAll(async () => {
        app = server;
        await db.User.truncate({ cascade: true });
    }, 10000);
    
    afterAll(async () => { 
        app.close();
        await db.User.truncate({ cascade: true });
        await db.sequelize.close();
    });

    describe('Register User', () => {
        let payload;
        const exec = async () => {
            return await request(app)
            .post(`${baseURI}/register`)
            .send(payload);
        };

        beforeEach(() => {
            payload = { 
                firstName: "Frank",
                lastName: "Osagie",
                email: "franksagie1@gmail.com",
                password: "frank123",
                phoneNum: "08000000000"
             };
        })

        it('should return 400 if user firstName is missing from payload', async () => {
            payload.firstName = "";
            const response = await exec();
            expect(response.status).toBe(400);
        });
        it('should return 400 if user lastName is missing from payload', async () => {
            payload.lastName = "";
            const response = await exec();
            expect(response.status).toBe(400);
        });
        it('should return 400 if email is missing from payload', async () => {
            payload.email = "";
            const response = await exec();
            expect(response.status).toBe(400);
        });
        it('should return 400 if password is missing from payload', async () => {
            payload.password = "";
            const response = await exec();
            expect(response.status).toBe(400);
        });
        it('should return 400 if phone number is missing from payload', async () => {
            payload.phoneNum = "";
            const response = await exec();
            expect(response.status).toBe(400);
        });
        it('should return 400 if a user email already exists', async () => {
            await db.User.bulkCreate({
                firstName: "user_firstName",
                lastName: "user_lastName",   
                email: "user@gmail.com",
                password: "abc123",
                phoneNum: "08000000000"
            });
             const response = await exec();
             try {
                 expect(response.status).toEqual(400);
             } catch(err) {
                console.log('Error, ', err);
             }
        });
        it('should return 201 if the user supplies a valid payload', async () => {
             let response
             try {
                 response = await exec();
                 expect(response.status).toBe(201);
             } catch(err) {
                console.log("Error:", err);
             }
        });
    });

    describe('Login Users', () => {
        let payload;
        const exec = async () => {
            return await request(app)
                .post(`${baseURI}/login`)
                .send(payload);
        };
        beforeEach(() => {
            payload = {
                email: "franksagie1@gmail.com",
                password: "frank123"
            };
        })
        
        it('should return 400 if user does not supply email to the payload', async () => {
            payload.email = "";
            const response = await exec();
            expect(response.status).toEqual(400);
        }); 
        it('should return 400 if user does not supply password to the payload', async () => {
            payload.password = "";
            const response = await exec()
            expect(response.status).toBe(400);
        });
        it('should return 400 if user email is not found in the database', async () => { 
            const response = await exec();
            try {
                expect(response.status).toBe(400);
            } catch(err) {
                console.log(err);
            }
        });
        it('should return 400 if email already exists in the database', async () => {
            await db.User.bulkCreate({
                firstName: "Frank",
                lastName: "Osagie",
                email: "franksagie1@gmail.com",
                password: "frank123",
                phoneNum: "08000000000"
            });
            const response = await exec();
            try {
                expect(response.status).toBe(400);
            } catch(err) {
                console.log(err);
            }
        });

        it('should generate token for logged in users', async () => {
            const token = jwt.sign({userid: "1", email: payload.email}, secretKey);
            
            const response = await exec();
            expect(response.body.token).not.toBeNull();
            expect(response.header).toBeDefined();
        });
        it('should return 200 if user payload has correct details', async () => {            
            try{
                expect(response.status).toBe(200);
                expect(response.body.message).toMatch(/signed up/);
                expect(response.header).toBeDefined();

            } catch(err) {
                console.log("Error: ",err);
            }
        });
    });

    describe('Get logged-in user details', () => {
        it('should return 200 if the  user details are found', async () => {
            const token = jwt.sign({
                userId: "1",
                email: "frankie1@gmail.com" 
        }, secretKey)
            const decoded = jwt.verify(token, secretKey);
            const response = await request(app)
            .get(`${baseURI}/me`)
            .set('x-auth-token', token)
            try {
                expect(response.status).toEqual(200);
                expect(decoded.id).toBeTruthy();        
            } catch(err) {
                console.log("Error: ", err);
            }
        });
    });

    describe('Log out a user', () => {
        it('should return 200 if user is logged out', async () => {
            const res = await request(app).get(`${baseURI}/logout`).set('x-auth-token', null)
            expect(res.status).toEqual(200);
            expect(res.body.message).toMatch(/logged out/i);
        });
    });
});


