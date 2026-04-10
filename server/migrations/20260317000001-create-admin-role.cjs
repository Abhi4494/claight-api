'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('admin_role', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },

      name: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },

      created_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: null,
      },

      updated_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: null,
      },

      is_deleted: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: 0,
        comment: '0=> not Deleted ,1=>Deleted',
      },

      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: 1,
        comment: '0=> Inactive ,1=>Active',
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

    await queryInterface.addIndex('admin_role', ['name'], {
      name: 'idx_admin_role_name',
      unique: true,
    });

    await queryInterface.addIndex('admin_role', ['is_active'], {
      name: 'idx_admin_role_is_active',
    });

    await queryInterface.addIndex('admin_role', ['is_deleted'], {
      name: 'idx_admin_role_is_deleted',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeIndex('admin_role', 'idx_admin_role_name');
    await queryInterface.removeIndex('admin_role', 'idx_admin_role_is_active');
    await queryInterface.removeIndex('admin_role', 'idx_admin_role_is_deleted');
    await queryInterface.dropTable('admin_role');
  },
};
