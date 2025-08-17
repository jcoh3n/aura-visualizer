import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = process.env.PORT || 3001;

// Configuration multer pour l'upload de fichiers
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB max
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/json',
      'text/javascript',
      'application/javascript',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv'
    ];
    
    if (allowedTypes.includes(file.mimetype) || 
        file.originalname.match(/\.(json|js|xlsx|xls|csv)$/i)) {
      cb(null, true);
    } else {
      cb(new Error('Type de fichier non supporté'), false);
    }
  }
});

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Servir les fichiers statiques
app.use(express.static(path.join(__dirname, 'dist')));

// API Routes
app.post('/api/upload', upload.fields([
  { name: 'questionnaire', maxCount: 1 },
  { name: 'responses', maxCount: 1 }
]), (req, res) => {
  try {
    const files = req.files;
    const result = {
      questionnaire: files.questionnaire ? files.questionnaire[0] : null,
      responses: files.responses ? files.responses[0] : null
    };
    
    res.json({
      success: true,
      files: result,
      message: 'Fichiers uploadés avec succès'
    });
  } catch (error) {
    console.error('Erreur upload:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'upload des fichiers',
      error: error.message
    });
  }
});

// Endpoint pour traiter les fichiers
app.post('/api/process', async (req, res) => {
  try {
    const { questionnaireFile, responsesFile } = req.body;
    
    // Ici sera implémentée la logique de traitement
    // Pour l'instant, on retourne un exemple
    res.json({
      success: true,
      data: {
        questionnaire: {
          title: "Questionnaire de satisfaction",
          questions: [],
          structure: {}
        },
        responses: {
          total: 0,
          processed: 0,
          data: []
        },
        analytics: {
          completion_rate: 0,
          response_time: 0
        }
      }
    });
  } catch (error) {
    console.error('Erreur traitement:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du traitement des fichiers',
      error: error.message
    });
  }
});

// Route catch-all pour SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Gestion des erreurs
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'Fichier trop volumineux (max 50MB)'
      });
    }
  }
  
  console.error('Erreur serveur:', error);
  res.status(500).json({
    success: false,
    message: 'Erreur interne du serveur'
  });
});

app.listen(port, () => {
  console.log(`🚀 Serveur Aura Visualizer démarré sur le port ${port}`);
  console.log(`📊 Interface disponible sur http://localhost:${port}`);
});
