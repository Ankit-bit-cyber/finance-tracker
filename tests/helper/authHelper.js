const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { sign } = require('../../src/utils/jwt');
const db = require('./testDb');

const createUser = async (overrides = {}) => {
  const id = uuidv4();
  const defaults = {
    name: 'Test User',
    email: `test_${id.slice(0,8)}@example.com`,
    password: 'password123',
    currency: 'USD',
  };
  const data = { ...defaults, ...overrides };
  const hash = await bcrypt.hash(data.password, 10);

  const { rows } = await db.query(
    `INSERT INTO users (id, name, email, password_hash, currency)
     VALUES ($1,$2,$3,$4,$5) RETURNING *`,
    [id, data.name, data.email, hash, data.currency]
  );
  const token = sign({ id: rows[0].id, email: rows[0].email });
  return { user: rows[0], token };
};

module.exports = { createUser };