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
        const UsersCollection = database.collection('Users');

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
        //bookmaker geting data for managing
        app.get('/GetBookmakerAcution', async (req, res) => {
            const email = req.query.email;
            const query = {email: email};
            const result = await AuctionProductCollection.find(query).toArray();
            res.send(result)
        })
        //book maker deleting auction data
        app.delete('/BookMakerDeleteAuction/:id', async (req, res) => {
            const id = req.params.id;
            const query = {_id: ObjectId(id)};
            const result = await AuctionProductCollection.deleteOne(query)
            res.send(result)
        })
        //book maker managing status 
        app.put('/ManageStatus/:id' , async (req, res) => {
            const id = req.params.id;
            const query = {_id: ObjectId(id)};
            const option = {upsert: true};
            const updateDoc = {
                $set:{
                    status: 'closed'
                }
            }
            const result = await AuctionProductCollection.updateOne(query, updateDoc, option)
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

        // get single auction product by id
        app.get('/GetBidDetails/:id',async(req,res)=>{
            const id = req.params.id;
            console.log('fromd biddetails',id) 
            const query={_id: ObjectId(id)};
            const result = await AuctionProductCollection.findOne(query);
            res.send(result);
          
        })

    //-----------------Auctioneer API END----------------//
    //-------------------User API START------------------//
        //------------ Save User in Database --------//
        app.post('/userPost',async(req,res)=>{
            const userInfo = req.body;
            const result = await UsersCollection.insertOne(userInfo);
            res.json(result);
        })
   
        // ----------User Bidding record-----------//
        app.put('/postingBid', async(req, res) => {
            
            const email = req.body.email;
            const productId = req.body.productId;
            const biddate = req.body.biddate;
            const bidamount = req.body.bidamount;
            const username = req.body.username;
            const query={_id: ObjectId(productId)};
            const product= await AuctionProductCollection.findOne(query);
       
            const BidderInfo = {email,bidamount, username, biddate}
            
            const newarr = JSON.parse(product?.bidarray)
            
            newarr.push(BidderInfo)

            const arrays = JSON.stringify(newarr)

            const options = {upsert:true};
            const updateDoc = { $set:{
                bidarray: arrays 
            } };
            const result = await AuctionProductCollection.updateOne(query,updateDoc,options);
            res.json(result);
        }) 
    //--------------------User API END-------------------//
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