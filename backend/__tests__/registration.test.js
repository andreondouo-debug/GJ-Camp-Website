const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/server');
const User = require('../src/models/User');
const Registration = require('../src/models/Registration');

describe('Tests Inscription CRPT', () => {
  let token;
  let userId;

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI_TEST || 'mongodb://localhost:27017/gj-camp-test');
    
    // Créer un utilisateur de test
    const signupRes = await request(app)
      .post('/api/auth/signup')
      .send({
        firstName: 'Test',
        lastName: 'User',
        email: 'testuser@test.com',
        password: 'TestPass123!',
        dateOfBirth: '2000-01-01',
        sex: 'M',
        refuge: 'Lorient',
        phone: '0601020304'
      });
    
    token = signupRes.body.token;
    userId = signupRes.body.user._id;
  });

  afterAll(async () => {
    await Registration.deleteMany({});
    await User.deleteMany({});
    await mongoose.connection.close();
  });

  describe('POST /api/registrations', () => {
    test('✅ Inscription réussie avec paiement minimum (20€)', async () => {
      const res = await request(app)
        .post('/api/registrations')
        .set('Authorization', `Bearer ${token}`)
        .send({
          firstName: 'Jean',
          lastName: 'Dupont',
          email: 'jean.dupont@test.com',
          sex: 'M',
          dateOfBirth: '2005-03-15',
          address: '10 rue de la Paix, 75001 Paris',
          phone: '0612345678',
          refuge: 'Lorient',
          hasAllergies: false,
          amountPaid: 20,
          paymentDetails: {
            orderId: 'TEST-ORDER-123',
            payerId: 'TEST-PAYER-123'
          }
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.registration.amountPaid).toBe(20);
      expect(res.body.registration.amountRemaining).toBe(100);
      expect(res.body.registration.paymentStatus).toBe('partial');
    });

    test('✅ Inscription avec paiement total (120€)', async () => {
      const res = await request(app)
        .post('/api/registrations')
        .set('Authorization', `Bearer ${token}`)
        .send({
          firstName: 'Marie',
          lastName: 'Martin',
          email: 'marie.martin@test.com',
          sex: 'F',
          dateOfBirth: '2003-07-22',
          address: '25 avenue Victor Hugo, 44000 Nantes',
          phone: '0623456789',
          refuge: 'Nantes',
          hasAllergies: true,
          allergyDetails: 'Allergie aux arachides',
          amountPaid: 120,
          paymentDetails: {
            orderId: 'TEST-ORDER-456',
            payerId: 'TEST-PAYER-456'
          }
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.registration.amountPaid).toBe(120);
      expect(res.body.registration.amountRemaining).toBe(0);
      expect(res.body.registration.paymentStatus).toBe('paid');
    });

    test('❌ Échec avec montant < 20€', async () => {
      const res = await request(app)
        .post('/api/registrations')
        .set('Authorization', `Bearer ${token}`)
        .send({
          firstName: 'Paul',
          lastName: 'Bernard',
          email: 'paul.bernard@test.com',
          sex: 'M',
          dateOfBirth: '2004-11-30',
          address: '5 rue des Fleurs, 56100 Lorient',
          phone: '0634567890',
          refuge: 'Lorient',
          hasAllergies: false,
          amountPaid: 10 // Trop faible
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toContain('20€');
    });

    test('❌ Échec sans authentification', async () => {
      const res = await request(app)
        .post('/api/registrations')
        .send({
          firstName: 'Test',
          lastName: 'Test',
          email: 'test@test.com',
          sex: 'M',
          dateOfBirth: '2000-01-01',
          address: 'Test',
          phone: '0600000000',
          refuge: 'Lorient',
          amountPaid: 20
        });

      expect(res.statusCode).toBe(401);
    });

    test('❌ Échec avec refuge invalide', async () => {
      const res = await request(app)
        .post('/api/registrations')
        .set('Authorization', `Bearer ${token}`)
        .send({
          firstName: 'Sophie',
          lastName: 'Dubois',
          email: 'sophie.dubois@test.com',
          sex: 'F',
          dateOfBirth: '2002-05-18',
          address: '12 boulevard de la Liberté, 59000 Lille',
          phone: '0645678901',
          refuge: 'RefugeInvalide',
          hasAllergies: false,
          amountPaid: 50
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toContain('refuge');
    });
  });

  describe('GET /api/registrations', () => {
    test('✅ Récupération des inscriptions utilisateur', async () => {
      const res = await request(app)
        .get('/api/registrations')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
    });

    test('❌ Échec sans authentification', async () => {
      const res = await request(app)
        .get('/api/registrations');

      expect(res.statusCode).toBe(401);
    });
  });
});
