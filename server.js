require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pinecone } = require('@pinecone-database/pinecone');
const OpenAI = require('openai');

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Root route - serve the frontend
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Initialize Pinecone
const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY
});

const INDEX_NAME = process.env.PINECONE_INDEX || 'quickstart';

// Function to generate embeddings using OpenAI GPT-3 Embedding Model
// Using text-embedding-3-small (1536 dimensions) - part of GPT-3 family
async function generateEmbedding(text) {
  try {
    const response = await openai.embeddings.create({
      model: "text-embedding-3-small", // GPT-3 embedding model
      input: text
    });
    return response.data[0].embedding;
  } catch (error) {
    console.error('Error generating embedding:', error.message);
    throw error;
  }
}

// Search endpoint
app.post('/api/search', async (req, res) => {
  try {
    const { query, category } = req.body;

    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    console.log(`Searching for: "${query}" in category: ${category || 'all'}`);

    // Generate embedding for the search query
    const queryEmbedding = await generateEmbedding(query);

    // Search in Pinecone
    const index = pinecone.index(INDEX_NAME);
    
    // Build filter if category is specified
    const filter = category && category !== 'all' ? { category: { $eq: category } } : undefined;

    const searchResults = await index.query({
      vector: queryEmbedding,
      topK: 10,
      includeMetadata: true,
      filter: filter
    });

    // Format results with safe metadata access
    const results = searchResults.matches.map(match => {
      const metadata = match.metadata || {};
      return {
        companyName: metadata.companyName || 'N/A',
        companyNumber: metadata.companyNumber || 'N/A',
        companyStatus: metadata.companyStatus || 'unknown',
        category: metadata.category || 'unknown',
        officerCount: metadata.officerCount || 0,
        officers: metadata.officers || 'N/A',
        score: match.score
      };
    });

    res.json({
      success: true,
      count: results.length,
      results: results
    });

  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ 
      error: 'Search failed', 
      message: error.message 
    });
  }
});

// Exact match search by company number or name
app.get('/api/company/:identifier', async (req, res) => {
  try {
    const { identifier } = req.params;
    console.log(`Looking up company: ${identifier}`);

    // Search by generating embedding for the identifier
    const queryEmbedding = await generateEmbedding(identifier);
    const index = pinecone.index(INDEX_NAME);

    const searchResults = await index.query({
      vector: queryEmbedding,
      topK: 5,
      includeMetadata: true
    });

    if (searchResults.matches.length === 0) {
      return res.status(404).json({ error: 'Company not found' });
    }

    // Return the best match with safe metadata access
    const match = searchResults.matches[0];
    const metadata = match.metadata || {};
    res.json({
      success: true,
      company: {
        companyName: metadata.companyName || 'N/A',
        companyNumber: metadata.companyNumber || 'N/A',
        companyStatus: metadata.companyStatus || 'unknown',
        category: metadata.category || 'unknown',
        officerCount: metadata.officerCount || 0,
        officers: metadata.officers || 'N/A',
        score: match.score
      }
    });

  } catch (error) {
    console.error('Lookup error:', error);
    res.status(500).json({ 
      error: 'Lookup failed', 
      message: error.message 
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Server is running',
    pineconeIndex: INDEX_NAME 
  });
});

// Stats endpoint
app.get('/api/stats', async (req, res) => {
  try {
    const index = pinecone.index(INDEX_NAME);
    const stats = await index.describeIndexStats();
    
    res.json({
      success: true,
      stats: {
        totalVectors: stats.totalRecordCount,
        dimension: stats.dimension,
        indexFullness: stats.indexFullness
      }
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ 
      error: 'Failed to get stats', 
      message: error.message 
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log('='.repeat(50));
  console.log(`✓ Server is running on http://localhost:${PORT}`);
  console.log(`✓ Pinecone Index: ${INDEX_NAME}`);
  console.log(`✓ API Endpoints:`);
  console.log(`  - POST /api/search - Search companies`);
  console.log(`  - GET /api/company/:identifier - Get company by number/name`);
  console.log(`  - GET /api/health - Health check`);
  console.log(`  - GET /api/stats - Index statistics`);
  console.log('='.repeat(50));
});
