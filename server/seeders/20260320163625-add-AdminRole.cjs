module.exports = {
  up: async () => {

    const dbModule = await import('../models/index.js');
    const { AdminRole } = dbModule.default;

    const roles = [
      { name: 'Super Admin' }
    ];

    // get existing roles
    const existingRoles = await AdminRole.findAll({
      attributes: ['name']
    });

    const existingNames = existingRoles.map(r => r.name);

    // filter duplicate
    const newRoles = roles
      .filter(role => !existingNames.includes(role.name))
      .map(role => ({
        ...role
      }));

    if (newRoles.length > 0) {

      await AdminRole.bulkCreate(newRoles);

      console.log(`✅ ${newRoles.length} roles inserted`);
    } else {
      console.log(`⚠️ All roles already exist`);
    }

  },


  down: async () => {

    const dbModule = await import('../models/index.js');
    const { AdminRole } = dbModule.default;

    const names = [
      'Super Admin',
      'Admin',
      'Manager',
      'Accountant'
    ];

    const deleted = await AdminRole.destroy({
      where: {
        name: names
      }
    });

    console.log(`🗑️ ${deleted} roles deleted`);

  }
};