const bcrypt = require('bcryptjs');

// Créer l'utilisateur admin ODOUNGA
const password = bcrypt.hashSync('Admin123!', 10);

const adminUser = {
  email: 'odounga@admin.com',
  firstName: 'ODOUNGA',
  lastName: 'Admin',
  password: password,
  role: 'admin',
  isEmailVerified: true,
  isActive: true,
  canCreatePost: true,
  emailNotifications: true,
  smsNotifications: false,
  pushNotifications: false,
  phoneNumber: null,
  churchWebsite: null,
  ministryRole: null,
  bio: 'Administrateur système avec tous les droits',
  profilePhoto: null,
  lastLoginAt: null,
  resetPasswordRequestedAt: null,
  resetPasswordApprovedBy: null,
  resetPasswordApproved: false,
  deactivatedAt: null,
  deactivatedBy: null,
  deactivationReason: null,
  emailVerifiedAt: new Date(),
  selectedActivities: [],
  pushPlayerId: null,
  socialLinks: {},
  createdAt: new Date(),
  __v: 0
};

console.log('✅ Compte admin créé:');
console.log(`Email: ${adminUser.email}`);
console.log(`Mot de passe: Admin123!`);
console.log(`Rôle: ${adminUser.role}`);
console.log(`Tous les droits: ✅`);
console.log('\nObjet à insérer:');
console.log(JSON.stringify(adminUser, null, 2));
