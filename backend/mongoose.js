const mongoose = require('mongoose');

require('dotenv').config();
const mongoURL = process.env.MONGO_URL
mongoose.connect(mongoURL).then(() => {
  console.log(`Connected to database studentDBMSDB`);
}).catch((err) => {console.log(err);});

const connection = mongoose.connection;

module.exports = connection;