const express = require('express');
const app = express();
const jwt = require('jsonwebtoken');
const fs = require('fs');
const { json } = require('stream/consumers');

app.use(express.json());

let ADMINS = [];
let USERS = [];
let COURSES = [];

try{
  ADMINS = json.parse(fs.readFileSync('admins.json','utf-8'));
  USERS = json.parse(fs.readFileSync('users.json','utf-8'));
  COURSES = json.parse(fs.readFileSync('courses.json','utf-8'));
}catch{
  ADMINS = [];
  USERS = [];
  COURSES = [];
}
console.log(ADMINS);

const SECRET = 'my-secret-key';

const authenticateJwt = (req , res ,next) => {
  const authHeader = req.headers.authorization;
  if(authHeader){
    const token = authHeader.split(' ')[1];
    jwt.verify(token,SECRET,(err , user) =>{
      if(err){
        return res.status(403);
      }
      req.user = user;
      next(); 
    });
  }else{
    res.sendStatus(401);
  }
}

// Admin routes
app.post('/admin/signup', (req, res) => {
  const admin = req.body;
  const existingAdmin = ADMINS.find(a => a.username == admin.username);
 console.log("Admin Signup");
  if(existingAdmin){
    res.status(404).json({message : 'Admin Alredy Exists'});

  }
  else{
    const newAdmin = {username , password};
    ADMINS.push(newAdmin);
    fs.writeFileSync('admin.json', JSON.stringify(ADMINS));
    const token = jwt.sign({username, role : 'admin'},SECRET,{expiresIn: '1h'});
    res.json({message: 'Admin Created Successfully',token});
  }
});

app.post('/admin/login', (req, res) => {
  const {username , password} = req.headers;
  const admin = ADMINS.find(a => a.username === username && a.password === password);
  if(admin){
    const token = jwt.sign({username, role: 'admin'},SECRET,{expiresIn : '1h'});
    res.status(200).json({message : 'Logged In Successfully'});
  }
  else{
    res.status(404).json({message : 'Admin Authentication failed'});
  }
});

app.post('/admin/courses', authenticateJwt  ,  (req, res) => {
  const course = req.body;
  course.id = COURSES.length +1;
  COURSES.push(course);
  fs.writeFileSync('course.json',JSON.stringify(COURSES));
  res.json({message: 'Course Added Successfully', courseId : course.id});

});

app.put('/admin/courses/:courseId',authenticateJwt, (req, res) => {
  const course = COURSES.find(c => c.id === parseInt(req.params.courseId));
  if(course){
    Object.assign(course, req.body);
    fs.readFileSync('courses.json',JSON.stringify(COURSES));
    res.json({message : 'Course updated Succcessfully'});
  }else{
    res.status(404).json({message: 'Course not Found'});
  }
});

app.get('/admin/courses', authenticateJwt, (req, res) => {
  res.json({course: COURSES});
});

// User routes
app.post('/users/signup', (req, res) => {
  const user = req.body;
  const existingUser = USERS.find(u => u.username === user.username);
  if(existingUser){
    res.status(404).json({message : 'user already exist'});
  }
  else{
   const newUser = {username, password};
   USERS.push(newUser);
   fs.writeFileSync('users.json',JSON.stringify(USERS));
   const token = jwt.sign({username, role: 'user'},SECRET,{expiresIn: '1h'});
   res,json({message : 'user created successfully'});
  }
});

app.post('/users/login', (req, res) => {
  const {username ,password} = req.headers;
  const user = USERS.find(u => u.username === username && u.password === password);
  if(user){
    const token = jwt.sign({username, role: 'user'},SECRET,{expiresIn : '1h'});
    res.json({message: 'Logged in Successfully',token});
  }
  else{
    res.status(403).json({message : 'Invalid username or password'});
  }
});

app.get('/users/courses', authenticateJwt, (req, res) => {
 res.json({courses : COURSES});
});

app.post('/users/courses/:courseId', authenticateJwt, (req, res) => {
  const course = COURSES.find(c =>c.id === parseInt(req.params.courseId));
  if(course){
    const user = USERS.find(u => u.username === req.user.username);
    if(user){
      if(!user.purchasedCourses){
        user.purchasedCourses = [];
      }
      user.purchasedCourses.push(course);
      fs.writeFileSync('user.json',JSON.stringify(USERS));
      res.json({message: 'Course Purchased Successfully'});
    }
    else{
      res.status(403).json({message: 'User not Found'});
    }
   
  } else{
    res.status(403).json({message: 'Course not Found'});
  }
});

app.get('/users/purchasedCourses', authenticateJwt, (req, res) => {
  const user =USERS.find(u => u.username === req.user.username);
  if(user){
    res.json({purchasedCourses : user.purchasedCourses || [] });
  }
  else{
    res.status(403).json({message: 'User not found'})
  }
});

app.listen(3000, () => {
  console.log('Server is listening on port 3000');
});
