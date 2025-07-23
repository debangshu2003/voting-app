const bodyParser = require('body-parser');
const express = require('express')
const app = express();
const db = require('./db')
require('dotenv').config();

app.use(bodyParser.json())
const PORT = process.env.PORT || 3000;



// import the router file
const userRoutes = require('./routes/userRoutes')
const candidateRoutes = require('./routes/candidateRoutes')
//use the routers
app.use('/user', userRoutes)
app.use('/candidate', candidateRoutes)

app.listen(PORT, ()=>{
    console.log("Listening on port 3000");
    
})