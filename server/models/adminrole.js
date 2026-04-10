'use strict';

import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class AdminRole extends Model {
    static associate(models) {
      // future associations
    }
  }

  AdminRole.init(
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },

      created_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null,
      },

      updated_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null,
      },

      is_deleted: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: 0,
        comment: '0=> not Deleted ,1=>Deleted',
      },

      is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: 1,
        comment: '0=> Inactive ,1=>Active',
      },
    },
    {
      sequelize,
      modelName: 'AdminRole',
      tableName: 'admin_role',
      freezeTableName: true,
      timestamps: true,
    }
  );

  return AdminRole;
};
