# Podcast Maker 🎙️

Create, customise and share AI-generated podcasts with realistic voices and a Spotify-style listening experience – **all in one open-source Next.js project**.

---

## ✨  Key Features
- **AI Script Generation** – Uses the free tier of OpenRouter models (default: `meta-llama/llama-3-8b-instruct`) to write complete podcast scripts.
- **Realistic Text-to-Speech** – Converts scripts to high-quality audio via ElevenLabs TTS API.
- **Spotify-like UX** – Modern responsive UI with categories, playlists, queue, player and dark mode.
- **Automatic Categorisation & Playlists** – Content analysis library groups podcasts by topic, mood and audience.
- **Local-First Storage** – Everything works offline with LocalStorage / IndexedDB; cloud back-ends can be added later.
- **Full TypeScript Codebase** – Strict typing, ESLint and Tailwind CSS for styling.

---

## 🚀  Quick Start

```bash
# 1. Clone & install
git clone https://github.com/your-handle/podcast-maker.git
cd podcast-maker
npm install

# 2. Add environment variables
cp .env.example .env.local   # edit values (see below)

# 3. Run dev server
npm run dev
```

Visit **http://localhost:3000** – you should see the landing page and be able to create a podcast.

---

## 🛠️  Environment Variables

Create `.env.local` in the project root:

```
# OpenRouter (script generation)
OPENROUTER_API_KEY=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

# ElevenLabs (text-to-speech)
ELEVENLABS_API_KEY=sk_62f6bec5c4a683e0dcde746c298d695efc4d1c1cdb171c74

# Optional – change default models
OPENROUTER_MODEL=meta-llama/llama-3-8b-instruct
ELEVENLABS_MODEL=eleven_multilingual_v2
```

_The starter keys above are demo keys from the original prompt. Replace them with your own for production use._

---

## 👶  Beginner Step-by-Step Guide

1. **Create a Script**
   - Click “Create Podcast”.
   - Choose category, tone, length and press “Generate”.
2. **Listen to a Preview**
   - The script appears; click **“Generate Audio”**.
   - Wait for the ElevenLabs conversion to finish.
3. **Save & Play**
   - A cover image is auto-generated; press **“Save Podcast”**.
   - Your podcast now shows up in the home page, can be played in the bottom player and added to playlists.
4. **Explore Categories / Playlists**
   - Browse “Browse Categories” or “Featured Playlists” on the home page.
   - The app automatically filters explicit or mismatching content when generating playlists.

---

## 🔌  Testing the APIs

### 1. OpenRouter

```bash
curl https://openrouter.ai/api/v1/chat/completions \
 -H "Authorization: Bearer $OPENROUTER_API_KEY" \
 -H "Content-Type: application/json" \
 -d '{
   "model":"meta-llama/llama-3-8b-instruct",
   "messages":[{"role":"user","content":"Write a 30 second podcast intro about coffee"}],
   "max_tokens":200
 }'
```

You should receive a JSON response with the generated text.

### 2. ElevenLabs

```bash
curl -X POST "https://api.elevenlabs.io/v1/text-to-speech/pNInz6obpgDQGcFmaJgB" \
 -H "xi-api-key: $ELEVENLABS_API_KEY" \
 -H "Content-Type: application/json" \
 --output sample.mp3 \
 -d '{
   "text":"Hello world, this is a test",
   "model_id":"eleven_multilingual_v2"
 }'
```

If `sample.mp3` plays correctly, your key is valid.

---

## 🧩  API Usage Examples (Code)

### Generate Script

```ts
import { generatePodcastScript } from '@/lib/openrouter';

const script = await generatePodcastScript({
  category: 'tech',
  lengthMinutes: 10,
  tone: 'conversational'
});
console.log(script.title, script.summary);
```

### Convert to Audio

```ts
import { convertPodcastToAudio, mapSpeakersToVoices } from '@/lib/elevenlabs';

const audio = await convertPodcastToAudio({
  segments: script.segments,
  speakerVoices: mapSpeakersToVoices(['Host']),
  onProgress: p => console.log(`progress ${Math.round(p*100)}%`)
});
```

---

## 🪛  Development Workflow

| Task                       | Command             |
|----------------------------|---------------------|
| Start dev server           | `npm run dev`       |
| Type-check & lint          | `npm run lint`      |
| Build for production       | `npm run build`     |
| Start prod server          | `npm start`         |
| Format with Prettier       | `npx prettier --write .` |

Branch strategy:  
`main` → stable releases  
`feature/*` → feature branches, open PRs → squash merge → main

---

## ❓  Troubleshooting

| Problem | Fix |
|---------|-----|
| `401 Unauthorized` from OpenRouter | Confirm `OPENROUTER_API_KEY`; free models sometimes rate-limit, switch model or wait. |
| ElevenLabs returns `quota exceeded` | Free plan has 10k characters; upgrade or shorten script length. |
| `SyntaxError: Unexpected reserved word 'await'` | Node <18 not supported. Upgrade Node to 18+. |
| Audio not playing | Check browser devtools – the local URL is revoked when component unmounts; keep page open or download file. |

---

## 🗺️  Project Structure

```
src/
 ├─ app/               # Next.js pages & layouts
 ├─ components/        # Reusable UI components
 ├─ lib/               # API wrappers & core logic
 ├─ styles/            # Tailwind + global CSS
 ├─ hooks/contexts/    # React utilities
 public/
 └─ README.md
```

---

## ✍️  Contributing

1. Fork the repo & create your branch: `git checkout -b feature/my-feature`
2. Commit your changes: `git commit -m "feat: add X"`
3. Push and open a Pull Request.

Star ⭐ the project if you like it!

---

## 📝  License

MIT © 2025 Podcast Maker Team
