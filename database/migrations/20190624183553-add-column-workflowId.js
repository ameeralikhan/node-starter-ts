'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    await queryInterface.addColumn('applicationWorkflowFieldPermission', 'applicationWorkflowId', {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: 'applicationWorkflow',
        key: 'id'
      }
    });
  },

  down: (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('applicationWorkflowFieldPermission', 'applicationWorkflowId');
  }
};
