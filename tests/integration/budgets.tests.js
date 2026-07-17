const request  = require('supertest');
const app      = require('../../src/app');
const db       = require('../helpers/testDb');
const { createUser } = require('../helpers/authHelper');
const { v4: uuidv4 } = require('uuid');

let token, catId;

beforeAll(async () => {
  await db.clean();
  const u = await createUser();
  token = u.token;
  // Create a test category
  const { rows } = await db.query(
    `INSERT INTO categories (id, user_id, name, type, icon) VALUES ($1,$2,$3,$4,$5) RETURNING *`,
    [uuidv4(), u.user.id, 'Food', 'expense', '🍔']
  );
  catId = rows[0].id;
});
afterAll(async () => { await db.close(); });

describe('Budgets API', () => {
  let budgetId;
  const now = new Date();

  test('POST /api/budgets — creates budget', async () => {
    const res = await request(app)
      .post('/api/budgets')
      .set('Authorization', `Bearer ${token}`)
      .send({
        category_id: catId, amount: 5000, currency: 'USD',
        month: now.getMonth() + 1, year: now.getFullYear(), alert_at_pct: 80,
      });
    expect(res.status).toBe(201);
    expect(parseFloat(res.body.data.amount)).toBe(5000);
    budgetId = res.body.data.id;
  });

  test('POST /api/budgets — rejects negative amount', async () => {
    const res = await request(app)
      .post('/api/budgets')
      .set('Authorization', `Bearer ${token}`)
      .send({ category_id: catId, amount: -100, currency: 'USD', month: 1, year: 2024 });
    expect(res.status).toBe(422);
  });

  test('GET /api/budgets — returns list with progress', async () => {
    const res = await request(app)
      .get('/api/budgets')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    const b = res.body.data.find(b => b.id === budgetId);
    expect(b).toBeDefined();
    expect(b.progress_pct).toBeDefined();
    expect(b.remaining).toBeDefined();
  });

  test('PUT /api/budgets/:id — updates budget amount', async () => {
    const res = await request(app)
      .put(`/api/budgets/${budgetId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ amount: 7000 });
    expect(res.status).toBe(200);
    expect(parseFloat(res.body.data.amount)).toBe(7000);
  });

  test('DELETE /api/budgets/:id — deletes budget', async () => {
    const res = await request(app)
      .delete(`/api/budgets/${budgetId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
  });
});