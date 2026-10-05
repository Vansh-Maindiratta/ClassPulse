export function errorHandler(err, _req, res, _next) {
  if (err.code === 11000) {
    return res.status(409).json({ message: "A record with that value already exists." });
  }
  if (err.name === "ValidationError" || err.name === "CastError") {
    return res.status(400).json({ message: "Please check the submitted academic data." });
  }
  if (process.env.NODE_ENV !== "production") console.error(err.message);
  res.status(err.status || 500).json({
    message: err.status
      ? err.message
      : "Unable to load academic data. Please try again later.",
  });
}

export function notFound(_req, res) {
  res.status(404).json({ message: "That resource was not found." });
}
