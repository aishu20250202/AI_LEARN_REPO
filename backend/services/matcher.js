/* Keyword-based skill extraction + JD comparison.
   The keyword engine is the current implementation; an AI layer can later
   implement the same contract (extractSkills / compareWithJD) and swap in
   here without touching routes, controllers, or the frontend. */
const { SKILLS } = require('./skills');

function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function extractSkills(text) {
  const lowered = String(text || '').toLowerCase();
  const found = new Set();

  for (const skill of SKILLS) {
    for (const alias of skill.aliases) {
      // boundary-safe: the alias must not sit inside a longer word
      const re = new RegExp(`(^|[^a-z0-9])${escapeRegExp(alias)}([^a-z0-9]|$)`);
      if (re.test(lowered)) {
        found.add(skill.name);
        break;
      }
    }
  }
  return found;
}

function compareWithJD(resumeText, jdText) {
  const resumeSkills = extractSkills(resumeText);
  const jdSkills = extractSkills(jdText);
  const jdMatched = jdSkills.size > 0;

  // With a recognised JD: score against what it asks for.
  // Without one: fall back to the full baseline list.
  const required = jdMatched ? [...jdSkills] : SKILLS.map((s) => s.name);
  const matched = required.filter((n) => resumeSkills.has(n));
  const missing = required.filter((n) => !resumeSkills.has(n));
  const extra = jdMatched ? [...resumeSkills].filter((n) => !jdSkills.has(n)) : [];

  const score = Math.round((matched.length / required.length) * 100);

  return {
    score,
    jdMatched,
    requiredSkills: required,
    matchedSkills: matched,
    missingSkills: missing,
    presentSkills: [...resumeSkills].sort(),
    extraSkills: extra
  };
}

module.exports = { extractSkills, compareWithJD };
