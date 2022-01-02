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

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.USER_PASS}@cluster0.v227h.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
async function run(){
    try{
        await client.connect(); 
        const database = client.db('OnlineFreeAuction');
        const AuctionProductCollection = database.collection('AuctionProductCollection');

    //------------------BookMaker API START--------------//
        //Book Maker posting auction product to database
        app.post('/auctionpost', async (req, res) => {
            const data = req.body;
            const imgdata = req.files.img.data;

            const encodedpic1 = imgdata.toString('base64');
            const img = Buffer.from(encodedpic1, 'base64');

            const auctionproduct = {...data, img};
            const result = await AuctionProductCollection.insertOne(auctionproduct)
            res.json(result) 
        }) 
    //-----------------BookMaker API END----------------//

        //------------------Auctioneer API START--------------//
        //Auctioneer geting auction product from database
        app.get('/getAcution', async (req, res) => {
            const cursor = AuctionProductCollection.find({});
            const result = await cursor.toArray();
            res.send(result)
        })
       
    //-----------------Auctioneer API END----------------//
    }
    finally{

    }
}
run().catch(console.dir)
app.get('/', (req, res) => {
    res.send('Auction Server is connected');
})

app.listen(port, (req, res) => {
    console.log('Auction Port is', port)
})