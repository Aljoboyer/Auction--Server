const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');
const app = express();
const ObjectId = require('mongodb').ObjectId;
require('dotenv').config();
const fileUpload = require('express-fileupload');
const port = process.env.PORT || 5000;

//middleware 
app.use(cors()); 
app.use(express.json());
app.use(fileUpload());

app.get('/', (req, res) => {
    res.send('Auction Server is connected');
})

app.listen(port, (req, res) => {
    console.log('Auction Port is', port)
})