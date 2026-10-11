const mongoose = require('mongoose');

const analysisSchema = new mongoose.Schema(
  {
    resumeName: String,
    jdText: String,
    score: Number,
    jdMatched: Boolean,
    requiredSkills: [String],
    matchedSkills: [String],
    missingSkills: [String],
    presentSkills: [String],
    extraSkills: [String]
  },
  { timestamps: true }
);

module.exports = mongoose.model('Analysis', analysisSchema);
