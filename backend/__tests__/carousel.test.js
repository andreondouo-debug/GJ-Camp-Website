const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/server');

describe('Tests Carousel', () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI_TEST || 'mongodb://localhost:27017/gj-camp-test');
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe('GET /api/carousel', () => {
    test('✅ Récupération du carousel (public)', async () => {
      const res = await request(app)
        .get('/api/carousel');

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('slides');
      expect(Array.isArray(res.body.slides)).toBe(true);
    });

    test('✅ Carousel retourne des slides avec image et texte', async () => {
      const res = await request(app)
        .get('/api/carousel');

      if (res.body.slides.length > 0) {
        const slide = res.body.slides[0];
        expect(slide).toHaveProperty('title');
        expect(slide).toHaveProperty('description');
        expect(slide).toHaveProperty('image');
      }
    });
  });
});
