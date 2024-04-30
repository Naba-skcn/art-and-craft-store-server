const express = require('express');
const cors = require('cors');
const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.8bgsx7j.mongodb.net/?retryWrites=true&w=majority`;
console.log(uri);

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function run() {
  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const itemCollection = client.db('itemDB').collection('item');
    const categoryCollection = client.db('categoriesDB').collection('catogories');

    app.get('/item', async (req, res) => {
      const cursor = itemCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get('/categories', async(req,res) =>{
        const cursor = categoryCollection.find();
        const result = await cursor.toArray();
        res.send(result)
    })

    app.get('/update/:email', async (req, res) => {
      console.log(req.params.email);
      const result = await itemCollection.find({ email: req.params.email }).toArray();
      res.send(result);
    });

    app.get('/singleProduct/:id', async (req, res) => {
      console.log(req.params.id);
      const result = await itemCollection.findOne({ _id: new ObjectId(req.params.id) });
      res.send(result);
    });

    app.get('/item/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await itemCollection.findOne(query);
      res.send(result);
    });

    app.put('/item/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updateProduct = req.body;
      const product = {
        $set: {
          image: updateProduct.image,
          name: updateProduct.name,
          sub: updateProduct.sub,
          description: updateProduct.description,
          price: updateProduct.price,
          rating: updateProduct.rating,
          custom: updateProduct.custom,
          time: updateProduct.time,
          status: updateProduct.status
        }
      };
      const result = await itemCollection.updateOne(filter, product, options);
      res.send(result);
    });

    app.post('/add', async (req, res) => {
      const newItem = req.body;
      console.log(newItem);
      const result = await itemCollection.insertOne(newItem);
      res.send(result);
    });

    app.delete('/item/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await itemCollection.deleteOne(query);
      res.send(result);
    });

  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
  }
}

app.get('/', (req, res) => {
  res.send('Server is running');
});

run().then(() => {
  app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
  });
}).catch(console.error);
