const request = require('supertest');
const app = require('../src/app');
const prisma = require('../src/prismaClient');

let server;
let url;

beforeAll((done) => {
  server = app.listen(0, () => {
    const port = server.address().port;
    url = `http://localhost:${port}`;
    done();
  });
});

afterAll(async () => {
  await prisma.$disconnect();
  server.close();
});

describe('Auth & Leads flow', () => {
  let token;
  it('register admin', async () => {
    const res = await request(url).post('/api/v1/auth/register').send({
      name: 'Test Admin',
      email: 'testadmin@example.com',
      password: 'password123',
      role: 'ADMIN'
    });
    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined();
    token = res.body.token;
  });

  it('create lead', async () => {
    const res = await request(url).post('/api/v1/leads')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Lead One', email: 'lead1@example.com' });
    expect(res.statusCode).toBe(201);
    expect(res.body.lead).toBeDefined();
    expect(res.body.lead.name).toBe('Lead One');
  });

  it('get leads', async () => {
    const res = await request(url).get('/api/v1/leads');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.leads)).toBe(true);
  });
});
