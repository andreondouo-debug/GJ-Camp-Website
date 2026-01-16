require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const user = await User.findOne({ email: 'andreondouo@gmail.com' });
  console.log('📊 État actuel:');
  console.log('   Email:', user.emailNotifications);
  console.log('   Push:', user.pushNotifications);
  console.log('   SMS:', user.smsNotifications);
  
  if (user.pushNotifications !== true) {
    user.pushNotifications = true;
    await user.save();
    console.log('✅ Corrigé à true');
  } else {
    console.log('✅ Déjà correct');
  }
  process.exit(0);
});
