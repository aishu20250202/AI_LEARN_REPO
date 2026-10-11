const multer = require('multer');

/* Multer parses multipart/form-data — this is what lets the client send the
   resume PDF and the JD text in one request. The PDF is kept in memory
   because pdf-parse reads from a Buffer, not a file on disk. */
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB cap
  fileFilter(req, file, cb) {
    if (file.mimetype === 'application/pdf' || file.originalname.toLowerCase().endsWith('.pdf')) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are accepted'));
    }
  }
});

module.exports = upload;
