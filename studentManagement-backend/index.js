const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const adminList = require('./models/adminList')
const studentlist = require('./models/studentList')
jsonwebtoken = require('jsonwebtoken');


var app = express();
const PORT = 3001;


app.use(cors());
app.use(bodyParser.json());

const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization'];
  if (token == null) return res.sendStatus(401);
  jsonwebtoken.verify(token, "uwu lmao xd", (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });}

app.post('/api/login', async function(req, res) {
  const { username, password } = req.body;
        try {
          const secretKey = "uwu lmao xd";
          const token = jsonwebtoken.sign({username, password}, secretKey, {expiresIn: "1h"});
          const doc = await adminList.findOne({username,password});
          if (doc) {
            console.log({username, password});
            console.log(doc);
            return res.status(200).json({token});
          } else {
            console.log({username, password});
            console.log(doc)
            return res.status(403).json({message: "username not found" });
          }
        } catch (e) {
          return res.status(500).json({message:e});
        }
      });

app.post('/api/students/create',authenticateToken, async function(req, res) {
      const { _id,name, joining, program, gpa, section} = req.body;
      if (!_id || !name || !joining){
        return res.status(400).json({message: "Please fill name and joining year"});
      }
      try {
      var student = new studentlist({_id,name, joining, program, gpa, section});
      console.log(student);
      student.save();
      res.status(200).json({message: "Student created successfully"});
      } catch (e) {
        console.log(e);
        res.status(500).json({"message":e});
      }
    });

app.put('/api/students/:id',authenticateToken, async function(req, res) {
const studentId=req.params.id;
const {name,gpa,section,joining,program} = req.body;
try {
  const updatedStudent = await studentlist.findByIdAndUpdate(studentId, {name,gpa,section,joining,program}, { new: true });
  if (!updatedStudent) {
    return res.status(400).json({message: "Student not found"});
  }
  console.log({name,gpa,section,joining,program});
  return res.status(200).json({message: "Student updated successfully",student: updatedStudent});
} catch (e) {
  console.log(e);
  res.status(500).json({message:e});
}})

app.delete('/api/students',authenticateToken, async function(req, res) {
  try {
    ids=Array.from(req.body);
    if (Array.isArray(ids)==false) {
      return res.status(400).json({message:"Incorrect input"});}
    if (ids.length==0) {
      return res.status(400).json({message: "Please select students to delete"});
    }
    studentlist.deleteMany({_id:{$in:ids}}).then(() => {
      return res.status(200).json({message: `${ids} deleted successfully`});
    })
  } catch (e) {
    res.status(500).json({message:e});
    console.log(e);
  }})

app.post('/api/students/search',authenticateToken, async function(req, res) {
        try {
          var sort = req.body.sort || {};
          var limit = req.body.limit || 10;
          const students = await studentlist.find().sort(sort).limit(limit);
          res.status(200).json(students);
        } catch (e) {
          res.status(500).json({message:e});
        }});

// Connection URL
const mongoURL = `mongodb+srv://admin:pass@cluster0.tjfctuy.mongodb.net/studentDBMSDB?retryWrites=true&w=majority`;
mongoose.connect(mongoURL,
    {
        useUnifiedTopology: true,
        useNewUrlParser: true
    }
).then(() => {
  console.log(`Connected to database studentDBMSDB`);
  app.listen(PORT, function() {console.log(`Server is running on port ${PORT}`)});
})