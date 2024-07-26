const mongoose = require('mongoose');
require('dotenv').config();

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('Connecté à MONGO ATLAS'))
  .catch((err) => console.error('Could not connect to MongoDB Atlas', err));

module.exports = mongoose;
