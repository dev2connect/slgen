require('dotenv').config();
const { Pinecone } = require('@pinecone-database/pinecone');

// Initialize Pinecone
const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY
});

const INDEX_NAME = process.env.PINECONE_INDEX || 'quickstart';

async function clearIndex() {
  console.log('Clearing Pinecone index...');
  
  try {
    const index = pinecone.index(INDEX_NAME);
    
    // Delete all vectors (using deleteAll)
    await index.namespace('').deleteAll();
    
    console.log('✓ Index cleared successfully!');
    console.log('You can now run: npm run ingest');
  } catch (error) {
    console.error('Error clearing index:', error.message);
    process.exit(1);
  }
}

clearIndex();
