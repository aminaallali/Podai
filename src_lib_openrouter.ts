import axios from 'axios';

// API Configuration
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || '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';
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

// TypeScript interfaces for request/response types
export interface PodcastScriptOptions {
  category: PodcastCategory;
  title?: string;
  lengthMinutes: number;
  tone: PodcastTone;
  additionalContext?: string;
  model?: OpenRouterModel;
  hostNames?: string[];
  guestNames?: string[];
  includeIntro?: boolean;
  includeOutro?: boolean;
  includeAds?: boolean;
  targetAudience?: string;
  maxRetries?: number;
}

export interface PodcastScriptResult {
  title: string;
  script: string;
  summary: string;
  durationEstimate: number;
  segments: PodcastSegment[];
  metadata: {
    category: PodcastCategory;
    tone: PodcastTone;
    model: string;
    wordCount: number;
    generatedAt: string;
  };
}

export interface PodcastSegment {
  type: 'intro' | 'main' | 'ad' | 'transition' | 'outro';
  content: string;
  speaker?: string;
  durationEstimate?: number;
  startTime?: number;
}

export type PodcastCategory = 
  | 'tech' 
  | 'comedy' 
  | 'news' 
  | 'education' 
  | 'business' 
  | 'health' 
  | 'science' 
  | 'arts' 
  | 'sports'
  | 'entertainment'
  | 'history'
  | 'true crime'
  | 'fiction'
  | 'politics'
  | 'philosophy'
  | 'self-improvement'
  | 'interview';

export type PodcastTone = 
  | 'casual' 
  | 'professional' 
  | 'humorous' 
  | 'serious' 
  | 'educational' 
  | 'inspirational'
  | 'conversational'
  | 'dramatic'
  | 'investigative';

export type OpenRouterModel = 
  | 'anthropic/claude-3-opus:beta'
  | 'anthropic/claude-3-sonnet:beta'
  | 'anthropic/claude-3-haiku:beta'
  | 'google/gemma-7b-it'
  | 'meta-llama/llama-3-8b-instruct'
  | 'meta-llama/llama-3-70b-instruct'
  | 'mistralai/mistral-7b-instruct'
  | 'mistralai/mixtral-8x7b-instruct';

// Default model to use (free tier)
const DEFAULT_MODEL: OpenRouterModel = 'meta-llama/llama-3-8b-instruct';

// Category descriptions for better prompting
const CATEGORY_DESCRIPTIONS: Record<PodcastCategory, string> = {
  'tech': 'technology, digital trends, and innovations',
  'comedy': 'humor, jokes, and entertaining stories',
  'news': 'current events, breaking stories, and analysis',
  'education': 'learning, teaching, and educational content',
  'business': 'entrepreneurship, finance, and professional development',
  'health': 'wellness, fitness, mental health, and medical topics',
  'science': 'scientific discoveries, research, and explanations',
  'arts': 'creative works, music, literature, and visual arts',
  'sports': 'athletic competitions, teams, players, and analysis',
  'entertainment': 'movies, TV shows, celebrities, and pop culture',
  'history': 'historical events, figures, and analysis of the past',
  'true crime': 'real criminal cases, investigations, and legal proceedings',
  'fiction': 'storytelling, narrative fiction, and creative tales',
  'politics': 'political discourse, policy, and governmental affairs',
  'philosophy': 'philosophical concepts, ethics, and deep thinking',
  'self-improvement': 'personal development, productivity, and growth',
  'interview': 'conversations with guests, Q&A format, and discussions'
};

// Tone descriptions for better prompting
const TONE_DESCRIPTIONS: Record<PodcastTone, string> = {
  'casual': 'relaxed, informal, and conversational',
  'professional': 'formal, authoritative, and polished',
  'humorous': 'funny, witty, and entertaining',
  'serious': 'solemn, earnest, and straightforward',
  'educational': 'informative, instructive, and clear',
  'inspirational': 'motivating, uplifting, and encouraging',
  'conversational': 'dialogue-heavy, natural, and engaging',
  'dramatic': 'intense, emotional, and captivating',
  'investigative': 'probing, analytical, and detailed'
};

/**
 * Generates a podcast script using OpenRouter API
 * @param options Configuration options for the podcast script
 * @returns A promise resolving to the generated podcast script
 */
