const { Int32, Double, Decimal128 } = require('mongodb');
const mongoose = require('mongoose');
const connection = require('./../mongoose');

const studentListSchema = new mongoose.Schema({
        _id: {
                type: Number
        },
        name: {
                type: String
        },
        gpa: {
                type: Decimal128
        },
        section: {
                type: String
        },
        joining: {
                type: Number
        },
        program: {
                type:String
        }
                })

const model = connection.model('studentlists', studentListSchema);
module.exports = model;