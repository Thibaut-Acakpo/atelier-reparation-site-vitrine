// Middleware d'upload sécurisé pour les photos jointes aux demandes.
// - Types autorisés : JPG, PNG, WebP
// - Taille limitée (voir MAX_UPLOAD_SIZE)
// - Vérification du contenu réel du fichier (pas seulement l'extension)
// - Renommage aléatoire du fichier stocké

const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { nanoid } = require('nanoid');

const UPLOAD_DIR = path.resolve(__dirname, '../../', process.env.UPLOAD_DIR || './uploads');
const MAX_UPLOAD_SIZE = parseInt(process.env.MAX_UPLOAD_SIZE || '5242880', 10);

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Signatures binaires (magic numbers) pour vérifier le contenu réel du fichier,
// indépendamment de l'extension ou du Content-Type déclaré par le client.
const MAGIC_NUMBERS = {
  'image/jpeg': [[0xff, 0xd8, 0xff]],
  'image/png': [[0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]],
  'image/webp': [[0x52, 0x49, 0x46, 0x46]], // 'RIFF', suivi de 'WEBP' à l'offset 8
};

function matchesMagicNumber(buffer, mimeType) {
  const signatures = MAGIC_NUMBERS[mimeType];
  if (!signatures) return false;
  return signatures.some((sig) => sig.every((byte, i) => buffer[i] === byte));
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = { 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp' }[file.mimetype] || '';
    cb(null, `${Date.now()}-${nanoid(12)}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/webp'];
  if (!allowed.includes(file.mimetype)) {
    return cb(new Error('Format de fichier non autorisé. Utilisez JPG, PNG ou WebP.'));
  }
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_UPLOAD_SIZE, files: 1 },
});

// À utiliser après multer : vérifie que le contenu réel correspond au type déclaré,
// et supprime le fichier si ce n'est pas le cas.
function verifyUploadedImage(req, res, next) {
  if (!req.file) return next();
  try {
    const buffer = fs.readFileSync(req.file.path);
    if (!matchesMagicNumber(buffer, req.file.mimetype)) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({
        success: false,
        message: "Le contenu du fichier ne correspond pas à un format d'image autorisé.",
        data: null,
        errors: ['photo'],
      });
    }
    next();
  } catch (err) {
    next(err);
  }
}

module.exports = { upload, verifyUploadedImage, UPLOAD_DIR };
