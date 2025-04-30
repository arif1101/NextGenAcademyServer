const express = require("express");
const app = express();
const cors = require('cors');
require('dotenv').config()
const port = process.env.PORT || 5000;

// middleware 
app.use(cors())
app.use(express.json())

// start 


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.hvsn9.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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

    const database = client.db('NextGenAcademy')
    const courseCollections = database.collection('courses')
    const bookCollections = database.collection('books')
    const userCollection = database.collection('users')
    const cartCollection = database.collection('carts')
    // course related data 
    app.get('/courses', async(req, res) => {
      const result = await courseCollections.find().toArray()
      res.send(result)
    })

    app.get('/courses/:id', async(req, res) => {
      const {id} = req.params; 
      try{
        const query = {_id: new ObjectId(id)};
        const course = await  courseCollections.findOne(query);

        if(!course){
          return res.status(404).json({message: 'Course not found'})
        }
        res.send(course)
      }
      catch (error){
                console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
      }

    })

    // books related data 
    app.get('/books', async(req,res) => {
       const result = await bookCollections.find().toArray()
       res.send(result)
    })

    app.get('/books/:id', async (req, res) => {
      const {id} = req.params;
      try{
        const query = {_id: new ObjectId(id)};
        const book = await bookCollections.findOne(query)
        if(!book){
          return res.status(404).json({message: 'Course not found'})
        }
        res.send(book)
      }catch{
        console.log(error);
        res.status(500).json({message: 'internal server Eroor'})
      }
    })


    // user related api 

    app.get('/users', async(req, res) => {
      try{
        const users = await userCollection.find().toArray();
        res.send(users)
      }catch(error){
        console.error(error);
        res.status(500).json({ message: 'Failed to fetch users', error });
      }
    })

    app.post('/users', async(req, res) => {
      const user = req.body;
      const existingUser = await userCollection.findOne({email: user.email});
      if(existingUser){
        return res.send({message: "User already exist"})
      }
      const result = await userCollection.insertOne(user)
      res.send(result)
    })

    app.get('/users/by-email/:email', async (req, res) => {
      const email = req.params.email;
      try{
        const user = await userCollection.findOne({email});
        if(!user){
          return res.status(404).json({message: 'user not found'})
        }
        res.send(user)
      }catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
      }
    })

    app.get('/carts/:email', async (req, res) => {
      const {email} = req.params
      if(!email){
        return res.status(400).json({message: "Email is required"});
      }

      try{
        const userCart = await cartCollection.find({email}).toArray();
        res.send(userCart)
      }catch(error){
        console.error(error)
        res.status(500).json({message: 'Failed to fetch cart items'});
      }
    })

    app.post('/carts', async(req,res) => {
      const cartItem = req.body;
      const {coursecode, email} = cartItem
      if(!coursecode || !email){
        return res.status(400).json({message: 'Missing coursecode or email'})
      }

      const existing = await cartCollection.findOne({coursecode, email})
      
      if(existing){
        return res.status(409).json({message: "course already in cart"})
      }
      const result = await cartCollection.insertOne(cartItem);
      res.send(result)
    })

    // update user profile 
    app.patch('/users/:id', async (req, res) => {
      const id = req.params.id;
      const updatedData = req.body;
    
      try {
        const filter = { _id: new ObjectId(id) };
        const updateDoc = {
          $set: updatedData,
        };
    
        const result = await userCollection.updateOne(filter, updateDoc);
        res.send(result);
      } catch (error) {
        console.error(error);
        res.status(500).send({ message: 'Update failed' });
      }
    });
    
    
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


// end 

app.get('/', (req, res) => {
    res.send('Learning is here')
})

app.listen(port, () => {
    console.log(`learning is sitting on port ${port}`)
})