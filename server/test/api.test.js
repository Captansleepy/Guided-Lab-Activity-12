const { test, after } = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const jwt = require('jsonwebtoken');
const Student = require('../models/Student');
const User = require('../models/User');
const bcrypt = require('bcrypt');

// Isolated route checks use an in-memory model stub. They do not test MongoDB persistence.
process.env.JWT_SECRET = 'isolated-test-secret-not-for-deployment';
const records = [];
Student.find = () => ({ sort: async () => records });
Student.create = async data => {
  const student = new Student(data);
  await student.validate();
  records.push(student);
  return student;
};
Student.findByIdAndDelete = async id => {
  const index = records.findIndex(student => String(student._id) === id);
  return index < 0 ? null : records.splice(index, 1)[0];
};
const app = express();
app.use(express.json());
app.use('/api/students', require('../routes/students'));
app.use('/api/auth', require('../routes/auth'));
const server = app.listen(0);
after(() => new Promise(resolve => server.close(resolve)));
const request = (path, method = 'GET', body, token) => fetch(
  `http://127.0.0.1:${server.address().port}/api${path}`,
  { method, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }, ...(body ? { body: JSON.stringify(body) } : {}) }
);

test('public GET, protected POST/DELETE, score validation, and empty 204 response', async () => {
  assert.deepEqual(await (await request('/students')).json(), []);
  const body = { name: 'Test Student', major: 'IT', score: 90 };
  assert.equal((await request('/students', 'POST', body)).status, 401);
  assert.equal((await request('/students/123', 'DELETE')).status, 401);
  assert.equal((await request('/students', 'POST', body, 'invalid')).status, 401);
  const expired = jwt.sign({ id: 'test' }, process.env.JWT_SECRET, { expiresIn: -1 });
  assert.equal((await request('/students', 'POST', body, expired)).status, 401);
  const token = jwt.sign({ id: 'test' }, process.env.JWT_SECRET, { expiresIn: '1h' });
  assert.equal((await request('/students', 'POST', { ...body, score: 101 }, token)).status, 400);
  assert.equal((await request('/students', 'POST', { ...body, name: ' ' }, token)).status, 400);
  const created = await request('/students', 'POST', body, token);
  assert.equal(created.status, 201);
  const student = await created.json();
  assert.equal((await (await request('/students')).json())[0]._id, student._id);
  const deleted = await request(`/students/${student._id}`, 'DELETE', undefined, token);
  assert.equal(deleted.status, 204);
  assert.equal(await deleted.text(), '');
  assert.deepEqual(await (await request('/students')).json(), []);
  assert.equal((await request(`/students/${student._id}`, 'DELETE', undefined, token)).status, 404);
});

test('login rejects wrong password and returns a verifiable JWT for correct password', async () => {
  const password = await bcrypt.hash('password123', 10);
  User.findOne = async () => ({ _id: 'test-user', password });
  assert.equal((await request('/auth/login', 'POST', { email: 'student1@example.com', password: 'wrong' })).status, 401);
  const res = await request('/auth/login', 'POST', { email: 'student1@example.com', password: 'password123' });
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(jwt.verify(data.token, process.env.JWT_SECRET).id, 'test-user');
  assert.equal(data.password, undefined);
});
