// Enveloppe JSON standard (voir section 20 du cahier des charges).

function ok(res, data = null, message = 'Opération réussie', status = 200) {
  return res.status(status).json({ success: true, message, data, errors: [] });
}

function fail(res, message = 'Une erreur est survenue', status = 400, errors = []) {
  return res.status(status).json({ success: false, message, data: null, errors });
}

module.exports = { ok, fail };
