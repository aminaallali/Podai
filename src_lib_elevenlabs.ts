import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { PodcastSegment } from './openrouter';

// API Configuration
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY || 'sk_62f6bec5c4a683e0dcde746c298d695efc4d1c1cdb171c74';
const ELEVENLABS_API_URL = 'https://api.elevenlabs.io/v1';

// TypeScript interfaces for ElevenLabs API
export interface Voice {
  voice_id: string;
  name: string;
  category?: string;
  description?: string;
  preview_url?: string;
  gender?: 'male' | 'female' | 'other';
  age?: string;
  accent?: string;
  language?: string;
  useCase?: string;
  sampleAudioUrl?: string;
}

export interface VoiceSettings {
  stability: number;
  similarity_boost: number;
  style: number;
  use_speaker_boost: boolean;
}

export interface TextToSpeechOptions {
  text: string;
  voice_id: string;
  voice_settings?: VoiceSettings;
  model_id?: ElevenLabsModel;
  output_format?: AudioFormat;
  optimize_streaming_latency?: 0 | 1 | 2 | 3 | 4;
  onProgress?: (progress: number) => void;
  maxRetries?: number;
}

export interface SpeakerVoiceMapping {
  speakerName: string;
  voiceId: string;
  voiceSettings?: VoiceSettings;
}

export interface PodcastAudioOptions {
  segments: PodcastSegment[];
  speakerVoices: SpeakerVoiceMapping[];
  modelId?: ElevenLabsModel;
  outputFormat?: AudioFormat;
  optimizeLatency?: 0 | 1 | 2 | 3 | 4;
  onSegmentComplete?: (segmentIndex: number, audioBuffer: ArrayBuffer) => void;
  onProgress?: (overallProgress: number) => void;
  maxRetries?: number;
  defaultVoiceId?: string;
}

export interface PodcastAudioResult {
  fullAudio: ArrayBuffer;
  segmentAudios: Array<{
    segment: PodcastSegment;
    audio: ArrayBuffer;
    duration: number;
    startTime: number;
  }>;
  totalDuration: number;
  metadata: {
    format: AudioFormat;
    model: ElevenLabsModel;
    generatedAt: string;
    speakers: Array<{
      name: string;
      voiceId: string;
    }>;
  };
}

export interface VoiceCloneOptions {
  name: string;
  description?: string;
  files: File[] | ArrayBuffer[];
  labels?: Record<string, string>;
}

export type AudioFormat = 'mp3' | 'pcm' | 'pcm_24000' | 'pcm_44100' | 'wav';

export type ElevenLabsModel = 
  | 'eleven_multilingual_v2' 
  | 'eleven_multilingual_v1'
  | 'eleven_monolingual_v1'
  | 'eleven_turbo_v2'
  | 'eleven_english_v1';

// Default settings
const DEFAULT_VOICE_SETTINGS: VoiceSettings = {
  stability: 0.5,
  similarity_boost: 0.75,
  style: 0.0,
  use_speaker_boost: true
};

const DEFAULT_MODEL: ElevenLabsModel = 'eleven_multilingual_v2';
const DEFAULT_AUDIO_FORMAT: AudioFormat = 'mp3';

// Pre-selected voices for podcast hosts and guests
export const RECOMMENDED_VOICES: Record<string, Voice[]> = {
  'male_hosts': [
    { voice_id: 'pNInz6obpgDQGcFmaJgB', name: 'Adam' },
    { voice_id: 'ErXwobaYiN019PkySvjV', name: 'Antoni' },
    { voice_id: 'ODq5zmih8GrVes37Dizd', name: 'Josh' },
    { voice_id: 'ZQe5CZNOzWyzPSCn5a3c', name: 'Sam' },
  ],
  'female_hosts': [
    { voice_id: 'EXAVITQu4vr4xnSDxMaL', name: 'Bella' },
    { voice_id: 'MF3mGyEYCl7XYWbV9V6O', name: 'Elli' },
    { voice_id: 'D38z5RcWu1voky8WS1ja', name: 'Grace' },
    { voice_id: 'jBpfuIE2acCO8z3wKNLl', name: 'Rachel' },
  ],
  'male_guests': [
    { voice_id: 'VR6AewLTigWG4xSOukaG', name: 'Arnold' },
    { voice_id: 'yoZ06aMxZJJ28mfd3POQ', name: 'Daniel' },
    { voice_id: 'TxGEqnHWrfWFTfGW9XjX', name: 'Matthew' },
    { voice_id: 'GBv7mTt0atIp3Br8iCZE', name: 'Thomas' },
  ],
  'female_guests': [
    { voice_id: 'XB0fDUnXU5powFXDhCwa', name: 'Charlotte' },
    { voice_id: '21m00Tcm4TlvDq8ikWAM', name: 'Freya' },
    { voice_id: '29vD33N1CtxCmqQRPOHJ', name: 'Dorothy' },
    { voice_id: 'z9fAnlkpzviPz146aGWa', name: 'Glinda' },
  ]
};

