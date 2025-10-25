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

### Railway Deployment

1. **Push to GitHub:**
   ```bash
   cd backend
   git init
   git add .
   git commit -m "Initial backend commit"
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```

2. **Deploy to Railway:**
   - Go to [railway.app](https://railway.app)
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository
   - Railway will auto-detect Node.js and deploy

3. **Get your API URL:**
   - After deployment, Railway will provide a URL like: `https://your-app.up.railway.app`
   - Copy this URL

4. **Update Extension:**
   - Open `Chrome/font-converter-api.js`
   - Replace `API_URL` with your Railway URL:
     ```javascript
     const API_URL = 'https://your-app.up.railway.app';
     ```
   - Do the same in `Firefox/font-converter-api.js`

### Environment Variables

- `PORT`: Server port (Railway sets this automatically)

## Management UI

Access the web interface at `http://localhost:3000` to:
- Upload font files via drag & drop
- Convert between formats
- Download converted fonts

## Supported Formats

### Input Formats (Can Convert FROM):
- **TTF** (TrueType Font)
- **OTF** (OpenType Font)
- **WOFF** (Web Open Font Format)
- **WOFF2** (Web Open Font Format 2)

### Output Formats (Can Convert TO):
- **TTF** (TrueType Font) - uses 'truetype' in fontverter
- **WOFF** (Web Open Font Format)
- **WOFF2** (Web Open Font Format 2)

**Note:** OTF files can be uploaded and converted FROM, but cannot be converted TO (fontverter limitation)

---

Created by PrezIdo Maestro