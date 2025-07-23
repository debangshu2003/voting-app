const mongoose = require('mongoose');
const { type } = require('os');
const bcrypt = require('bcrypt')

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    age: {
        type: Number,
        required: true
    },
    email:{
        type: String,
        unqiue: true

    },
    mobile: {
        type: Number,
        required: true,
        unqiue: true
    },
    address: {
        type: String,
        required: true
    },
    aadharCardNumber: {
        type: Number,
        required: true,
        unqiue: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['voter', 'admin'],
        default: 'voter'
    },
    isVoter: {
        type: Boolean,
        default: false
    }

})

userSchema.pre('save', async function (next) {
    const person = this;

    // Hash the password only if it has been modified (or is new)
    if (!person.isModified('password')) return next();
    try {
        // Hash password generation
        const salt = await bcrypt.genSalt(5)
        // Hash password 
        const hashedPassword = await bcrypt.hash(person.password, salt)
        // Override the plain password with the hashed one
        person.password = hashedPassword
        next();
    } catch (err) {
        return next(err)
    }
})

userSchema.methods.comparePassword = async function (candidatePassword) {
    try {
        // use bcrypt to compare the provided password with the hashed password
        const isMatch = await bcrypt.compare(candidatePassword, this.password);
        return isMatch;

    } catch (err) {
        throw err;
    }
}

const user = mongoose.model('user', userSchema);
module.exports = user;
