import mongoose from "mongoose";

const connectDB = async () => {
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/pictora`, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        console.log("Database Connected");
    } catch (error) {
        console.error("Database Connection Failed:", error.message);
        process.exit(1); // Exit process with failure
    }
};

export default connectDB;
