const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Conectado (${process.env.MY_NAME})...`);
    } catch (err) {
        console.error(`Erro ao conectar com MongoDB (${process.env.MY_NAME}):`, err.message);
        process.exit(1);
    }
};

module.exports = connectDB;