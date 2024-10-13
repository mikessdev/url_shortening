module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('user', 'password', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn('user', 'firebaseId', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  down: async queryInterface => {
    await queryInterface.removeColumn('user', 'password');
    await queryInterface.removeColumn('user', 'firebaseId');
  },
};
