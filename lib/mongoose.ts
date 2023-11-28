import mongoose from 'mongoose';

let isConnected = false; // variable to check if mongoose is coneceted

export const connectToDB = async () =>{
    mongoose.set('strictQuery', true);

    if(!process.env.MONGODB_URL) return console.log("MONGODB_URL n'existe pas");
    
    if(isConnected) return console.log('Deja connecter a MongoDB')

    try {
        await mongoose.connect(process.env.MONGODB_URL)
        isConnected = true;
    } catch (error) {
        console.log(error)
    }
}