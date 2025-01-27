const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const port = process.env.PORT || 5000

app.use(cors());
app.use(express.json());

//varxtika
//R@nush@nu1104

//mong0odb connection


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
// const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.7tror.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
const uri = `mongodb://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0-shard-00-00.7tror.mongodb.net:27017,cluster0-shard-00-01.7tror.mongodb.net:27017,cluster0-shard-00-02.7tror.mongodb.net:27017/?retryWrites=true&w=majority&ssl=true`;


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
    console.log("connecting...")
    await client.connect();

    //create database and collections
    const database = client.db("tch");
    const userCollection = database.collection("users");
    const classesCollection = database.collection("classes");
    const cartCollection = database.collection("cart");
    const paymentCollection = database.collection("payments");
    const enrolledCollection = database.collection("enrolled");
    const appliedCollection = database.collection("applied");

    //classes routes

    //create new class
    app.post("/new-class" , async (req , res) => {
        const newClass = req.body;
        const result = await classesCollection.insertOne(newClass);
        res.send(result);
    })

    //get all classes
    app.get("/classes" , async (req , res) => {
        const query = {status : "approved"};
        const result = await classesCollection.find().toArray();
        res.send(result);
    })

    //get instructor by their email address
    app.get('/classes/:email' , async (req , res) => {
        const email = req.params.email;
        const query = {instructorEmail : email};
        const result = await classesCollection.find(query).toArray();
        res.send(result);
    })

    //manage classes
    app.get('/classes-manage' , async (req , res) => {
        const result = await classesCollection.find().toArray();
        res.send(result);
    })

    //update classes status and reason
    app.patch('/change-status/:id' , async (req , res) => {
        const id = req.params.id;
        const status = req.body.status;
        const reason =  req.body.reason;
        const filter = {_id: new ObjectId(id)};
        const options = {upsert : true};
        const updateDoc = {
            $set : {
                status : status,
                reason : reason,
            },
        };
        const result = await classesCollection.updateOne(filter , updateDoc , options);

        res.send(result);
    })

    //get approved classes
    app.get('/approved-classes' , async (req , res) => {
        const query = {status : "approved"};
        const result = await classesCollection.find(query).toArray();
        res.send(result);
    })

    //get single class details
    app.get('/class/:id' , async (req , res) => {
        const id = req.params.id;
        if (!ObjectId.isValid(id)) {
            return res.status(400).send({ error: "Invalid ID format" });
        }    
        const query = {_id : new ObjectId(id)};
        const result = await classesCollection.findOne(query);
        res.send(result);
    })

    //update class details (all data)
    app.post('/update-class/:id' , async (req , res) => {
        const id = req.params.id;
        const updateClass = req.body;
        const filter = {_id : new ObjectId(id)};
        const options = {upsert : true};
        const updateDoc = {
            $set : {
                name : updateClass.name,
                description : updateClass.description,
                price : updateClass.price , 
                availableSeats: parseInt(updateClass.availableSeats),
                videoLink : updateClass.videoLink,
                status : "pending"
            }
        };
        const result = await classesCollection.updateOne(filter , updateDoc , options);
        res.send(result);
    })


    //CART ROUTES!!!

    //add to cart
    app.post('/add-to-cart'  , async (req , res) => {
        const newCartItem = req.body;
        const result = await cartCollection.insertOne(newCartItem);
        res.send(result);
    });

    //get cart item by id
    app.get('/cart-item/:id' , async (req,res) => {
        const id = req.params.id;
        const email = req.body.email;
        const query = {
            classId : id,
            userMail : email
        };
        const projection = {classId : 1};
        const result = await cartCollection.findOne(query , {projection: projection});
        res.send(result);
    })

    //get cart item by email
    app.get('/cart-item/:email' , async (req,res) => {
        const email = req.params.email;
        const query = {userMail : email};
        const projection = {classId : 1};
        const carts = await cartCollection.findOne(query , {projection : projection});
        const classIds = carts.map((cart) => new ObjectId(cart.classId));
        const query2 = {_id : {$in: classIds}};
        const result = await cartCollection.find(query2).toArray();
        res.send(result);
    })

    //delete from cart
    app.delete('/delete-cart-item/:id' , async (req,res) => {
        const id = req.params.id;
        const query = {classId : id};
        const result = await cartCollection.deleteOne(query);
        res.send(result);
    })

    // Send a ping to confirm a successful connection
    //await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } catch(error) {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1); // Exit the application if the connection fails
  }
}
run().catch(console.dir);



app.get('/' , (req,res) => {
    res.send("Hello World!");
})

app.listen(port , () => {
    console.log(`Server is running on port ${port}! :)`);
})