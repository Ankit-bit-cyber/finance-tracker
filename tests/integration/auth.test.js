const request = require('supertest');
const app     = require('../../src/app');
const db      = require('../helpers/testDb');

beforeAll(async () => { await db.clean(); });
afterAll(async ()  => { await db.close(); });
afterEach(async () => { await db.clean(); });

describe('Auth API', () => {
  const user = { name: 'Alice', email: 'alice@test.com', password: 'password123' };

  test('POST /api/auth/register — creates user and returns token', async () => {
    const res = await request(app).post('/api/auth/register').send(user);
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.user.email).toBe(user.email);
    expect(res.body.data.user.password_hash).toBeUndefined();
  });

  test('POST /api/auth/register — rejects duplicate email', async () => {
    await request(app).post('/api/auth/register').send(user);
    const res = await request(app).post('/api/auth/register').send(user);
    expect(res.status).toBe(409);
  });

  test('POST /api/auth/register — rejects weak password', async () => {
    const res = await request(app).post('/api/auth/register').send({ ...user, password: 'short' });
    expect(res.status).toBe(422);
  });

  test('POST /api/auth/login — returns token for valid credentials', async () => {
    await request(app).post('/api/auth/register').send(user);
    const res = await request(app).post('/api/auth/login').send({ email: user.email, password: user.password });
    expect(res.status).toBe(200);
    expect(res.body.data.token).toBeDefined();
  });

  test('POST /api/auth/login — rejects wrong password', async () => {
    await request(app).post('/api/auth/register').send(user);
    const res = await request(app).post('/api/auth/login').send({ email: user.email, password: 'wrongpass' });
    expect(res.status).toBe(401);
  });

  test('GET /api/auth/me — returns profile with valid token', async () => {
    const reg = await request(app).post('/api/auth/register').send(user);
    const token = reg.body.data.token;
    const res = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.email).toBe(user.email);
  });

  test('GET /api/auth/me — 401 without token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });
});