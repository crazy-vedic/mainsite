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
  //Router.listen(PORT, function() {console.log(`Server is running on port ${PORT}`)}
}).catch((err) => {console.log(err);});

const connection = mongoose.connection;

module.exports = connection;