module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('url', 'userId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'user',
        key: 'id',
      },
    });
  },

  down: async queryInterface => {
    await queryInterface.removeColumn('url', 'userId');
  },
};
