const MAX_KEYWORD_LENGTH = 100;

function sanitizeRegexInput(keyword) {
  if (!keyword || typeof keyword !== 'string') {
    return '';
  }

  const trimmed = keyword.trim().slice(0, MAX_KEYWORD_LENGTH);

  const escaped = trimmed.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  return escaped;
}

function buildSearchQuery(keyword) {
  const sanitized = sanitizeRegexInput(keyword);
  
  if (!sanitized) {
    return null;
  }

  return {
    $or: [
      { name: { $regex: sanitized, $options: 'i' } },
      { description: { $regex: sanitized, $options: 'i' } },
    ],
  };
}

export { sanitizeRegexInput, buildSearchQuery, MAX_KEYWORD_LENGTH };
