const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/server');
const User = require('../src/models/User');

describe('Tests Authentification', () => {
  beforeAll(async () => {
    // Connexion à la base de test
    await mongoose.connect(process.env.MONGODB_URI_TEST || 'mongodb://localhost:27017/gj-camp-test');
  });

  afterAll(async () => {
    // Nettoyage et déconnexion
    await User.deleteMany({});
    await mongoose.connection.close();
  });

  describe('POST /api/auth/signup', () => {
    test('✅ Inscription réussie avec données valides', async () => {
      const res = await request(app)
        .post('/api/auth/signup')
        .send({
          firstName: 'Jean',
          lastName: 'Dupont',
          email: 'jean.dupont@test.com',
          password: 'Password123!',
          dateOfBirth: '2000-01-01',
          sex: 'M',
          refuge: 'Lorient',
          phone: '0601020304'
        });

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('token');
      expect(res.body.user.email).toBe('jean.dupont@test.com');
    });

    test('❌ Échec avec email déjà utilisé', async () => {
      const res = await request(app)
        .post('/api/auth/signup')
        .send({
          firstName: 'Marie',
          lastName: 'Martin',
          email: 'jean.dupont@test.com', // Déjà utilisé
          password: 'Password123!',
          dateOfBirth: '2000-01-01',
          sex: 'F',
          refuge: 'Nantes',
          phone: '0601020305'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toContain('email');
    });

    test('❌ Échec avec mot de passe trop court', async () => {
      const res = await request(app)
        .post('/api/auth/signup')
        .send({
          firstName: 'Paul',
          lastName: 'Bernard',
          email: 'paul.bernard@test.com',
          password: '123', // Trop court
          dateOfBirth: '2000-01-01',
          sex: 'M',
          refuge: 'Laval',
          phone: '0601020306'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toContain('6 caractères');
    });
  });

  describe('POST /api/auth/login', () => {
    test('✅ Connexion réussie', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'jean.dupont@test.com',
          password: 'Password123!'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body.user.email).toBe('jean.dupont@test.com');
    });

    test('❌ Échec avec email inexistant', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'inconnu@test.com',
          password: 'Password123!'
        });

      expect(res.statusCode).toBe(401);
    });

    test('❌ Échec avec mot de passe incorrect', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'jean.dupont@test.com',
          password: 'MauvaisMotDePasse'
        });

      expect(res.statusCode).toBe(401);
    });
  });

  describe('GET /api/auth/me', () => {
    let token;

    beforeAll(async () => {
      // Créer un utilisateur et récupérer le token
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'jean.dupont@test.com',
          password: 'Password123!'
        });
      token = res.body.token;
    });

    test('✅ Récupération profil avec token valide', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.email).toBe('jean.dupont@test.com');
    });

    test('❌ Échec sans token', async () => {
      const res = await request(app)
        .get('/api/auth/me');

      expect(res.statusCode).toBe(401);
    });

    test('❌ Échec avec token invalide', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer tokeninvalide');

      expect(res.statusCode).toBe(401);
    });
  });
});
