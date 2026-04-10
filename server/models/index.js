import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import process from 'process';
import Sequelize from 'sequelize';
import configModule from '../config/config.cjs';

import SuperAdminModel from './superadmin.js';
import AdminRoleModel from './adminrole.js';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = configModule[env];

const db = {};

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}

// Load all models manually
const SuperAdmin = SuperAdminModel(sequelize, Sequelize.DataTypes);
const AdminRole = AdminRoleModel(sequelize, Sequelize.DataTypes);


// Assign models to db object
db.SuperAdmin = SuperAdmin;
db.AdminRole = AdminRole;


AdminRole.hasMany(SuperAdmin,{foreignKey:"role_id",as:"super_admin"});
SuperAdmin.belongsTo(AdminRole,{foreignKey:"role_id",as:"admin_role"});

AdminRole.belongsTo(SuperAdmin,{foreignKey:"created_by",as:"created_by_admin"});
AdminRole.belongsTo(SuperAdmin,{foreignKey:"updated_by",as:"updated_by_admin"});







db.sequelize = sequelize;
db.Sequelize = Sequelize;

// Setup associations
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

// DB Connection Test
sequelize.authenticate()
  .then(() => {
    console.log("DB AUTH CHECK ✅✅✅✅   =====>> PASS✅✅ <<=====");
  })
  .catch((error) => {
    console.log("----------------------------------------------------------------------------");
    console.log("DB AUTH CHECK ❌❌❌❌❌❌==>> FAIL❌❌❌ <<===>> FAIL❌❌❌ <<==== FAIL❌❌❌==>>");
    console.log("___________________________________________________________________________");
    console.log(error.message);
  });

export default db;
