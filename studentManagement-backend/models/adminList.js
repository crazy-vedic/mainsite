const mongoose = require('mongoose');

const adminListSchema = new mongoose.Schema({
        username: {
                type: String
                  },
        password: {
                type: String
                    },
                })

module.exports = mongoose.model('adminList', adminListSchema)