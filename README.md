# Company Search System with Pinecone Vector Database

A powerful company search system using Pinecone vector database, OpenAI embeddings, and Express.js backend with a modern web interface.

## 🎯 Features

- **Vector Search**: Semantic search using OpenAI embeddings and Pinecone
- **Dual Data Sources**: Search across Consumer Electronics and Pharmaceutical companies
- **Real-time Search**: Fast vector similarity search with relevance scoring
- **Category Filtering**: Filter results by industry category
- **Modern UI**: Responsive web interface with gradient design
- **REST API**: Well-documented API endpoints for integration

## 📁 Project Structure

```
SL-GEN/
├── .env                          # Environment variables (API keys)
├── package.json                  # Node.js dependencies
├── server.js                     # Express.js API server
├── ingest-data.js               # Data ingestion script
├── doc/                          # Data files
│   ├── consumer_electronics_companies_data.csv
│   └── pharmaceutical_companies_data.csv
└── public/
    └── index.html               # Frontend interface
```

## 🚀 Setup & Installation

### Prerequisites

- Node.js (v16 or higher)
- OpenAI API key
- Pinecone API key and index

### Step 1: Install Dependencies

```bash
npm install
```

This installs:
- `express` - Web server framework
- `@pinecone-database/pinecone` - Pinecone vector database client
- `openai` - OpenAI API client for embeddings
- `dotenv` - Environment variable management
- `csv-parser` - CSV file parsing
- `cors` - Cross-origin resource sharing

### Step 2: Environment Variables

Your `.env` file should contain:

```properties
OPENAI_API_KEY=your_openai_api_key
PINECONE_API_KEY=your_pinecone_api_key
PINECONE_ENV=us-east-1-aws
PINECONE_INDEX=quickstart
PORT=5001
```

✅ You've already updated this file!

## 📊 Data Ingestion Process

### Step 3: Upload Data to Pinecone

Run the ingestion script to process CSV files and upload to Pinecone:

```bash
npm run ingest
```

**What this does:**
1. Reads both CSV files from the `doc/` folder
2. Extracts company information (name, number, status, officers)
3. Generates embeddings using OpenAI's `text-embedding-3-small` model
4. Uploads vectors to Pinecone with metadata
5. Processes in batches of 100 to avoid rate limits

**Expected output:**
```
Starting data ingestion process...
==================================================

1. Reading consumer electronics data...
✓ Found 423 unique consumer electronics companies

2. Reading pharmaceutical data...
✓ Found 289 unique pharmaceutical companies

3. Uploading to Pinecone...
Processing 423 companies from consumer-electronics...
Processed 10/423 companies...
...
✓ Completed processing consumer-electronics: 423 companies
...
✓ Completed processing pharmaceutical: 289 companies

==================================================
✓ Data ingestion completed successfully!
✓ Total companies uploaded: 712
==================================================
```

⏱️ **Estimated time**: 5-10 minutes (depends on API rate limits)

## 🖥️ Running the Server

### Step 4: Start the Backend Server

```bash
npm start
```

**Server endpoints:**
- `POST /api/search` - Search companies by query
- `GET /api/company/:identifier` - Get specific company
- `GET /api/health` - Health check
- `GET /api/stats` - Pinecone index statistics

**Expected output:**
```
==================================================
✓ Server is running on http://localhost:5001
✓ Pinecone Index: quickstart
✓ API Endpoints:
  - POST /api/search - Search companies
  - GET /api/company/:identifier - Get company by number/name
  - GET /api/health - Health check
  - GET /api/stats - Index statistics
==================================================
```

## 🌐 Using the Frontend

### Step 5: Access the Web Interface

1. Open your browser
2. Navigate to: **http://localhost:5001**
3. You'll see a modern search interface

### How to Search:

**By Company Name:**
- Type: "ABZ Consultancy"
- Results: Companies with similar names

**By Company Number:**
- Type: "5174578"
- Results: Exact match and similar companies

**With Category Filter:**
- Select "Pharmaceutical" or "Consumer Electronics"
- Enter search term
- Click "Search"

### Search Features:

- **Semantic Search**: Finds relevant companies even with typos
- **Match Score**: Shows relevance percentage (0-100%)
- **Company Details**: Name, number, status, officer count
- **Color Badges**: 
  - 🟢 Green = Active company
  - 🔴 Red = Inactive company
  - 🔵 Blue = Pharmaceutical
  - 🟣 Purple = Consumer Electronics

