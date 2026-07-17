const request  = require('supertest');
const app      = require('../../src/app');
const db       = require('../helpers/testDb');
const { createUser } = require('../helpers/authHelper');

let token, userId;

beforeAll(async () => {
  await db.clean();
  const u = await createUser();
  token = u.token;
  userId = u.user.id;
});
afterAll(async () => { await db.close(); });

describe('Transactions API', () => {
  let txId;

  test('POST /api/transactions — creates income transaction', async () => {
    const res = await request(app)
      .post('/api/transactions')
      .set('Authorization', `Bearer ${token}`)
      .send({ type: 'income', amount: 5000, currency: 'USD', description: 'Salary', date: '2024-01-15' });
    expect(res.status).toBe(201);
    expect(res.body.data.type).toBe('income');
    expect(parseFloat(res.body.data.amount)).toBe(5000);
    txId = res.body.data.id;
  });

  test('POST /api/transactions — rejects zero amount', async () => {
    const res = await request(app)
      .post('/api/transactions')
      .set('Authorization', `Bearer ${token}`)
      .send({ type: 'expense', amount: 0, currency: 'USD' });
    expect(res.status).toBe(422);
  });

  test('POST /api/transactions — allows negative amount (refund)', async () => {
    const res = await request(app)
      .post('/api/transactions')
      .set('Authorization', `Bearer ${token}`)
      .send({ type: 'expense', amount: -200, currency: 'USD', description: 'Refund' });
    expect(res.status).toBe(201);
    expect(parseFloat(res.body.data.amount)).toBe(-200);
  });

  test('GET /api/transactions — returns paginated list', async () => {
    const res = await request(app)
      .get('/api/transactions')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data.transactions)).toBe(true);
    expect(res.body.data.total).toBeGreaterThan(0);
  });

  test('GET /api/transactions/:id — returns single transaction', async () => {
    const res = await request(app)
      .get(`/api/transactions/${txId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(txId);
  });

  test('PUT /api/transactions/:id — updates transaction', async () => {
    const res = await request(app)
      .put(`/api/transactions/${txId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ description: 'Updated Salary', amount: 5500 });
    expect(res.status).toBe(200);
    expect(res.body.data.description).toBe('Updated Salary');
    expect(parseFloat(res.body.data.amount)).toBe(5500);
  });

  test('DELETE /api/transactions/:id — deletes transaction', async () => {
    const res = await request(app)
      .delete(`/api/transactions/${txId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    const check = await request(app)
      .get(`/api/transactions/${txId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(check.status).toBe(404);
  });

  test('GET /api/transactions — filters by type', async () => {
    const res = await request(app)
      .get('/api/transactions?type=income')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    res.body.data.transactions.forEach(t => expect(t.type).toBe('income'));
  });

  test('Cannot access another user\'s transaction', async () => {
    const { token: token2 } = await createUser({ email: 'hacker@test.com' });
    const tx = await request(app)
      .post('/api/transactions')
      .set('Authorization', `Bearer ${token}`)
      .send({ type: 'income', amount: 1000, currency: 'USD', date: '2024-01-01' });
    const res = await request(app)
      .get(`/api/transactions/${tx.body.data.id}`)
      .set('Authorization', `Bearer ${token2}`);
    expect(res.status).toBe(404);
  });
});