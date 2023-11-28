import mongoose from "mongoose";

//Schema for Users
const userSchema = new mongoose.Schema({
  id: { 
    type: String, 
    required: true 
  }, 
  username: { 
    type: String, 
    required: true, 
    unique: true 
  },
  name: { 
    type:String, 
    required: true 
  },
  image: String,
  bio: String,

  // one user can have multiple references to specific threads
  threads: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Threads"
    }
  ],
  onboarded: {
    type: Boolean,
    default: false,
  },
  communities: [
    {
      type: mongoose.Schema.ObjectId,
      ref: "Community",
    }
  ]
})

const User = mongoose.models.User || mongoose.model('User', userSchema);
export default User;