## 🧪 Testing the System

### Test 1: Health Check

```bash
curl http://localhost:5001/api/health
```

Expected response:
```json
{
  "status": "ok",
  "message": "Server is running",
  "pineconeIndex": "quickstart"
}
```

### Test 2: Index Statistics

```bash
curl http://localhost:5001/api/stats
```

Expected response:
```json
{
  "success": true,
  "stats": {
    "totalVectors": 712,
    "dimension": 1536,
    "indexFullness": 0.00712
  }
}
```

### Test 3: Search via API

```bash
curl -X POST http://localhost:5001/api/search \
  -H "Content-Type: application/json" \
  -d '{"query": "pharmaceutical", "category": "all"}'
```

### Test 4: Company Lookup

```bash
curl http://localhost:5001/api/company/5174578
```

## 🔧 API Documentation

### POST /api/search

Search companies using semantic vector search.

**Request:**
```json
{
  "query": "ABZ Consultancy",
  "category": "all"  // or "consumer-electronics" or "pharmaceutical"
}
```

**Response:**
```json
{
  "success": true,
  "count": 10,
  "results": [
    {
      "companyName": "ABZ CONSULTANCY AND TRAINING LTD",
      "companyNumber": "12512683",
      "companyStatus": "active",
      "category": "consumer-electronics",
      "officerCount": 1,
      "score": 0.89
    }
  ]
}
```

### GET /api/company/:identifier

Get specific company by number or name.

**Response:**
```json
{
  "success": true,
  "company": {
    "companyName": "10SQUARED LIMITED",
    "companyNumber": "5174578",
    "companyStatus": "active",
    "category": "consumer-electronics",
    "officerCount": 2,
    "score": 0.95
  }
}
```

## 📈 How It Works

### Vector Embeddings

1. **Text Preparation**: Combines company name, number, status, and officers
2. **Embedding Generation**: OpenAI creates 1536-dimension vectors
3. **Vector Storage**: Pinecone stores vectors with metadata
4. **Similarity Search**: Finds closest vectors using cosine similarity

### Search Flow

```
User Query → Generate Embedding → Pinecone Search → Rank Results → Return Top 10
```

### Data Structure in Pinecone

Each vector contains:
```javascript
{
  id: "consumer-electronics-5174578",
  values: [0.023, -0.891, ...], // 1536 dimensions
  metadata: {
    companyNumber: "5174578",
    companyName: "10SQUARED LIMITED",
    companyStatus: "active",
    category: "consumer-electronics",
    officerCount: 2,
    searchText: "Company Name: 10SQUARED LIMITED..."
  }
}
```

## 🎨 Frontend Features

- **Responsive Design**: Works on desktop and mobile
- **Real-time Stats**: Shows result count and search time
- **Keyboard Support**: Press Enter to search
- **Loading States**: Visual feedback during search
- **Error Handling**: User-friendly error messages
- **Modern UI**: Gradient design with smooth animations

## 🛠️ Troubleshooting

### Issue: "Connection refused"
**Solution**: Make sure the server is running (`npm start`)

### Issue: "No results found"
**Solution**: Run the ingestion script first (`npm run ingest`)

### Issue: "API key invalid"
**Solution**: Check your `.env` file has valid API keys

### Issue: "Rate limit exceeded"
**Solution**: Wait a moment, OpenAI/Pinecone have rate limits

## 📝 Complete Process Summary

1. ✅ **Installed** all required npm packages
2. ✅ **Created** data ingestion script (`ingest-data.js`)
3. ✅ **Created** Express.js API server (`server.js`)
4. ✅ **Created** frontend web interface (`public/index.html`)
5. 🔄 **Ready to run** ingestion and start server

## 🚦 Quick Start Commands

```bash
# 1. Ingest data into Pinecone (run once)
npm run ingest

# 2. Start the server
npm start

# 3. Open browser to http://localhost:5001
```

## 🎯 Next Steps

After following this process:
1. Run the ingestion script to populate Pinecone
2. Start the server
3. Open the web interface
4. Try searching for companies!

## 📊 Data Summary

- **Consumer Electronics**: ~423 unique companies
- **Pharmaceutical**: ~289 unique companies
- **Total Records**: ~712 companies
- **Vector Dimension**: 1536 (OpenAI text-embedding-3-small)

---

**Built with ❤️ using Pinecone, OpenAI, and Express.js**
