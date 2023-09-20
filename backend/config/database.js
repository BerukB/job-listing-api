const mongoose = require("mongoose");

  const dbConnection = async () => {
    try{
        const conn = await mongoose.connect('mongodb://0.0.0.0:27017/hiresell');

        console.log('Connected to MongoDB...')
    }catch(error){
        console.log(error);
        process.exit(1)
    }
  }

  
  module.exports = dbConnection;