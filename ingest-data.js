require('dotenv').config();
const { Pinecone } = require('@pinecone-database/pinecone');
const OpenAI = require('openai');
const fs = require('fs');
const csv = require('csv-parser');

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

// Function to read CSV and extract company data
async function readCSV(filePath) {
  return new Promise((resolve, reject) => {
    const companies = new Map();
    
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => {
        const companyNumber = row['Company Number'];
        const companyName = row['Company Name'];
        const companyStatus = row['Company Status'];
        
        if (!companies.has(companyNumber)) {
          companies.set(companyNumber, {
            companyNumber,
            companyName,
            companyStatus,
            officers: []
          });
        }
        
        // Add officer information if available
        if (row['Officer Name']) {
          companies.get(companyNumber).officers.push({
            name: row['Officer Name'],
            role: row['Officer Role'],
            occupation: row['Occupation'],
            appointedOn: row['Appointed On'],
            nationality: row['Nationality'],
            countryOfResidence: row['Country of Residence']
          });
        }
      })
      .on('end', () => {
        resolve(Array.from(companies.values()));
      })
      .on('error', reject);
  });
}

// Function to upload data to Pinecone
async function uploadToPinecone(companies, category) {
  console.log(`\nProcessing ${companies.length} companies from ${category}...`);
  
  const index = pinecone.index(INDEX_NAME);
  const batchSize = 100;
  let processed = 0;

  for (let i = 0; i < companies.length; i += batchSize) {
    const batch = companies.slice(i, i + batchSize);
    const vectors = [];

    for (const company of batch) {
      try {
        // Create searchable text
        const searchText = `Company Name: ${company.companyName}. Company Number: ${company.companyNumber}. Status: ${company.companyStatus}. Officers: ${company.officers.map(o => o.name).join(', ')}`;
        
        // Generate embedding
        const embedding = await generateEmbedding(searchText);
        
        // Prepare vector for upload with all metadata fields as strings
        vectors.push({
          id: `${category}-${company.companyNumber}`,
          values: embedding,
          metadata: {
            companyNumber: String(company.companyNumber),
            companyName: String(company.companyName),
            companyStatus: String(company.companyStatus),
            category: String(category),
            officerCount: company.officers.length,
            officers: company.officers.slice(0, 3).map(o => o.name).join(', '), // First 3 officers
            searchText: searchText.substring(0, 800) // Limit metadata size
          }
        });

        processed++;
        if (processed % 10 === 0) {
          console.log(`Processed ${processed}/${companies.length} companies...`);
        }
      } catch (error) {
        console.error(`Error processing company ${company.companyNumber}:`, error.message);
      }
    }

    // Upload batch to Pinecone
    if (vectors.length > 0) {
      try {
        await index.upsert(vectors);
        console.log(`Uploaded batch of ${vectors.length} vectors`);
      } catch (error) {
        console.error('Error uploading to Pinecone:', error.message);
      }
    }

    // Small delay to avoid rate limits
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log(`✓ Completed processing ${category}: ${processed} companies`);
}

// Main function
async function main() {
  console.log('Starting data ingestion process...\n');
  console.log('='.repeat(50));

  try {
    // Read consumer electronics data
    console.log('\n1. Reading consumer electronics data...');
    const consumerData = await readCSV('./doc/consumer_electronics_companies_data.csv');
    console.log(`✓ Found ${consumerData.length} unique consumer electronics companies`);

    // Read pharmaceutical data
    console.log('\n2. Reading pharmaceutical data...');
    const pharmaData = await readCSV('./doc/pharmaceutical_companies_data.csv');
    console.log(`✓ Found ${pharmaData.length} unique pharmaceutical companies`);

    // Upload to Pinecone
    console.log('\n3. Uploading to Pinecone...');
    await uploadToPinecone(consumerData, 'consumer-electronics');
    await uploadToPinecone(pharmaData, 'pharmaceutical');

    console.log('\n' + '='.repeat(50));
    console.log('✓ Data ingestion completed successfully!');
    console.log(`✓ Total companies uploaded: ${consumerData.length + pharmaData.length}`);
    console.log('='.repeat(50));

  } catch (error) {
    console.error('\n✗ Error during ingestion:', error.message);
    process.exit(1);
  }
}

// Run the script
main();