export async function generatePodcastScript(options: PodcastScriptOptions): Promise<PodcastScriptResult> {
  const {
    category,
    title,
    lengthMinutes,
    tone,
    additionalContext = '',
    model = DEFAULT_MODEL,
    hostNames = ['Host'],
    guestNames = [],
    includeIntro = true,
    includeOutro = true,
    includeAds = false,
    targetAudience = 'general audience',
    maxRetries = 3
  } = options;

  // Format host and guest information
  const hostInfo = hostNames.length === 1 
    ? `a host named ${hostNames[0]}` 
    : `hosts named ${hostNames.slice(0, -1).join(', ')} and ${hostNames[hostNames.length - 1]}`;
  
  const guestInfo = guestNames.length === 0 
    ? '' 
    : guestNames.length === 1 
      ? ` and a guest named ${guestNames[0]}` 
      : ` and guests named ${guestNames.slice(0, -1).join(', ')} and ${guestNames[guestNames.length - 1]}`;

  // Build the prompt for the AI
  const suggestedTitle = title ? `titled "${title}"` : `about ${CATEGORY_DESCRIPTIONS[category]}`;
  const scriptStructure = [
    includeIntro ? "- An engaging introduction that hooks the listener" : "",
    "- Main content with clear speaker transitions",
    includeAds ? "- A brief mid-roll advertisement segment" : "",
    includeOutro ? "- A conclusion that summarizes key points and includes a call to action" : ""
  ].filter(Boolean).join("\n");

  const prompt = `Create a complete podcast script ${suggestedTitle} for ${hostInfo}${guestInfo}.

PODCAST DETAILS:
- Category: ${category} (${CATEGORY_DESCRIPTIONS[category]})
- Target length: ${lengthMinutes} minutes
- Tone: ${tone} (${TONE_DESCRIPTIONS[tone]})
- Target audience: ${targetAudience}
${additionalContext ? `- Additional context: ${additionalContext}` : ''}

SCRIPT STRUCTURE:
${scriptStructure}

FORMAT YOUR RESPONSE AS FOLLOWS:
1. Title: [Podcast Title]
2. Summary: [Brief 1-2 sentence summary]
3. Full Script: [Complete script with speaker names clearly indicated]

The script should be detailed, engaging, and approximately ${lengthMinutes} minutes long when read aloud (about ${Math.round(lengthMinutes * 150)} words).`;

  // Retry logic implementation
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await axios.post(
        OPENROUTER_API_URL,
        {
          model: model,
          messages: [
            {
              role: "system",
              content: "You are an expert podcast scriptwriter who creates engaging, natural-sounding scripts."
            },
            {
              role: "user",
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: calculateMaxTokens(lengthMinutes),
        },
        {
          headers: {
            "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
            "HTTP-Referer": "https://podcast-maker.app",
            "X-Title": "Podcast Maker App",
            "Content-Type": "application/json"
          }
        }
      );

      const generatedContent = response.data.choices[0].message.content;
      return parseScriptResponse(generatedContent, options);
    } catch (error) {
      console.error(`Attempt ${attempt + 1} failed:`, error);
      lastError = error instanceof Error ? error : new Error(String(error));
      
      // Wait before retrying (exponential backoff)
      if (attempt < maxRetries - 1) {
        const backoffTime = Math.pow(2, attempt) * 1000;
        await new Promise(resolve => setTimeout(resolve, backoffTime));
      }
    }
  }

  throw new Error(`Failed to generate podcast script after ${maxRetries} attempts: ${lastError?.message}`);
}

/**
 * Calculates the maximum tokens needed based on podcast length
 * @param lengthMinutes Desired podcast length in minutes
 * @returns Appropriate max_tokens value
 */
function calculateMaxTokens(lengthMinutes: number): number {
  // Estimate: ~150 words per minute, ~1.3 tokens per word
  return Math.min(8000, Math.round(lengthMinutes * 150 * 1.3) + 500);
}

/**
 * Parses the AI response into a structured podcast script
 * @param rawResponse The raw text response from the AI
 * @param options Original options used to generate the script
 * @returns Structured podcast script result
 */
