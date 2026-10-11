/* Shared helpers used by several layers. */

/* Word-boundary-safe alias matching: builds a RegExp so "js" doesn't match
   inside "json", and "java" doesn't match inside "javascript". Used by the
   matcher service; kept here so the AI layer can reuse it later. */
function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/* Builds the boundary-safe alias RegExp for a lowercase alias. */
function aliasRegExp(alias) {
  return new RegExp(`(^|[^a-z0-9])${escapeRegExp(alias)}([^a-z0-9]|$)`);
}

/* Normalizes request input: returns trimmed text or an empty string. */
function trimText(value) {
  return String(value == null ? '' : value).trim();
}

module.exports = { escapeRegExp, aliasRegExp, trimText };
