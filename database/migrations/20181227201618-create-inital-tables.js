'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('role', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      name: {
        type: Sequelize.STRING
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });
    await queryInterface.createTable('user', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('uuid_generate_v4()'),
        allowNull: false
      },
      firstName: {
        type: Sequelize.STRING
      },
      lastName: {
        type: Sequelize.STRING
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      isEmailVerified: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
        defaultValue: false
      },
      password: {
        type: Sequelize.STRING
      },
      roleId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'role',
          key: 'id'
        }
      },
      contactNo: {
        type: Sequelize.STRING
      },
      pictureUrl: {
        type: Sequelize.STRING
      },
      gender: {
        type: Sequelize.STRING
      },
      country: {
        type: Sequelize.STRING
      },
      city: {
        type: Sequelize.STRING
      },
      countryOfBirth: {
        type: Sequelize.STRING
      },
      skypeId: {
        type: Sequelize.STRING
      },
      yearOfBirth: {
        type: Sequelize.INTEGER
      },
      timezone: {
        type: Sequelize.STRING
      },
      isApproved: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('user');
    await queryInterface.dropTable('role');
  }
};
