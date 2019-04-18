'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query(
      `DO
      $do$
      BEGIN

      IF NOT EXISTS (SELECT 1 FROM role where name = 'admin') THEN
         INSERT INTO role VALUES (Default,'admin');
      END IF;

      IF NOT EXISTS (SELECT 1 FROM role where name = 'student') THEN
        INSERT INTO role VALUES (Default,'student');
      END IF;
      
      IF NOT EXISTS (SELECT 1 FROM role where name = 'tutor') THEN
        INSERT INTO role VALUES (Default,'tutor');
      END IF;
      
      END
      $do$`
    );
  },

  down: () => {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.bulkDelete('Person', null, {});
    */
  }
};
