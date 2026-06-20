const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        default: null,    
    },
    googleId: {
        type: String,
        default: null,    
    },
    profilePic: {
        type: String,
        default: '',    
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user',
    },
},{ timestamps: true });

const User = mongoose.model('User', userSchema);
module.exports = User;