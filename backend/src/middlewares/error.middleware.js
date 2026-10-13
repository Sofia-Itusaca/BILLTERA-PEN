function notFound(req, res) {
  res.status(404).json({ success: false, message: 'Recurso no encontrado' });
}

function asyncHandler(handler) {
  return (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);
}

function errorHandler(error, req, res, next) {
  if (res.headersSent) return next(error);

  const status = Number.isInteger(error.status) ? error.status : 500;
  if (status === 500) console.error(error);
  res.status(status).json({
    success: false,
    message: status === 500 ? 'Error interno del servidor' : error.message,
  });
}

module.exports = { notFound, errorHandler, asyncHandler };
