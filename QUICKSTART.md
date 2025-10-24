# 🚀 Quick Start Guide

## Step-by-Step Process to Run the System

### ✅ Prerequisites Completed
- Node.js installed
- Dependencies installed (`npm install`)
- `.env` file configured with API keys

---

## 🔥 3-Step Launch Process

### STEP 1: Ingest Data to Pinecone (First Time Only)

```bash
npm run ingest
```

**What happens:**
- Reads CSV files from `doc/` folder
- Generates embeddings for each company
- Uploads to Pinecone vector database
- Takes ~5-10 minutes

**Watch for:**
```
✓ Found 423 unique consumer electronics companies
✓ Found 289 unique pharmaceutical companies
✓ Data ingestion completed successfully!
```

---

### STEP 2: Start the Server

```bash
npm start
```

**What happens:**
- Starts Express.js server on port 5001
- Connects to Pinecone
- Serves the frontend

**You should see:**
```
✓ Server is running on http://localhost:5001
```

---

### STEP 3: Open the Frontend

Open your browser and go to:
```
http://localhost:5001
```

**You'll see:**
- Beautiful gradient search interface
- Search box for company name/number
- Category filter dropdown
- Search button

---

## 🎯 Try These Searches

### Search Examples:

1. **By Company Name:**
   - Search: `ABZ Consultancy`
   - Search: `pharmaceutical`
   - Search: `electronics`

2. **By Company Number:**
   - Search: `5174578`
   - Search: `12512683`
   - Search: `4784475`

3. **With Category Filter:**
   - Select "Pharmaceutical" → Search: `pharma`
   - Select "Consumer Electronics" → Search: `robotics`

---

## 🧪 Test the API (Optional)

### Test health:
```bash
curl http://localhost:5001/api/health
```

### Test search:
```bash
curl -X POST http://localhost:5001/api/search \
  -H "Content-Type: application/json" \
  -d '{"query":"pharmaceutical","category":"all"}'
```

### Get stats:
```bash
curl http://localhost:5001/api/stats
```

---

## 📊 Expected Results

When you search, you'll see:
- **Result Count**: Number of matches found
- **Search Time**: How fast the search was (in milliseconds)
- **Match Score**: Relevance percentage (0-100%)
- **Company Details**: Name, number, status, officer count
- **Color Badges**: Status and category indicators

---

## 🎨 Frontend Features

- 🔍 Semantic search (understands context)
- ⚡ Fast results (<1 second)
- 🎯 Relevance scoring
- 🏷️ Category filtering
- 📱 Responsive design
- ⌨️ Keyboard shortcuts (Enter to search)

---

## ⚠️ Troubleshooting

| Problem | Solution |
|---------|----------|
| Server won't start | Check if port 5001 is available |
| No results | Run `npm run ingest` first |
| API errors | Verify `.env` file has correct keys |
| Connection error | Make sure server is running |

---

## 🎉 You're All Set!

Your Pinecone-powered company search system is ready to use!

**What you can search:**
- Company names (exact or partial)
- Company numbers
- Industry keywords
- Officer names (included in searchable text)

**Powered by:**
- 🌲 Pinecone Vector Database
- 🤖 OpenAI Embeddings
- ⚡ Express.js Backend
- 🎨 Modern Web Frontend

---

## 📞 Need Help?

- Check `README.md` for detailed documentation
- Review API endpoints in server.js
- Check console logs for errors
- Verify .env configuration

Happy searching! 🎯
