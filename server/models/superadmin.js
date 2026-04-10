
'use strict';

import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class SuperAdmin extends Model {
    static associate(models) {
      // future associations
    }
  }

  SuperAdmin.init(
    {
      first_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      last_name: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue:null
      },

      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true,
        },
      },

      mobile: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },

      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      role_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
      },

      otp: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      otp_expires_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },

      refresh_token: {
        type: DataTypes.STRING,
        allowNull: true,
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
      modelName: 'SuperAdmin',
      tableName: 'super_admin',
      freezeTableName: true,
      timestamps: true,
    }
  );

  return SuperAdmin;
};
