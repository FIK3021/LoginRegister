const express = require('express');
const multer = require('multer');
const { step1, step2, step3, step4 } = require('/Login Register/src/controllers/userController'); // Ganti dengan path ke file backend yang sudah dibuat

const router = express.Router();
const upload = multer();

router.post('/register/step1', express.json(), step1);
router.post('/register/step2', express.json(), step2);
router.post('/register/step3/:uid', upload.single('profilePicture'), step3);
router.post('/register/step4/:uid', upload.single('idCard'), step4);

module.exports = router;