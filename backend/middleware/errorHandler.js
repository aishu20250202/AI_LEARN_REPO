/* Global error handler. Multer throws its own MulterError objects and the
   route layer rethrows plain Errors with meaningful messages, so this is the
   single place that maps them to HTTP status codes. */
function errorHandler(err, req, res, next) {
  console.error(err);

  if (err instanceof multer.MulterError) {
    const message =
      err.code === 'LIMIT_FILE_SIZE' ? 'PDF exceeds the 10 MB limit' : err.message;
    return res.status(400).json({ error: message });
  }
  if (err.message === 'Only PDF files are accepted') {
    return res.status(400).json({ error: err.message });
  }
  if (err.name === 'PasswordException') {
    return res.status(422).json({ error: 'This PDF is password-protected' });
  }

  res.status(500).json({ error: err.message || 'Server error' });
}

module.exports = errorHandler;
