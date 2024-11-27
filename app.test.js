const request = require('supertest');
const app = require('./app');
const mongoose = require('mongoose');

describe('Public Routes', () => {
    test("GET /products - get products list", async () => {
        const response = await request(app)
            .get('/products');
        expect(response.status).toBe(200);
    });
});

describe('Auth Flow', () => {
    let authToken;

    test("POST /auth/register - register new merchant", async () => {
        const response = await request(app)
            .post('/auth/register')
            .send({
                username: "testmerchant",
                password: "test123",
                firstname: "Test",
                lastname: "Merchant",
                role: "merchant",
                email: "merchant@test.com"
            });
        expect(response.status).toBe(200);
    });

    test("POST /auth/login - login with credentials", async () => {
        const response = await request(app)
            .post('/auth/login')
            .send({
                username: "testmerchant",
                password: "test123"
            });
        expect(response.status).toBe(200);
        authToken = response.body.token;
    });

    test("GET /users - access protected route with token", async () => {
        const response = await request(app)
            .get('/users')
            .set('Authorization', `Bearer ${authToken}`);
        expect(response.status).toBe(200);
    });
});

afterAll(async () => {
    await mongoose.connection.close();
});