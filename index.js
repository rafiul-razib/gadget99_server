const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require('mongodb');
const app = express();
require('dotenv').config();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.gplglww.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");

    const database = client.db("gadget99DB")
    const productsCollection = database.collection("products")


    app.get("/allProducts", async(req, res)=>{
        const page = parseInt(req.query.page);
        const size = parseInt(req.query.size);
        const searchText = req.query.search;
        const priceSorted = req.query.priceSorted;
        const dateSorted = req.query.dateSorted;
        console.log("ascPrice",priceSorted, "dateSort",dateSorted)
        const query = {
          name : {$regex: searchText, $options: 'i'},    
        }
        const options = {
          sort: {
            price: priceSorted === "asc"? 1 : -1,
            creation_date: dateSorted === "dateAdded"? 1:-1
          },
        }
        // console.log(searchText)
        const result = await productsCollection.find(query, options).skip(page*size).limit(size).toArray();
        res.send(result);
    })

    app.get('/productCount', async(req, res)=>{
      const count = await productsCollection.estimatedDocumentCount();
      res.send({count});
    })

   
    
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get("/", (req, res)=>{
    res.send("gadget99 server is running")
})

app.listen(port, ()=>{
    console.log(`Listening to the port ${port}`);
})