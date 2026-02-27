import mongoose from "mongoose";

const connectDB = async()=>{
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/Notepad`)
        console.log('MongoDB connected successfully');
        
    } catch (error) {
        console.log('MongoDb connection error', error);
        
    }
}

export default connectDB;