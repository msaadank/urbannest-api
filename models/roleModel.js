const mongoose = require('mongoose');
const { Schema } = mongoose;

const roleSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: false
    },
    permissions: [String],
});

const RoleModel = mongoose.model('Role', roleSchema);

module.exports = RoleModel;
