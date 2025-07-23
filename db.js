const mongoose = require('mongoose')
require('dotenv').config();

// const mongoURL = 'mongodb://localhost:27017/voting'
// const mongoURL = 'mongodb+srv://debangshu2003dey:Debangshu1234@cluster0.obxepbq.mongodb.net/'
const mongoURL = process.env.MONGO_URI_LOCAL;

mongoose.connect(mongoURL,{
    useNewUrlParser: true,
    useUnifiedTopology: true
})

const db = mongoose.connection;

db.on('connected', ()=>{
    console.log('Connected to MongoDB server');
    
})

db.on('error', (err)=>{
    console.error('MongoDb connection error:', err);
    
})

db.on('disconnection', () =>{
    console.log('MongoDB disconnection');
    
})

module.exports = db;