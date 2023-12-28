const mongoose = require('mongoose');

require('dotenv').config();
const mongoURL = process.env.MONGO_URL
mongoose.connect(mongoURL,
    {
        useUnifiedTopology: true,
        useNewUrlParser: true
    }
).then(() => {
  console.log(`Connected to database studentDBMSDB`);
}).catch((err) => {console.log(err);});

const connection = mongoose.connection;

module.exports = connection;