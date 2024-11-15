const mongoose = require("mongoose")

class MongoClient {
    async connect() {
        try {
            await mongoose.connect('mongodb://localhost:27017/api', {})
            console.log("Database connected successfully");
        }
        catch (err) {
            console.error(err?.message);
            process.exit(1);
        }
    }
}

const mongoClient = new MongoClient();
Object.freeze(mongoClient);

module.exports = mongoClient;