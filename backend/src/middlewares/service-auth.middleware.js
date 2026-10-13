const crypto = require('crypto');

function authorizeService(req, res, next) {
  const serviceName = req.get('x-service-name');
  const token = req.get('x-service-token') || '';
  const envName = serviceName === 'DEPOSITOS' ? 'DEPOSITOS_SERVICE_TOKEN' : serviceName === 'RETIROS' ? 'RETIROS_SERVICE_TOKEN' : null;
  const expected = envName && process.env[envName];
  if (!expected || !token || token.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(token), Buffer.from(expected))) {
    return res.status(403).json({ success: false, message: 'Fuente no autorizada' });
  }
  req.authorizedService = serviceName;
  next();
}

module.exports = { authorizeService };
