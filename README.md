# Fera Talk 🤖

A web-based chat interface to interact with Hugging Face AI models. Features CORS-free API access using Cloudflare Workers.

## Features

- 💬 Clean, modern chat interface
- 🤖 Support for multiple Hugging Face models
- 🔧 Custom model selection
- 🌐 CORS-free API access via Cloudflare Worker
- 💾 Settings persistence (localStorage)
- 📱 Responsive design
- ⚡ Real-time streaming responses

## Quick Start

### Option 1: Use Without Cloudflare Worker (Direct API - May Have CORS Issues)

1. Open `index.html` in your browser (or serve it with any HTTP server)
2. Enter your Hugging Face API token
3. Select a model
4. Start chatting!

**Note:** Direct API calls from the browser may encounter CORS errors. For a CORS-free experience, use Option 2.

### Option 2: Use With Cloudflare Worker (Recommended - No CORS Issues)

#### Prerequisites
- Node.js installed
- A Cloudflare account (free tier works!)
- Hugging Face API token ([Get one here](https://huggingface.co/settings/tokens))

#### Setup Instructions

1. **Clone and Install Dependencies**
   ```bash
   git clone https://github.com/rahul-gound/fera-talk.git
   cd fera-talk
   npm install
   ```

2. **Deploy Cloudflare Worker**
   ```bash
   # Login to Cloudflare (first time only)
   npx wrangler login
   
   # Deploy the worker
   cd worker
   npx wrangler deploy
   ```
   
   After deployment, you'll get a worker URL like: `https://fera-talk-worker.your-subdomain.workers.dev`

3. **Run the Web Interface**
   ```bash
   # From the root directory
   npm run serve
   ```
   
   Or simply open `index.html` in your browser.

4. **Configure the App**
   - Enter your Hugging Face API token
   - Paste your Cloudflare Worker URL
   - Select a model or enter a custom model ID
   - Start chatting!

## Configuration

### Getting a Hugging Face API Token
1. Go to [Hugging Face Settings](https://huggingface.co/settings/tokens)
2. Create a new token with "Read" access
3. Copy and paste it into the app

### Available Models
The app comes pre-configured with several popular models:
- Meta Llama 3.2 3B Instruct
- Mistral 7B Instruct
- Microsoft DialoGPT Medium
- Google Flan-T5 Large

You can also use any custom model from Hugging Face by selecting "Custom Model" and entering the model ID (e.g., `meta-llama/Llama-2-7b-chat-hf`).

## Project Structure

```
fera-talk/
├── index.html          # Main HTML file
├── style.css           # Styling
├── script.js           # Frontend JavaScript
├── worker/
│   ├── index.js        # Cloudflare Worker code
│   └── wrangler.toml   # Worker configuration
├── package.json        # Node.js dependencies
└── README.md          # This file
```

## How It Works

### Without Cloudflare Worker
The app makes direct API calls to Hugging Face's Inference API. This may cause CORS errors in some browsers.

### With Cloudflare Worker
The Cloudflare Worker acts as a proxy:
1. Your browser sends a request to the worker
2. The worker forwards it to Hugging Face API with proper headers
3. The worker returns the response with CORS headers enabled
4. No CORS errors! 🎉

## Development

### Run Frontend Locally
```bash
npm run serve
```

### Test Worker Locally
```bash
cd worker
npx wrangler dev
```

### Deploy Worker
```bash
cd worker
npx wrangler deploy
```

## Troubleshooting

### CORS Errors
If you see CORS errors, make sure you:
1. Have deployed the Cloudflare Worker
2. Entered the correct Worker URL in the app
3. The Worker URL starts with `https://`

### Model Not Responding
Some models may be:
- Loading (first request can be slow)
- Require different parameters
- Not available for inference

Try a different model or wait a moment and retry.

### API Rate Limits
Hugging Face has rate limits on their free tier. If you hit limits:
- Wait a few minutes
- Consider upgrading your Hugging Face account
- Use a different model

## Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest features
- Submit pull requests

## License

MIT License - feel free to use this project for any purpose.

## Acknowledgments

- [Hugging Face](https://huggingface.co/) for their amazing AI models and API
- [Cloudflare Workers](https://workers.cloudflare.com/) for serverless edge computing

---

Made with ❤️ for the AI community