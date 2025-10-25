# Font Converter Backend API

Backend service for font conversion using fontverter. Supports TTF, OTF, WOFF, WOFF2 formats.

## Installation

```bash
npm install
```

## Running the Server

```bash
# Development
npm run dev

# Production
npm start
```

Server runs on `http://localhost:3000`

## API Endpoints

### POST /api/convert
Convert a single font file.

**Request:**
- Content-Type: `multipart/form-data`
- Body:
  - `font`: Font file (TTF, OTF, WOFF, WOFF2)
  - `targetFormat`: Target format (ttf, otf, woff, woff2)

**Response:**
- Converted font file (binary)

**Example:**
```bash
curl -X POST http://localhost:3000/api/convert \
  -F "font=@myfont.woff2" \
  -F "targetFormat=ttf" \
  --output converted.ttf
```

### GET /api/health
Check API status and supported formats.

**Response:**
```json
{
  "status": "ok",
  "supportedFormats": ["woff", "woff2", "ttf", "otf"],
  "version": "1.0.0"
}
```

## Deployment

### Railway

1. Push to GitHub
2. Connect repository to Railway
3. Deploy automatically

### Environment Variables

- `PORT`: Server port (default: 3000)

## Management UI

Access the web interface at `http://localhost:3000` to:
- Upload font files via drag & drop
- Convert between formats
- Download converted fonts

## Supported Formats

- **TTF** (TrueType Font)
- **OTF** (OpenType Font)
- **WOFF** (Web Open Font Format)
- **WOFF2** (Web Open Font Format 2)

---

Created by PrezIdo Maestro