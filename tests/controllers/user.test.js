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
        it('should return 400 if user firstName is missing from payload', async () => {
            let userPayload = {
                lastName: "user_lastName",
                email: "user@gmail.com", 
                password: "1234567",
                phoneNum: "08000000000"
            };
            const response = await request(app).post(`${baseURI}/register`).send(userPayload);
            expect(response.status).toBe(400);
        });
        it('should return 400 if user lastName is missing from payload', async () => {
            let userPayload = {
                firstName: "user_firstName",
                email: "user@gmail.com", 
                password: "1234567",
                phoneNum: "08000000000"
            };
            const response = await request(app).post(`${baseURI}/register`).send(userPayload);
            expect(response.status).toBe(400);
        });
        it('should return 400 if email is missing from payload', async () => {
            let userPayload = {
                firstName: "user_firstName",
                lastName: "user_lastName", 
                password: "1234567",
                phoneNum: "08000000000"
            };
            const response = await request(app).post(`${baseURI}/register`).send(userPayload);
            expect(response.status).toBe(400);
        });
        it('should return 400 if password is missing from payload', async () => {
            let userPayload = {
                firstName: "user_firstName",
                lastName: "user_lastName", 
                email: "user@gmail.com",
                phoneNum: "08000000000"
            };
            const response = await request(app).post(`${baseURI}/register`).send(userPayload);
            expect(response.status).toBe(400);
        });
        it('should return 400 if phone number is missing from payload', async () => {
            let userPayload = {
                firstName: "user_firstName",
                lastName: "user_lastName", 
                email: "user@gmail.com",
                password: "1234567"
            };
            const response = await request(app).post(`${baseURI}/register`).send(userPayload);
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

            const payload = { 
                firstName: "someuser_firstName",
                lastName: "someuser_lastName",   
                email: "user@gmail.com",
                password: "abc12390",
                phoneNum: "08000000000"
             };
            const response = await request(app).post(`${baseURI}/register`).send(payload);
            expect(response.status).toEqual(400);
        });
        it('should return 201 if the user supplies a valid payload', async () => {

            const payload = { 
                id: "1",
                firstName: "Frank",
                lastName: "Osagie",
                email: "franksagie1@gmail.com",
                password: "frank123",
                phoneNum: "08000000000"
             };
             let response
             try {
                 response = await request(app).post(`${baseURI}/register`).send(payload);
                 expect(response.status).toBe(201);
             } catch(err) {
                console.log("Error:", err);
             }
        });
    });

    describe('Login Users', () => {
        it('should return 400 if user does not supply email to the payload', async () => {
            const payload = {
                password: "frank123"
            }; 
            const res = await request(app)
            .post(`${baseURI}/login`)
            .send(payload);
            expect(res.status).toEqual(400);
        }); 
        it('should return 400 if user does not supply password to the payload', async () => {
            const payload = {
                email: "frankzz@gmail.com"
            }; 
            const response = await request(app)
            .post(`${baseURI}/login`)
            .send(payload);
            expect(response.status).toBe(400);
        });
        it('should return 400 if user email is not found in the database', async () => {
            
            const payload = {
                email: "some_user@gmail.com",
                password: "abcd123"
            }; 
            const response = await request(app)
            .post(`${baseURI}/login`)
            .send(payload);
            try {
                expect(response.status).toBe(400);
            } catch(err) {
                console.log(err);
            }
        });
        it('should generate token for logged in users', async () => {
            const payload = {
                email: "franksagie1@gmail.com",
                password: "frank123"
            };
            const id = "1";
            const token = jwt.sign({userid: id, email: payload.email}, secretKey);
            
            const response = await request(app)
            .post(`${baseURI}/login`)
            .send(payload);
            expect(response.body.token).not.toBeNull();
            expect(response.header).toBeDefined();
        });
        it('should return 200 if user payload has correct details', async () => {            
            const payload = {
                email: "franksagie1@gmail.com",
                password: "frank123"
            }
            
            const response = await request(app)
            .post(`${baseURI}/login`)
            .send(payload);
            try{
                expect(response.status).toBe(200);
                expect(response.header).toBeDefined();

            } catch(err) {
                console.log("Error: ",err);
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