function parseScriptResponse(rawResponse: string, options: PodcastScriptOptions): PodcastScriptResult {
  // Extract title and summary using regex
  const titleMatch = rawResponse.match(/Title:\s*(.+?)(?:\n|$)/i);
  const summaryMatch = rawResponse.match(/Summary:\s*(.+?)(?:\n\n|\n(?=[A-Za-z]+:))/is);
  
  const title = titleMatch ? titleMatch[1].trim() : options.title || `${options.category.charAt(0).toUpperCase() + options.category.slice(1)} Podcast`;
  const summary = summaryMatch ? summaryMatch[1].trim() : "";
  
  // Extract the full script (everything after "Full Script:" or similar)
  const scriptMatch = rawResponse.match(/(?:Full Script|Script):\s*(.+)/is);
  const script = scriptMatch ? scriptMatch[1].trim() : rawResponse;
  
  // Parse segments (simplified version - in a real app, this would be more sophisticated)
  const segments: PodcastSegment[] = [];
  
  // Add intro if requested
  if (options.includeIntro) {
    const introPattern = new RegExp(`(${options.hostNames.join('|')})[:\\s]+(.*?)(?=\\n\\n|$)`, 'is');
    const introMatch = script.match(introPattern);
    if (introMatch) {
      segments.push({
        type: 'intro',
        content: introMatch[2].trim(),
        speaker: introMatch[1].trim(),
        durationEstimate: estimateDuration(introMatch[2]),
        startTime: 0
      });
    }
  }
  
  // Simplified main content parsing (in a real app, this would be more sophisticated)
  let currentTime = segments.length > 0 ? segments[0].durationEstimate || 0 : 0;
  
  // Split by speaker transitions and create segments
  const speakerPattern = new RegExp(`(${[...options.hostNames, ...(options.guestNames || [])].join('|')}):\\s+`, 'g');
  let lastIndex = 0;
  let match;
  
  const scriptCopy = script.slice();
  while ((match = speakerPattern.exec(scriptCopy)) !== null) {
    const startIndex = match.index + match[0].length;
    const nextMatch = speakerPattern.exec(scriptCopy);
    const endIndex = nextMatch ? nextMatch.index : scriptCopy.length;
    speakerPattern.lastIndex = match.index + 1; // Reset to find overlapping matches
    
    const content = scriptCopy.substring(startIndex, endIndex).trim();
    if (content) {
      const segment: PodcastSegment = {
        type: 'main',
        content,
        speaker: match[1],
        durationEstimate: estimateDuration(content),
        startTime: currentTime
      };
      
      currentTime += segment.durationEstimate || 0;
      segments.push(segment);
    }
    
    lastIndex = endIndex;
  }
  
  // Add outro if requested and not already parsed
  if (options.includeOutro && segments.length > 0) {
    const lastSegment = segments[segments.length - 1];
    if (lastSegment.type !== 'outro' && lastSegment.content.includes('thank')) {
      lastSegment.type = 'outro';
    }
  }
  
  // Calculate word count
  const wordCount = script.split(/\s+/).length;
  
  return {
    title,
    script,
    summary,
    durationEstimate: currentTime,
    segments,
    metadata: {
      category: options.category,
      tone: options.tone,
      model: options.model || DEFAULT_MODEL,
      wordCount,
      generatedAt: new Date().toISOString()
    }
  };
}

/**
 * Estimates the duration of a text segment in minutes
 * @param text The text to estimate
 * @returns Estimated duration in minutes
 */
function estimateDuration(text: string): number {
  // Average speaking rate: ~150 words per minute
  const words = text.split(/\s+/).length;
  return words / 150;
}

/**
 * Get available free models from OpenRouter
 * @returns Promise resolving to list of available free models
 */
export async function getAvailableFreeModels(): Promise<{id: string, name: string}[]> {
  try {
    const response = await axios.get('https://openrouter.ai/api/v1/models', {
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "HTTP-Referer": "https://podcast-maker.app",
        "X-Title": "Podcast Maker App"
      }
    });
    
    // Filter for free models only
    return response.data.data
      .filter((model: any) => model.pricing.prompt === 0 && model.pricing.completion === 0)
      .map((model: any) => ({
        id: model.id,
        name: model.name || model.id
      }));
  } catch (error) {
    console.error('Failed to fetch available models:', error);
    
    // Return default models if API call fails
    return [
      { id: 'meta-llama/llama-3-8b-instruct', name: 'Llama 3 (8B)' },
      { id: 'mistralai/mistral-7b-instruct', name: 'Mistral (7B)' },
      { id: 'google/gemma-7b-it', name: 'Gemma (7B)' }
    ];
  }
}

/**
 * Get available podcast categories
 * @returns Array of available podcast categories with descriptions
 */
export function getPodcastCategories(): Array<{id: PodcastCategory, name: string, description: string}> {
  return Object.entries(CATEGORY_DESCRIPTIONS).map(([id, description]) => ({
    id: id as PodcastCategory,
    name: id.charAt(0).toUpperCase() + id.slice(1),
    description
  }));
}

/**
 * Get available podcast tones
 * @returns Array of available podcast tones with descriptions
 */
export function getPodcastTones(): Array<{id: PodcastTone, name: string, description: string}> {
  return Object.entries(TONE_DESCRIPTIONS).map(([id, description]) => ({
    id: id as PodcastTone,
    name: id.charAt(0).toUpperCase() + id.slice(1),
    description
  }));
}
