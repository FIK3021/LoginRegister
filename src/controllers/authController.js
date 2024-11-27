const { admin, db, storage } = require('/Login Register/src/config/firebase'); 

// Fungsi untuk menangani langkah 1 (mengumpulkan informasi dasar)
  exports.step1 = async (req, res) => {
    const { fullName, email, password } = req.body;

    try {
      if (!fullName || fullName.length < 3) {
        throw new Error('Nama lengkap harus diisi minimal 3 karakter.');
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new Error('Format email tidak valid.');
      }
      if (!password || password.length < 6) {
        throw new Error('Password harus diisi minimal 6 karakter.');
      }
      const userRecord = await admin.auth().createUser({
        email,
        password,
        displayName: fullName,
      });
      await db.collection('users').doc(userRecord.uid).set({
        fullName,
        email,
        password  
      });

      res.status(201).send({ uid: userRecord.uid });
    } catch (error) {
      res.status(400).send({ error: error.message });
    }
  };

// Fungsi untuk menangani langkah 2 (membuat PIN)
exports.step2 = async (req, res) => {
  const { uid, pin } = req.body;

  try {
    if (!pin || pin.length !== 6 || isNaN(pin)) {
      throw new Error('PIN harus berupa angka 6 digit.');
    }
    await db.collection('users').doc(uid).update({ pin }); 

    res.status(200).send({ message: 'PIN saved successfully' });
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
};

// Fungsi untuk menangani langkah 3 (upload foto profil)
exports.step3 = async (req, res) => {
  const { uid } = req.params;
  const profilePicture = req.file; 

  try {
    if (!profilePicture || !profilePicture.mimetype.startsWith('image/')) {
      throw new Error('File harus berupa gambar.');
    }
    if (profilePicture.size > 5 * 1024 * 1024) { // Maksimal 5MB
      throw new Error('Ukuran file gambar terlalu besar.');
    }

    const profilePictureRef = storage.bucket('casptone-cc').file(`profilePictures/${uid}`);
    await profilePictureRef.save(profilePicture.buffer);

    await profilePictureRef.makePublic();
    const profilePictureUrl = `https://storage.googleapis.com/${profilePictureRef.bucket.name}/${profilePictureRef.name}`;

    // Simpan URL foto ke Firestore
    await db.collection('users').doc(uid).update({ profilePicture: profilePictureUrl });

    res.status(200).send({ profilePictureUrl });
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
};


// Fungsi untuk menangani langkah 4 (verifikasi akun)
exports.step4 = async (req, res) => {
  const { uid } = req.params;
  const idCard = req.file; 

  try {
    if (!idCard || !idCard.mimetype.startsWith('image/')) {
      throw new Error('File harus berupa gambar.');
    }
    const idCardRef = storage.bucket().file(`idCards/${uid}`);
    await idCardRef.save(idCard.buffer);

    // url download foto
    const idCardUrl = idCardRef.publicUrl();

    // save url dan ditaruhh db firestore
    await db.collection('users').doc(uid).update({ 
      idCard: idCardUrl,
      isVerified: true 
    });

    res.status(200).send({ idCardUrl });
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
};