/**
 * Fetches available voices from ElevenLabs API
 * @returns Promise resolving to array of available voices
 */
export async function getAvailableVoices(): Promise<Voice[]> {
  try {
    const response = await axios.get(`${ELEVENLABS_API_URL}/voices`, {
      headers: {
        'xi-api-key': ELEVENLABS_API_KEY,
        'Content-Type': 'application/json'
      }
    });
    
    return response.data.voices.map((voice: any) => ({
      voice_id: voice.voice_id,
      name: voice.name,
      category: voice.category,
      description: voice.description,
      preview_url: voice.preview_url,
      // Additional metadata if available
      gender: voice.labels?.gender,
      age: voice.labels?.age,
      accent: voice.labels?.accent,
      language: voice.labels?.language,
      useCase: voice.labels?.use_case
    }));
  } catch (error) {
    console.error('Failed to fetch available voices:', error);
    
    // Return recommended voices as fallback
    return [
      ...RECOMMENDED_VOICES.male_hosts,
      ...RECOMMENDED_VOICES.female_hosts
    ];
  }
}

/**
 * Converts text to speech using ElevenLabs API
 * @param options Text-to-speech options
 * @returns Promise resolving to audio as ArrayBuffer
 */
export async function textToSpeech(options: TextToSpeechOptions): Promise<ArrayBuffer> {
  const {
    text,
    voice_id,
    voice_settings = DEFAULT_VOICE_SETTINGS,
    model_id = DEFAULT_MODEL,
    output_format = DEFAULT_AUDIO_FORMAT,
    optimize_streaming_latency = 0,
    onProgress,
    maxRetries = 3
  } = options;

  // Retry logic implementation
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      // Simulate progress updates if callback provided
      if (onProgress) {
        onProgress(0.1 + (attempt * 0.05)); // Start at 10%, add 5% for each retry
      }
      
      const response = await axios.post(
        `${ELEVENLABS_API_URL}/text-to-speech/${voice_id}`,
        {
          text,
          model_id,
          voice_settings
        },
        {
          headers: {
            'xi-api-key': ELEVENLABS_API_KEY,
            'Content-Type': 'application/json',
            'Accept': getContentTypeForFormat(output_format)
          },
          params: {
            optimize_streaming_latency
          },
          responseType: 'arraybuffer',
          onDownloadProgress: (progressEvent) => {
            if (onProgress && progressEvent.total) {
              // Calculate progress percentage
              const progress = Math.min(0.9, 0.1 + (progressEvent.loaded / progressEvent.total * 0.8));
              onProgress(progress);
            }
          }
        }
      );
      
      // Final progress update
      if (onProgress) {
        onProgress(1.0);
      }
      
      return response.data;
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

  throw new Error(`Failed to convert text to speech after ${maxRetries} attempts: ${lastError?.message}`);
}

/**
 * Converts an entire podcast script to audio with multiple voices
 * @param options Podcast audio conversion options
 * @returns Promise resolving to podcast audio result
 */
