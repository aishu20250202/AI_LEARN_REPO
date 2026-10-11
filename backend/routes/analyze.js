const express = require('express');
const router = express.Router();

const upload = require('../middleware/upload');
const { scoreResume, history } = require('../controllers/resumeController');

/* Route layer: maps URLs to controllers. No logic here — that lives in the
   controllers and services. The upload middleware is applied before the
   controller so req.file and req.body are already parsed. */

router.post('/score', upload.single('resume'), scoreResume);
router.get('/history', history);

module.exports = router;
