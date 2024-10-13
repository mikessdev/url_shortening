module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('url', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      originalUrl: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      shortenedUrl: {
        type: Sequelize.TEXT,
        allowNull: false,
        unique: true,
      },
      totalAccesses: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      updatedAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      deletedAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
    });
  },

  down: async queryInterface => {
    await queryInterface.dropTable('url');
  },
};
