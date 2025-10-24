# Deploying to Vercel (using Docker)

This project runs an Express.js server and is packaged with a `Dockerfile` so you can deploy it to Vercel as a container.

Why Docker: Vercel works best with serverless functions, but for an existing Express server that expects a long-running process it's easiest to deploy using a container. Vercel will build the Docker image and run it.

## Files added

- `Dockerfile` — builds a Node 18 Alpine image and runs `server.js`.

## Steps to deploy (recommended)

1. Install Vercel CLI (if you want to deploy from the terminal):

```bash
npm i -g vercel
```

2. Login to Vercel:

```bash
vercel login
```

3. Add Environment Variables in the Vercel project settings (do NOT commit your `.env`):

- `OPENAI_API_KEY`
- `PINECONE_API_KEY`
- `PINECONE_ENV`
- `PINECONE_INDEX`

Set them for Production and Preview as needed.

4. Deploy from the project directory:

```bash
cd /path/to/your/project
vercel --prod
```

Vercel will detect the `Dockerfile` and perform a container build. The container will run the Express server; the server reads the runtime port from `process.env.PORT` which Vercel injects.

## Notes and caveats

- If you prefer not to use Docker, the alternative is to convert the API into Vercel Serverless Functions under `/api/*`. That requires breaking `server.js` into multiple function files and will change how you manage long-running behavior and local development.
- For production-scale services or heavy workloads, consider Cloud Run / ECS / DigitalOcean App Platform for full container orchestration.

## Quick checklist after deploy

- Verify environment variables on Vercel dashboard
- Check logs in the Vercel project to confirm the server started (look for the `Server is running on` message)
- Open the deployment URL and confirm the frontend loads and `/api/health` responds
