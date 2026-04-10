const bcrypt = require('bcrypt');
 
module.exports = {
  up: async () => {
    const dbModule = await import('../models/index.js'); // dynamically import ESM module
    const { SuperAdmin } = dbModule.default;
 
    const email = 'admin@gmail.com';
 
    const [admin, created] = await SuperAdmin.findOrCreate({
      where: { email },
      defaults: {
        first_name: 'Super',
        last_name: 'Admin',
        mobile: '9999988779',
        password: await bcrypt.hash('Admin@321', 10),
        role_id:1 // Super Admin
      }
    });
 
    if (created) {
      console.log(`✅ SuperAdmin with email "${email}" created.`);
    } else {
      console.log(`⚠️ SuperAdmin with email "${email}" already exists.`);
    }
  },
 
  down: async () => {
    const dbModule = await import('../models/index.js');
    const { SuperAdmin } = dbModule.default;
 
    const email = 'admin@gmail.com';
    const deleted = await SuperAdmin.destroy({ where: { email } });
 
    if (deleted) {
      console.log(`🗑️ SuperAdmin with email "${email}" deleted.`);
    } else {
      console.log(`❌ No SuperAdmin with email "${email}" found to delete.`);
    }
  }
};