function stripControlChars(value) {
  return String(value).replace(/[\u0000-\u001F\u007F]/g, '').trim();
}

function sanitizeBody(req, _res, next) {
  if (req.body && typeof req.body === 'object') {
    for (const [key, value] of Object.entries(req.body)) {
      if (typeof value === 'string') {
        req.body[key] = stripControlChars(value);
      }
    }
    if (typeof req.body.email === 'string') {
      req.body.email = req.body.email.toLowerCase();
    }
  }
  next();
}

module.exports = sanitizeBody;
