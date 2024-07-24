import multer from 'multer';
import path from 'path';


// Configuración de multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = '';
    if (req.body.isUpdate === 'true') {
      uploadPath = 'public/uploads/';
    } else {
      uploadPath = 'public/img/';
    }
    cb(null, uploadPath); // Directorio de destino para las imágenes cargadas
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, ext);
    cb(null, `${baseName}-${uniqueSuffix}${ext}`); // Combina el nombre original con un sufijo único
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('El archivo debe ser una imagen'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5 // Limitar el tamaño del archivo a 5MB
  },
  fileFilter: fileFilter
});

export default upload;
