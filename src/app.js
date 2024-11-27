const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const cors = require('cors');
require('dotenv').config();

// Import fungsi-fungsi handler dari authController
const authController = require('/Login Register/src/controllers/authController'); 
const userController = require('/Login Register/src/controllers/userController');

const app = express();
const upload = multer(); 

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Routes
app.post('/register/step1', authController.step1);
app.post('/register/step2', authController.step2);
app.post('/register/step3/:uid', upload.single('profilePicture'), authController.step3);
app.post('/register/step4/:uid', upload.single('idCard'), authController.step4); 
app.post('/login', userController.loginWithEmail);
app.post('/verifyPIN', userController.verifyPIN);

// Menjalankan server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));