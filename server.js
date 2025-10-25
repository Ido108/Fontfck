// Font Converter Backend - By PrezIdo Maestro
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fontverter = require('fontverter');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedFormats = ['.woff', '.woff2', '.ttf', '.otf'];
    const ext = path.extname(file.originalname).toLowerCase();

    if (allowedFormats.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid format. Only WOFF, WOFF2, TTF, OTF are supported.'));
    }
  }
});

// Supported formats (user-facing)
// Note: fontverter supports 'truetype' (TTF/OTF), 'woff', 'woff2'
// OTF can be downloaded (original) but cannot be converted TO (only FROM)
const SUPPORTED_FORMATS = ['woff', 'woff2', 'ttf', 'otf'];

// Map user formats to fontverter formats
// fontverter accepts: 'truetype', 'woff', 'woff2'
// NOTE: Use 'truetype' NOT 'sfnt' - sfnt doesn't work as target!
function mapToFontverterFormat(format) {
  if (format === 'ttf' || format === 'otf') return 'truetype';
  return format; // woff, woff2
}

// Detect font format using fontverter
function detectFormat(buffer) {
  try {
    const format = fontverter.detectFormat(buffer);
    // fontverter returns 'sfnt', 'woff', or 'woff2'
    return format;
  } catch (error) {
    console.error('Format detection error:', error);
    return null;
  }
}

// Convert font using fontverter
// Note: targetFontverterFormat should already be mapped to fontverter format (sfnt, woff, woff2)
async function convertFont(inputBuffer, targetFontverterFormat) {
  try {
    console.log(`Converting using fontverter to: ${targetFontverterFormat}`);

    // Use fontverter.convert (auto-detects input format)
    // Valid formats: 'sfnt', 'woff', 'woff2' (or 'truetype' as alias for 'sfnt')
    const outputBuffer = await fontverter.convert(inputBuffer, targetFontverterFormat);

    return outputBuffer;

  } catch (error) {
    console.error('Fontverter conversion error:', error);
    throw error;
  }
}

// API Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    supportedFormats: SUPPORTED_FORMATS,
    version: '1.0.0'
  });
});

// Convert font endpoint
app.post('/api/convert', upload.single('font'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No font file uploaded' });
    }

    const targetFormat = req.body.targetFormat?.toLowerCase();

    // Validate target format
    if (!targetFormat || !SUPPORTED_FORMATS.includes(targetFormat)) {
      return res.status(400).json({
        error: 'Invalid target format',
        supportedFormats: SUPPORTED_FORMATS
      });
    }

    // Detect input format using fontverter
    const detectedFormat = detectFormat(req.file.buffer);

    if (!detectedFormat) {
      return res.status(400).json({ error: 'Could not detect font format' });
    }

    console.log(`Detected format: ${detectedFormat}, target format: ${targetFormat}`);

    // Note: fontverter uses 'sfnt' for both TTF and OTF
    // If source is sfnt and target is ttf/otf, they're the same - return original
    if (detectedFormat === 'sfnt' && (targetFormat === 'ttf' || targetFormat === 'otf')) {
      console.log('Already in SFNT format (TTF/OTF), returning original');
      return res.set({
        'Content-Type': `font/${targetFormat}`,
        'Content-Disposition': `attachment; filename="font.${targetFormat}"`
      }).send(req.file.buffer);
    }

    // Check if formats match exactly
    if (detectedFormat === targetFormat) {
      console.log('Source and target formats match, returning original');
      return res.set({
        'Content-Type': `font/${targetFormat}`,
        'Content-Disposition': `attachment; filename="font.${targetFormat}"`
      }).send(req.file.buffer);
    }

    // Convert using fontverter (map to fontverter format)
    const outputBuffer = await convertFont(req.file.buffer, mapToFontverterFormat(targetFormat));

    // Send converted file
    res.set({
      'Content-Type': `font/${targetFormat}`,
      'Content-Disposition': `attachment; filename="converted.${targetFormat}"`
    }).send(outputBuffer);

  } catch (error) {
    console.error('Conversion error:', error);
    res.status(500).json({
      error: 'Conversion failed',
      message: error.message
    });
  }
});

// Batch convert endpoint for extension
app.post('/api/batch-convert', upload.array('fonts', 50), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No font files uploaded' });
    }

    const targetFormat = req.body.targetFormat?.toLowerCase();

    if (!targetFormat || !SUPPORTED_FORMATS.includes(targetFormat)) {
      return res.status(400).json({
        error: 'Invalid target format',
        supportedFormats: SUPPORTED_FORMATS
      });
    }

    const results = [];

    for (const file of req.files) {
      try {
        const detectedFormat = detectFormat(file.buffer);

        if (!detectedFormat) {
          results.push({
            filename: file.originalname,
            status: 'error',
            error: 'Could not detect format'
          });
          continue;
        }

        // Convert or return original
        let outputBuffer;
        let converted = false;

        // Check if already in target format
        if (detectedFormat === 'sfnt' && (targetFormat === 'ttf' || targetFormat === 'otf')) {
          // Already SFNT (TTF/OTF), return original
          outputBuffer = file.buffer;
        } else if (detectedFormat === targetFormat) {
          // Exact match
          outputBuffer = file.buffer;
        } else {
          // Convert (map to fontverter format)
          outputBuffer = await convertFont(file.buffer, mapToFontverterFormat(targetFormat));
          converted = true;
        }

        results.push({
          filename: file.originalname,
          status: 'success',
          converted: converted,
          inputFormat: detectedFormat === 'sfnt' ? 'ttf' : detectedFormat,
          outputFormat: targetFormat,
          data: outputBuffer.toString('base64')
        });

      } catch (error) {
        results.push({
          filename: file.originalname,
          status: 'error',
          error: error.message
        });
      }
    }

    res.json({ results });

  } catch (error) {
    console.error('Batch conversion error:', error);
    res.status(500).json({
      error: 'Batch conversion failed',
      message: error.message
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Font Converter API running on http://localhost:${PORT}`);
  console.log(`📝 Supported formats: ${SUPPORTED_FORMATS.join(', ')}`);
  console.log(`🌐 Management UI: http://localhost:${PORT}`);
});