export async function convertPodcastToAudio(options: PodcastAudioOptions): Promise<PodcastAudioResult> {
  const {
    segments,
    speakerVoices,
    modelId = DEFAULT_MODEL,
    outputFormat = DEFAULT_AUDIO_FORMAT,
    optimizeLatency = 0,
    onSegmentComplete,
    onProgress,
    maxRetries = 3,
    defaultVoiceId = RECOMMENDED_VOICES.male_hosts[0].voice_id
  } = options;

  // Create a voice mapping for quick lookup
  const voiceMap = new Map<string, string>();
  const voiceSettingsMap = new Map<string, VoiceSettings>();
  
  speakerVoices.forEach(mapping => {
    voiceMap.set(mapping.speakerName.toLowerCase(), mapping.voiceId);
    if (mapping.voiceSettings) {
      voiceSettingsMap.set(mapping.voiceId, mapping.voiceSettings);
    }
  });

  const segmentAudios: Array<{
    segment: PodcastSegment;
    audio: ArrayBuffer;
    duration: number;
    startTime: number;
  }> = [];
  
  let totalAudioLength = 0;
  let currentStartTime = 0;
  
  // Process each segment sequentially
  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i];
    const speakerName = segment.speaker?.toLowerCase() || '';
    
    // Find the voice ID for this speaker, or use default
    const voiceId = voiceMap.get(speakerName) || defaultVoiceId;
    const voiceSettings = voiceSettingsMap.get(voiceId) || DEFAULT_VOICE_SETTINGS;
    
    // Update progress
    if (onProgress) {
      onProgress((i / segments.length) * 0.9); // Reserve last 10% for final processing
    }
    
    try {
      // Convert segment text to speech
      const audio = await textToSpeech({
        text: segment.content,
        voice_id: voiceId,
        voice_settings: voiceSettings,
        model_id: modelId,
        output_format: outputFormat,
        optimize_streaming_latency: optimizeLatency,
        maxRetries
      });
      
      // Estimate duration (more accurate method would be to analyze the audio)
      const estimatedDuration = estimateAudioDuration(audio, outputFormat);
      
      // Add to results
      segmentAudios.push({
        segment,
        audio,
        duration: estimatedDuration,
        startTime: currentStartTime
      });
      
      // Update tracking variables
      currentStartTime += estimatedDuration;
      totalAudioLength += audio.byteLength;
      
      // Notify segment completion if callback provided
      if (onSegmentComplete) {
        onSegmentComplete(i, audio);
      }
    } catch (error) {
      console.error(`Error processing segment ${i}:`, error);
      // Continue with next segment instead of failing the entire process
    }
  }
  
  // Combine all audio segments (simplified - in production would use proper audio processing)
  const fullAudio = await combineAudioSegments(segmentAudios.map(s => s.audio), outputFormat);
  
  // Final progress update
  if (onProgress) {
    onProgress(1.0);
  }
  
  return {
    fullAudio,
    segmentAudios,
    totalDuration: currentStartTime,
    metadata: {
      format: outputFormat,
      model: modelId,
      generatedAt: new Date().toISOString(),
      speakers: Array.from(voiceMap.entries()).map(([name, voiceId]) => ({
        name,
        voiceId
      }))
    }
  };
}

/**
 * Combines multiple audio segments into a single audio file
 * @param audioBuffers Array of audio buffers to combine
 * @param format Audio format
 * @returns Promise resolving to combined audio as ArrayBuffer
 */
async function combineAudioSegments(audioBuffers: ArrayBuffer[], format: AudioFormat): Promise<ArrayBuffer> {
  // For MP3 and WAV formats, we need proper audio processing libraries
  // This is a simplified version that works for demonstration purposes
  
  // In a production app, you would use libraries like:
  // - Web Audio API (browser)
  // - node-audio-mixer (Node.js)
  // - ffmpeg.wasm (cross-platform)
  
  // Simple concatenation (works for PCM formats, not ideal for MP3/WAV)
  const totalLength = audioBuffers.reduce((acc, buffer) => acc + buffer.byteLength, 0);
  const result = new Uint8Array(totalLength);
  
  let offset = 0;
  for (const buffer of audioBuffers) {
    result.set(new Uint8Array(buffer), offset);
    offset += buffer.byteLength;
  }
  
  return result.buffer;
}

/**
 * Estimates audio duration based on buffer size and format
 * @param audioBuffer Audio buffer
 * @param format Audio format
 * @returns Estimated duration in seconds
 */
