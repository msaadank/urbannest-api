const mongoose = require('mongoose')
const {Schema} = mongoose

const optSchema = new Schema({
    otp: {
        type: Number,
    },
    email: {
        type: String,
        unique: true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address'],
    }
})

const Otp  = mongoose.model('Otp', optSchema)
module.exports = Otp