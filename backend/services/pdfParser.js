const pdfParse = require('pdf-parse');

/* Extracts plain text from a resume PDF buffer. Lives in the service layer
   because it's a capability, not a request handler — the AI layer will use
   the same text downstream. */
async function extractResumeText(buffer) {
  const pdf = await pdfParse(buffer);
  return pdf.text || '';
}

module.exports = extractResumeText;
