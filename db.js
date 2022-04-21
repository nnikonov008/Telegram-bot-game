const {Sequelize} = require("sequelize")

module.exports = new Sequelize(
    "telega_bot",
    "root",
    "root",
    {
        host: "92.53.87.28",
        port: "6432",
        dialect: "postgres"
    }
)