const mongoose = require('mongoose')
const {Schema} = mongoose

const listingSchema = new Schema({
        purpose:{
            type: String,
            require: true,
        },
        type: {
            type: Object,
            required: true
        },
        city: {
            type: String,
            required: true
        },
        address: {
            type: String,
            required: true
        },
        areaSize: {
            type: Number,
            required: true
        },
        areaUnit: {
            type: String,
            required: true
        },
        price: {
            type: Number,
            required: true
        },
        bedrooms: {
            type: Number,
            required: true
        },
        bathrooms: {
            type: Number,
            required: true
        },
        title:{
            type: String,
            require: true,
        },
        description:{
            type: String,
            require: true,
        },
        images:{
            type: Array,
            require: true,
        },
        userRef: {
            type: String,
            required: true,
        }
    },
    {timestamps: true}
)

const ListingModel = mongoose.model("Listing", listingSchema)
module.exports = ListingModel;