// Configuration globale pour les tests
require('dotenv').config({ path: '.env.test' });

// Augmenter le timeout pour les tests
jest.setTimeout(30000);

// Mock Cloudinary pour les tests
jest.mock('cloudinary', () => ({
  v2: {
    config: jest.fn(),
    uploader: {
      upload: jest.fn().mockResolvedValue({
        secure_url: 'https://res.cloudinary.com/test/image/test.jpg',
        public_id: 'test-image-id'
      })
    }
  }
}));

// Mock PayPal pour les tests
jest.mock('@paypal/checkout-server-sdk', () => ({
  core: {
    PayPalHttpClient: jest.fn(),
    SandboxEnvironment: jest.fn(),
    ProductionEnvironment: jest.fn()
  },
  orders: {
    OrdersGetRequest: jest.fn(),
    OrdersCaptureRequest: jest.fn()
  }
}));

console.log('🧪 Configuration tests chargée');