function estimateAudioDuration(audioBuffer: ArrayBuffer, format: AudioFormat): number {
  // More accurate method would analyze the audio file header
  // This is a rough estimation based on typical bitrates
  
  const byteLength = audioBuffer.byteLength;
  
  switch (format) {
    case 'mp3':
      // Assuming 128 kbps bitrate
      return byteLength / (128 * 1024 / 8);
    case 'wav':
      // Assuming 16-bit stereo at 44.1kHz
      return byteLength / (44100 * 2 * 2);
    case 'pcm':
    case 'pcm_24000':
      // Assuming 16-bit mono at 24kHz
      return byteLength / (24000 * 2);
    case 'pcm_44100':
      // Assuming 16-bit mono at 44.1kHz
      return byteLength / (44100 * 2);
    default:
      // Fallback estimation
      return byteLength / 32000;
  }
}

/**
 * Gets content type header based on audio format
 * @param format Audio format
 * @returns Content type string
 */
function getContentTypeForFormat(format: AudioFormat): string {
  switch (format) {
    case 'mp3':
      return 'audio/mpeg';
    case 'wav':
      return 'audio/wav';
    case 'pcm':
    case 'pcm_24000':
    case 'pcm_44100':
      return 'audio/pcm';
    default:
      return 'audio/mpeg';
  }
}

/**
 * Clones a voice using provided audio samples
 * @param options Voice cloning options
 * @returns Promise resolving to the new voice ID
 */
