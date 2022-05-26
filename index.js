const express = require("express");
const app = express();
const cors = require("cors");
const mongodb = require("mongodb");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken"); 
const mongoClient = mongodb.MongoClient;
const URL =
  "mongodb+srv://Admin:Admin123@cluster0.2cymy.mongodb.net/Batch_32?retryWrites=true&w=majority";

app.use(
  cors({
    origin: "http://localhost:3000"
  })
);

app.use(express.json());

function authenticate(req,res,next) {

  if(req.headers.authorization){
    let decoded = jwt.verify(req.headers.authorization, 'thisisasecretkey');
    if(decoded) {
      req.userID = decoded.id
      next()
    } else {
      res.status(401).json({message : "Unauthorized"})
    }
   
  }else {
    res.status(401).json({message : "Unauthorized"})
  }
  

}

app.get("/students",authenticate, async (req, res) => {
  try {
    //open the connection
    let connection = await mongoClient.connect(URL);

    //select the database
    let db = connection.db("Batch_32");

    //select the collection
    let students = await db.collection("students").find({createdBy : req.userID}).toArray();

    //close the connection
    await connection.close();

    res.json(students);
  } catch (error) {
    res.status(500).json({ message: "Something Went Wrong" });
  }
});

app.post("/student",authenticate, async (req, res) => {
  try {
    //open the connection
    let connection = await mongoClient.connect(URL);

    //select the database
    let db = connection.db("Batch_32");
    req.body.createdBy = req.userID;
    //select the collection
    await db.collection("students").insertOne(req.body);

    //close the connection
    await connection.close();

    res.json({message : "Details added Successfully"});
  } catch (error) {
    res.status(500).json({ message: "Something Went Wrong" });
  }
});

app.put("/student/:id",authenticate, async (req, res) => {
    try {
        //open the connection
        let connection = await mongoClient.connect(URL);
    
        //select the database
        let db = connection.db("Batch_32");
        
    
        //select the collection
         await db.collection("students").updateOne({_id: mongodb.ObjectId(req.params.id)}, {$set: req.body});
        ;
        //close the connection
        await connection.close();
    
        res.json({message : "Details updated Successfully"});
      } catch (error) {
        res.status(500).json({ message: "Something Went Wrong" });
      }
});

app.delete("/student/:id",authenticate, async (req, res) => {
    try {
        //open the connection
        let connection = await mongoClient.connect(URL);
    
        //select the database
        let db = connection.db("Batch_32");
    
        //select the collection
        await db.collection("students").deleteOne({_id: mongodb.ObjectId(req.params.id)});
    
        //close the connection
        await connection.close();
    
        res.json({message : "Details Deleted Successfully"});
      } catch (error) {
        res.status(500).json({ message: "Something Went Wrong" });
      }
});

app.get("/student/:id",authenticate, async (req, res) => {

  try {
    //open the connection
    let connection = await mongoClient.connect(URL);

    //select the database
    let db = connection.db("Batch_32");

    //select the collection
    let student = await db.collection("students").findOne({_id: mongodb.ObjectId(req.params.id)});

    //close the connection
    await connection.close();

    res.json(student);
  } catch (error) {
    res.status(500).json({ message: "Something Went Wrong" });
  }
 
});

app.post("/register", async (req,res) => {
  try {
     //open the connection
     let connection = await mongoClient.connect(URL);

     //select the database
     let db = connection.db("Batch_32");

     //hash the password
     var salt = bcrypt.genSaltSync(10);
     var hash = bcrypt.hashSync(req.body.password, salt);
     req.body.password = hash;
 
     //select the collection
     await db.collection("Users").insertOne(req.body);
 
     //close the connection
     await connection.close();
 
     res.json({message : "User Registered Successfully"});
  } catch (error) {
     res.status(500).json({ message: "Something Went Wrong" });
  }
})

app.post("/login", async(req,res) => {
  try {

    //open the connection
    let connection = await mongoClient.connect(URL);
    
    //select the batabase
    let db = connection.db("Batch_32");

    //select the collection
    //process the input

    //find weather the input email is present in the collection
    let user = await db.collection("Users").findOne({email : req.body.email});

    //comparing the passwords

    if(user) {

      //comparing input password === db password
      let compare = bcrypt.compareSync(req.body.password, user.password );
      
      if(compare) {
          //generate JWT token
          let token = jwt.sign({name: user.email , id : user._id}, "thisisasecretkey")
          res.json({token})
      } else {
        res.status(500).json({message : "Credential not match"})
      }
    } else {
      res.status(401).json({message: "Credential not match"})
    }

    //close the connection
    await connection.close()
  } catch (error) {
    res.status(500).json({ message: "Something Went Wrong" });
  }
})

app.listen(3001, () => {
  console.log("Web Server Started");
});
