export function requireFields(fields) {
  return (req, res, next) => {
    const missing = fields.filter((field) => {
      const value = req.body?.[field];
      return value === undefined || value === null || value === "";
    });

    if (missing.length) {
      return res.status(400).json({
        message: `Please provide: ${missing.join(", ")}.`,
      });
    }

    next();
  };
}

export function sanitizeString(value) {
  if (typeof value !== "string") return value;
  return value.trim();
}
