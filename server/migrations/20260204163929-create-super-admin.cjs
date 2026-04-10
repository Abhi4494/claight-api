'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('super_admin', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },

      first_name: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      last_name: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue:null
      },

      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },

      mobile: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },

      password: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      role_id: 
      {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1,
      },
      otp: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      otp_expires_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      refresh_token: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      created_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue:null
      },
      updated_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue:null
      },
      is_deleted:{
         type:Sequelize.BOOLEAN,
         allowNull:false,
         defaultValue:0,
         comment:"0=> not Deleted ,1=>Deleted"
      },
      is_active:{
         type:Sequelize.BOOLEAN,
         allowNull:false,
         defaultValue:1,
         comment:"0=> Inactive ,1=>Active"
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },

      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('super_admin');
  },
};
