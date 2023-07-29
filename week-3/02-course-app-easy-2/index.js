const express = require('express');
const app = express();

app.use(express.json());

let ADMINS = [];
let USERS = [];
let COURSES = [];

const adminAuthentication = (req,res,next) => {

  const {username , password} = req.headers;
  const admin = ADMINS.find(a => a.username === username && a.password === password);

  if(admin){
    next();

  }
  else{
    res.status(403).json({message : "Admin Authentication Failed"});
  }
};

const userAuthentication = (req,res,next) => {
  const {username , password} = req.body;
  const user = USERS.find(a => a.username === username && a.password === password);

  if(user){
    req.user = user ;
    next();

  }
  else{
    res.status(403).json({message : "User Authentication failed"});
  }
};

// Admin routes
app.post('/admin/signup', (req, res) => {

  const admin = req.body;
  const existingadmin = ADMINS.find(a => a.username === ADMINS.username);
  if(existingadmin){
    res.status(403).json({message : "Admin Already Exist"});
  }
  else{
    ADMINS.push(admin);
    res.status(200).json({message : "Admin Created Successfully"});
  }

});

app.post('/admin/login', adminAuthentication ,(req, res) => {
  res.status(200).json({message : "Logged in Successfully"});
});

app.post('/admin/courses', (req, res) => {

  const course = req.body;

  course.id = Date.now();
  COURSES.push(course);
  res.json({message : 'Course Created Successfully', courseId : course.id});

});

app.put('/admin/courses/:courseId', adminAuthentication ,(req, res) => {
  const courseId = parseInt(req.params.courseId);
  const course = COURSES.find(c => c.id === courseId);
  if(course){
    res.json({message : 'Course Update Successfully'});
  }
  else{
    res.status(404).json({message : 'course not found'});
  }
});

app.get('/admin/courses', adminAuthentication , (req, res) => {
  res.json({course : COURSES});
});

// User routes
app.post('/users/signup', (req, res) => {
  const user = {
    username : req.body.username,
    password : req.body.password,
    purchasedCourse : []
  }
  USERS.push(user);
  res.status(200).json({message : "user created successfully"});
});

app.post('/users/login', userAuthentication, (req, res) => {
  res.status(200).json({message : "Logged In Successfully"});
});

app.get('/users/courses', (req, res) => {
  let filteredCourses = [];
  for(let i = 0; i<COURSES.length; i++){
    if(COURSES[i].published){
      filteredCourses.push(COURSES[i]);
    }
  }
  res.json({course: filteredCourses});
});

app.post('/users/courses/:courseId', (req, res) => {
  const courseId = Number(req.params.courseId);
  const course= COURSES.find(c => c.id === courseId && c.published);
  if(course){
    req.user.purchasedCourse.push(courseId);
    res.json({message : 'course purchsed successfully'});
  }
  else{
    res.status(404).json({message : 'course not found or not exists'});
  }
});

app.get('/users/purchasedCourses', (req, res) => {
  var purchasedCourseIds = req.user.purchasedCourses;[1, 4];
  var purchasedCourses = [];
  for (let i = 0; i<COURSES.length;i++){
    if(purchasedCourseIds.indexof(COURSES[i].id) !== -1){
      purchasedCourses.push(COURSES[i]);
    }
  }

  res.json({purchasedCourses});
});

app.listen(3000, () => {
  console.log('Server is listening on port 3000');
});