export async function cloneVoice(options: VoiceCloneOptions): Promise<string> {
  const { name, description = '', files, labels = {} } = options;
  
  try {
    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description);
    
    // Add labels if provided
    if (Object.keys(labels).length > 0) {
      formData.append('labels', JSON.stringify(labels));
    }
    
    // Add files
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file instanceof ArrayBuffer) {
        // Convert ArrayBuffer to Blob
        const blob = new Blob([file], { type: 'audio/mpeg' });
        formData.append(`files`, blob, `sample_${i}.mp3`);
      } else {
        formData.append(`files`, file);
      }
    }
    
    const response = await axios.post(
      `${ELEVENLABS_API_URL}/voices/add`,
      formData,
      {
        headers: {
          'xi-api-key': ELEVENLABS_API_KEY,
          'Content-Type': 'multipart/form-data'
        }
      }
    );
    
    return response.data.voice_id;
  } catch (error) {
    console.error('Failed to clone voice:', error);
    throw new Error(`Voice cloning failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Gets user subscription information
 * @returns Promise resolving to user subscription info
 */
export async function getUserSubscriptionInfo(): Promise<any> {
  try {
    const response = await axios.get(
      `${ELEVENLABS_API_URL}/user/subscription`,
      {
        headers: {
          'xi-api-key': ELEVENLABS_API_KEY
        }
      }
    );
    
    return response.data;
  } catch (error) {
    console.error('Failed to get subscription info:', error);
    return {
      tier: 'free',
      character_count: 0,
      character_limit: 10000,
      can_extend_character_limit: false,
      allowed_to_extend_character_limit: false,
      next_character_count_reset_unix: Date.now() + 2592000000, // 30 days from now
      voice_limit: 3,
      professional_voice_limit: 0,
      can_extend_voice_limit: false,
      can_use_instant_voice_cloning: true,
      can_use_professional_voice_cloning: false,
      currency: 'USD',
      status: 'active'
    };
  }
}

/**
 * Deletes a voice
 * @param voiceId Voice ID to delete
 * @returns Promise resolving to success status
 */
export async function deleteVoice(voiceId: string): Promise<boolean> {
  try {
    await axios.delete(
      `${ELEVENLABS_API_URL}/voices/${voiceId}`,
      {
        headers: {
          'xi-api-key': ELEVENLABS_API_KEY
        }
      }
    );
    
    return true;
  } catch (error) {
    console.error(`Failed to delete voice ${voiceId}:`, error);
    return false;
  }
}

/**
 * Edits voice settings
 * @param voiceId Voice ID to edit
 * @param name New name for the voice
 * @param description New description for the voice
 * @param labels New labels for the voice
 * @returns Promise resolving to success status
 */
export async function editVoice(
  voiceId: string, 
  name?: string, 
  description?: string, 
  labels?: Record<string, string>
): Promise<boolean> {
  try {
    const payload: any = {};
    if (name) payload.name = name;
    if (description) payload.description = description;
    if (labels) payload.labels = labels;
    
    await axios.post(
      `${ELEVENLABS_API_URL}/voices/${voiceId}/settings/edit`,
      payload,
      {
        headers: {
          'xi-api-key': ELEVENLABS_API_KEY,
          'Content-Type': 'application/json'
        }
      }
    );
    
    return true;
  } catch (error) {
    console.error(`Failed to edit voice ${voiceId}:`, error);
    return false;
  }
}

/**
 * Gets available models from ElevenLabs
 * @returns Promise resolving to available models
 */
export async function getAvailableModels(): Promise<any[]> {
  try {
    const response = await axios.get(
      `${ELEVENLABS_API_URL}/models`,
      {
        headers: {
          'xi-api-key': ELEVENLABS_API_KEY
        }
      }
    );
    
    return response.data;
  } catch (error) {
    console.error('Failed to get available models:', error);
    
    // Return default models
    return [
      {
        model_id: 'eleven_multilingual_v2',
        name: 'Multilingual v2',
        description: 'Latest version of the multilingual model, supporting 29 languages',
        token_cost_factor: 1.5
      },
      {
        model_id: 'eleven_turbo_v2',
        name: 'Turbo v2',
        description: 'Fastest model with good quality, ideal for real-time applications',
        token_cost_factor: 0.8
      },
      {
        model_id: 'eleven_multilingual_v1',
        name: 'Multilingual v1',
        description: 'Original multilingual model',
        token_cost_factor: 1.5
      },
      {
        model_id: 'eleven_monolingual_v1',
        name: 'Monolingual v1',
        description: 'English-only model with high quality',
        token_cost_factor: 1.0
      },
      {
        model_id: 'eleven_english_v1',
        name: 'English v1',
        description: 'Legacy English model',
        token_cost_factor: 1.0
      }
    ];
  }
}

/**
 * Generates a unique filename for audio storage
 * @param prefix Optional prefix for the filename
 * @param extension File extension (default: mp3)
 * @returns Unique filename
 */
export function generateAudioFilename(prefix: string = 'podcast', extension: string = 'mp3'): string {
  const timestamp = new Date().toISOString().replace(/[-:.]/g, '');
  const uuid = uuidv4().slice(0, 8);
  return `${prefix}_${timestamp}_${uuid}.${extension}`;
}

/**
 * Creates an audio blob from ArrayBuffer
 * @param audioBuffer Audio buffer
 * @param format Audio format
 * @returns Blob object
 */
export function createAudioBlob(audioBuffer: ArrayBuffer, format: AudioFormat): Blob {
  const contentType = getContentTypeForFormat(format);
  return new Blob([audioBuffer], { type: contentType });
}

/**
 * Creates a download URL for audio
 * @param audioBuffer Audio buffer
 * @param format Audio format
 * @returns Object URL for the audio
 */
export function createAudioDownloadUrl(audioBuffer: ArrayBuffer, format: AudioFormat): string {
  const blob = createAudioBlob(audioBuffer, format);
  return URL.createObjectURL(blob);
}

/**
 * Triggers download of audio file
 * @param audioBuffer Audio buffer
 * @param filename Filename for download
 * @param format Audio format
 */
export function downloadAudio(audioBuffer: ArrayBuffer, filename: string, format: AudioFormat): void {
  const url = createAudioDownloadUrl(audioBuffer, format);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  
  // Clean up
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 100);
}

/**
 * Gets recommended voices for podcast roles
 * @returns Object with recommended voices for different roles
 */
export function getRecommendedVoices(): typeof RECOMMENDED_VOICES {
  return RECOMMENDED_VOICES;
}

/**
 * Maps speakers to recommended voices
 * @param speakerNames Array of speaker names
 * @returns Mapping of speakers to recommended voices
 */
export function mapSpeakersToVoices(speakerNames: string[]): SpeakerVoiceMapping[] {
  const allVoices = [
    ...RECOMMENDED_VOICES.male_hosts,
    ...RECOMMENDED_VOICES.female_hosts,
    ...RECOMMENDED_VOICES.male_guests,
    ...RECOMMENDED_VOICES.female_guests
  ];
  
  return speakerNames.map((name, index) => {
    // Cycle through available voices
    const voice = allVoices[index % allVoices.length];
    
    return {
      speakerName: name,
      voiceId: voice.voice_id
    };
  });
}
