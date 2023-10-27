const mongoose = require('mongoose');
const connection = require('./../mongoose');

const adminListSchema = new mongoose.Schema({
        username: {
                type: String
                  },
        password: {
                type: String
                    },
                })

const model = connection.model('adminList', adminListSchema);
module.exports = model;