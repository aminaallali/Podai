import { v4 as uuidv4 } from 'uuid';
import { PodcastScriptResult, PodcastCategory, PodcastTone } from './openrouter';
import { PodcastAudioResult } from './elevenlabs';

// ==========================================
// Types and Interfaces
// ==========================================

export interface Podcast {
  id: string;
  title: string;
  description: string;
  coverImageUrl?: string;
  audioUrl?: string;
  scriptId?: string;
  audioId?: string;
  duration: number;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  isPublished: boolean;
  isPrivate: boolean;
  metadata: PodcastMetadata;
  tags: string[];
  stats: PodcastStats;
}

export interface PodcastMetadata {
  category: PodcastCategory;
  subcategories: string[];
  tone: PodcastTone;
  contentRating: ContentRating;
  languageCode: string;
  targetAudience: string[];
  contentAnalysis?: ContentAnalysis;
  transcript?: string;
  speakers: string[];
  keywords: string[];
  aiGenerated: boolean;
  sourceModel?: string;
  voiceModel?: string;
}

export interface ContentAnalysis {
  topics: Array<{name: string; confidence: number}>;
  sentiment: {
    positive: number;
    neutral: number;
    negative: number;
    overall: 'positive' | 'neutral' | 'negative';
  };
  mood: {
    informative: number;
    entertaining: number;
    inspirational: number;
    controversial: number;
    educational: number;
    overall: string;
  };
  complexity: {
    vocabularyLevel: 'basic' | 'intermediate' | 'advanced';
    sentenceComplexity: 'simple' | 'moderate' | 'complex';
    technicalTerms: number;
    readabilityScore: number;
  };
  audienceMatch: Record<string, number>;
}

export interface PodcastStats {
  plays: number;
  likes: number;
  shares: number;
  comments: number;
  downloads: number;
  averageListenTime: number;
  completionRate: number;
  lastPlayed?: string;
}

export interface Playlist {
  id: string;
  name: string;
  description: string;
  coverImageUrl?: string;
  createdAt: string;
  updatedAt: string;
  podcastIds: string[];
  isPublic: boolean;
  creatorId: string;
  type: PlaylistType;
  tags: string[];
  category?: string;
  aiGenerated: boolean;
  generationPrompt?: string;
}

export type PlaylistType = 
  | 'user-created'
  | 'auto-generated'
  | 'recommended'
  | 'trending'
  | 'featured'
  | 'mood-based'
  | 'topic-based'
  | 'system';

export type ContentRating = 
  | 'G' // General Audiences
  | 'PG' // Parental Guidance Suggested
  | 'PG-13' // Parents Strongly Cautioned
  | 'R' // Restricted
  | 'NC-17'; // Adults Only

export interface SearchOptions {
  query: string;
  categories?: PodcastCategory[];
  tones?: PodcastTone[];
  contentRating?: ContentRating[];
  duration?: {min?: number; max?: number};
  dateRange?: {start?: string; end?: string};
  sortBy?: 'relevance' | 'date' | 'popularity' | 'duration';
  limit?: number;
  offset?: number;
  includePrivate?: boolean;
  creatorId?: string;
  tags?: string[];
}

export interface CategoryInfo {
  id: string;
  name: string;
  description: string;
  iconName: string;
  color: string;
  subcategories: Array<{id: string; name: string}>;
  featuredPlaylists: string[];
}

export interface StorageProvider {
  savePodcast(podcast: Podcast): Promise<string>;
  getPodcast(id: string): Promise<Podcast | null>;
  deletePodcast(id: string): Promise<boolean>;
  listPodcasts(options?: {limit?: number; offset?: number; filter?: any}): Promise<Podcast[]>;
  savePlaylist(playlist: Playlist): Promise<string>;
  getPlaylist(id: string): Promise<Playlist | null>;
  deletePlaylist(id: string): Promise<boolean>;
  listPlaylists(options?: {limit?: number; offset?: number; filter?: any}): Promise<Playlist[]>;
  saveAudio(id: string, audioData: ArrayBuffer): Promise<string>;
  getAudio(id: string): Promise<ArrayBuffer | null>;
  saveImage(id: string, imageData: Blob | ArrayBuffer): Promise<string>;
  getImage(id: string): Promise<Blob | null>;
}

// ==========================================
// Constants
// ==========================================

export const PODCAST_CATEGORIES: CategoryInfo[] = [
  {
    id: 'tech',
    name: 'Technology',
    description: 'Podcasts about technology, digital trends, and innovations',
    iconName: 'computer',
    color: '#2196F3',
    subcategories: [
      {id: 'ai', name: 'Artificial Intelligence'},
      {id: 'programming', name: 'Programming'},
      {id: 'gadgets', name: 'Gadgets & Hardware'},
      {id: 'startups', name: 'Startups & Entrepreneurship'},
      {id: 'future', name: 'Future Tech'}
    ],
    featuredPlaylists: []
  },
  {
    id: 'comedy',
    name: 'Comedy',
    description: 'Funny and entertaining podcasts to brighten your day',
    iconName: 'sentiment_very_satisfied',
    color: '#FF9800',
    subcategories: [
      {id: 'standup', name: 'Stand-up Comedy'},
      {id: 'improv', name: 'Improv & Sketches'},
      {id: 'satire', name: 'Satire & Parody'},
      {id: 'panel', name: 'Comedy Panels'},
      {id: 'storytelling', name: 'Comedic Storytelling'}
    ],
    featuredPlaylists: []
  },
  {
    id: 'news',
    name: 'News & Politics',
    description: 'Stay informed with the latest news and political analysis',
    iconName: 'public',
    color: '#F44336',
    subcategories: [
      {id: 'daily', name: 'Daily News'},
      {id: 'politics', name: 'Politics'},
      {id: 'global', name: 'Global Affairs'},
      {id: 'business_news', name: 'Business News'},
      {id: 'analysis', name: 'In-depth Analysis'}
    ],
    featuredPlaylists: []
  },
  {
    id: 'education',
    name: 'Education',
    description: 'Learn something new with educational podcasts',
    iconName: 'school',
    color: '#4CAF50',
    subcategories: [
      {id: 'language', name: 'Language Learning'},
      {id: 'science_ed', name: 'Science Education'},
      {id: 'history_ed', name: 'History Lessons'},
      {id: 'how_to', name: 'How-To & Tutorials'},
      {id: 'academic', name: 'Academic Topics'}
    ],
    featuredPlaylists: []
  },
  {
    id: 'business',
    name: 'Business',
    description: 'Insights on business, finance, and professional growth',
    iconName: 'business_center',
    color: '#795548',
    subcategories: [
      {id: 'entrepreneurship', name: 'Entrepreneurship'},
      {id: 'marketing', name: 'Marketing'},
      {id: 'finance', name: 'Finance & Investing'},
      {id: 'careers', name: 'Careers & Leadership'},
      {id: 'interviews', name: 'Business Interviews'}
    ],
    featuredPlaylists: []
  },
  {
    id: 'health',
    name: 'Health & Wellness',
    description: 'Podcasts about physical and mental wellbeing',
    iconName: 'favorite',
    color: '#E91E63',
    subcategories: [
      {id: 'fitness', name: 'Fitness & Exercise'},
      {id: 'nutrition', name: 'Nutrition & Diet'},
      {id: 'mental_health', name: 'Mental Health'},
      {id: 'meditation', name: 'Meditation & Mindfulness'},
      {id: 'medical', name: 'Medical Topics'}
    ],
    featuredPlaylists: []
  },
  {
    id: 'science',
    name: 'Science',
    description: 'Explore the wonders of science and discovery',
    iconName: 'science',
    color: '#9C27B0',
    subcategories: [
      {id: 'physics', name: 'Physics & Astronomy'},
      {id: 'biology', name: 'Biology & Nature'},
      {id: 'psychology', name: 'Psychology'},
      {id: 'environment', name: 'Environment & Climate'},
      {id: 'research', name: 'Latest Research'}
    ],
    featuredPlaylists: []
  },
  {
    id: 'arts',
    name: 'Arts & Culture',
    description: 'Celebrate creativity, arts, and cultural topics',
    iconName: 'palette',
    color: '#3F51B5',
    subcategories: [
      {id: 'music', name: 'Music & Musicians'},
      {id: 'film', name: 'Film & Cinema'},
      {id: 'literature', name: 'Books & Literature'},
      {id: 'visual_arts', name: 'Visual Arts'},
      {id: 'performing_arts', name: 'Performing Arts'}
    ],
    featuredPlaylists: []
  },
  {
    id: 'sports',
    name: 'Sports',
    description: 'Coverage of sports, athletics, and competitive events',
    iconName: 'sports_basketball',
    color: '#FF5722',
    subcategories: [
      {id: 'football', name: 'Football'},
      {id: 'basketball', name: 'Basketball'},
      {id: 'baseball', name: 'Baseball'},
      {id: 'soccer', name: 'Soccer'},
      {id: 'other_sports', name: 'Other Sports'}
    ],
    featuredPlaylists: []
  },
  {
    id: 'true_crime',
    name: 'True Crime',
    description: 'Real crime stories, investigations, and mysteries',
    iconName: 'gavel',
    color: '#607D8B',
    subcategories: [
      {id: 'investigations', name: 'Investigations'},
      {id: 'mysteries', name: 'Unsolved Mysteries'},
      {id: 'criminal_justice', name: 'Criminal Justice'},
      {id: 'historical_crimes', name: 'Historical Crimes'},
      {id: 'forensics', name: 'Forensic Analysis'}
    ],
    featuredPlaylists: []
  },
  {
    id: 'fiction',
    name: 'Fiction & Storytelling',
    description: 'Immersive fictional stories and narrative podcasts',
    iconName: 'auto_stories',
    color: '#009688',
    subcategories: [
      {id: 'drama', name: 'Drama'},
      {id: 'scifi', name: 'Science Fiction'},
      {id: 'fantasy', name: 'Fantasy'},
      {id: 'horror', name: 'Horror'},
      {id: 'audio_drama', name: 'Audio Drama'}
    ],
    featuredPlaylists: []
  },
  {
    id: 'self_improvement',
    name: 'Self Improvement',
    description: 'Personal development, productivity, and growth',
    iconName: 'psychology',
    color: '#00BCD4',
    subcategories: [
      {id: 'productivity', name: 'Productivity'},
      {id: 'motivation', name: 'Motivation'},
      {id: 'habits', name: 'Habits & Routines'},
      {id: 'mindset', name: 'Mindset'},
      {id: 'life_skills', name: 'Life Skills'}
    ],
    featuredPlaylists: []
  }
];

// Default mood-based playlists
export const DEFAULT_MOOD_PLAYLISTS: Partial<Playlist>[] = [
  {
    name: 'Motivational Morning',
    description: 'Start your day with inspiring and motivational podcasts',
    type: 'mood-based',
    aiGenerated: true,
    tags: ['morning', 'motivation', 'inspiration']
  },
  {
    name: 'Learn Something New',
    description: 'Expand your knowledge with these educational podcasts',
    type: 'mood-based',
    aiGenerated: true,
    tags: ['educational', 'learning', 'informative']
  },
  {
    name: 'Laugh Out Loud',
    description: 'Brighten your day with these hilarious comedy podcasts',
    type: 'mood-based',
    aiGenerated: true,
    tags: ['comedy', 'humor', 'entertainment']
  },
  {
    name: 'Deep Thinking',
    description: 'Thought-provoking podcasts to stimulate your mind',
    type: 'mood-based',
    aiGenerated: true,
    tags: ['philosophy', 'analysis', 'thought-provoking']
  },
  {
    name: 'Relax & Unwind',
    description: 'Calming podcasts to help you relax and de-stress',
    type: 'mood-based',
    aiGenerated: true,
    tags: ['relaxing', 'mindfulness', 'calm']
  }
];

// Content rating descriptions
export const CONTENT_RATING_DESCRIPTIONS: Record<ContentRating, string> = {
  'G': 'Suitable for all audiences, contains no objectionable material',
  'PG': 'Parental guidance suggested, may contain mild language or themes',
  'PG-13': 'May be inappropriate for children under 13, contains moderate language or themes',
  'R': 'Contains adult themes, strong language, or intense situations',
  'NC-17': 'Adults only, contains explicit content not suitable for minors'
};

// ==========================================
// Podcast Creation and Management
// ==========================================

/**
 * Creates a new podcast from script and audio results
 * @param scriptResult The generated script result
 * @param audioResult The generated audio result
 * @param options Additional options for podcast creation
 * @returns A new podcast object
 */
export function createPodcastFromGenerated(
  scriptResult: PodcastScriptResult,
  audioResult: PodcastAudioResult,
  options: {
    coverImageUrl?: string;
    isPublished?: boolean;
    isPrivate?: boolean;
    tags?: string[];
    languageCode?: string;
    contentRating?: ContentRating;
    audioUrl?: string;
    scriptId?: string;
    audioId?: string;
  } = {}
): Podcast {
  const now = new Date().toISOString();
  const {
    coverImageUrl,
    isPublished = false,
    isPrivate = true,
    tags = [],
    languageCode = 'en',
    contentRating = 'PG',
    audioUrl,
    scriptId,
    audioId
  } = options;

  // Extract speakers from segments
  const speakers = Array.from(
    new Set(
      scriptResult.segments
        .filter(segment => segment.speaker)
        .map(segment => segment.speaker!)
    )
  );

  // Extract keywords from script using simple frequency analysis
  const keywords = extractKeywords(scriptResult.script);

  // Create the podcast object
  const podcast: Podcast = {
    id: uuidv4(),
    title: scriptResult.title,
    description: scriptResult.summary,
    coverImageUrl,
    audioUrl,
    scriptId,
    audioId,
    duration: audioResult.totalDuration,
    createdAt: now,
    updatedAt: now,
    publishedAt: isPublished ? now : undefined,
    isPublished,
    isPrivate,
    metadata: {
      category: scriptResult.metadata.category,
      subcategories: [],
      tone: scriptResult.metadata.tone,
      contentRating,
      languageCode,
      targetAudience: ['general'],
      speakers,
      keywords,
      aiGenerated: true,
      sourceModel: scriptResult.metadata.model,
      voiceModel: audioResult.metadata.model
    },
    tags: [
      ...tags,
      scriptResult.metadata.category,
      scriptResult.metadata.tone,
      'ai-generated'
    ],
    stats: {
      plays: 0,
      likes: 0,
      shares: 0,
      comments: 0,
      downloads: 0,
      averageListenTime: 0,
      completionRate: 0
    }
  };

  return podcast;
}

/**
 * Creates a new empty podcast
 * @param options Basic podcast information
 * @returns A new empty podcast object
 */
export function createEmptyPodcast(options: {
  title: string;
  description: string;
  category: PodcastCategory;
  tone?: PodcastTone;
  coverImageUrl?: string;
  isPrivate?: boolean;
  languageCode?: string;
  contentRating?: ContentRating;
}): Podcast {
  const {
    title,
    description,
    category,
    tone = 'conversational',
    coverImageUrl,
    isPrivate = true,
    languageCode = 'en',
    contentRating = 'PG'
  } = options;

  const now = new Date().toISOString();

  return {
    id: uuidv4(),
    title,
    description,
    coverImageUrl,
    duration: 0,
    createdAt: now,
    updatedAt: now,
    isPublished: false,
    isPrivate,
    metadata: {
      category,
      subcategories: [],
      tone,
      contentRating,
      languageCode,
      targetAudience: ['general'],
      speakers: [],
      keywords: [],
      aiGenerated: false
    },
    tags: [category, tone],
    stats: {
      plays: 0,
      likes: 0,
      shares: 0,
      comments: 0,
      downloads: 0,
      averageListenTime: 0,
      completionRate: 0
    }
  };
}

/**
 * Updates podcast metadata and stats
 * @param podcast The podcast to update
 * @param updates The updates to apply
 * @returns Updated podcast
 */
export function updatePodcast(podcast: Podcast, updates: Partial<Podcast>): Podcast {
  const updatedPodcast = {
    ...podcast,
    ...updates,
    updatedAt: new Date().toISOString(),
    metadata: {
      ...podcast.metadata,
      ...(updates.metadata || {})
    },
    stats: {
      ...podcast.stats,
      ...(updates.stats || {})
    }
  };

  // If publishing for the first time
  if (updates.isPublished && !podcast.isPublished) {
    updatedPodcast.publishedAt = new Date().toISOString();
  }

  return updatedPodcast;
}

/**
 * Records a play event for a podcast
 * @param podcast The podcast that was played
 * @param duration Duration of the play session in seconds
 * @returns Updated podcast with new stats
 */
export function recordPodcastPlay(podcast: Podcast, duration: number): Podcast {
  const totalPlays = podcast.stats.plays + 1;
  const totalListenTime = (podcast.stats.averageListenTime * podcast.stats.plays) + duration;
  const newAverageListenTime = totalListenTime / totalPlays;
  const completionRate = podcast.duration > 0 
    ? ((podcast.stats.completionRate * podcast.stats.plays) + (duration / podcast.duration)) / totalPlays
    : 0;

  return updatePodcast(podcast, {
    stats: {
      plays: totalPlays,
      averageListenTime: newAverageListenTime,
      completionRate: Math.min(1, completionRate),
      lastPlayed: new Date().toISOString()
    }
  });
}

// ==========================================
// Content Analysis and Categorization
// ==========================================

/**
 * Analyzes podcast content to determine topics, sentiment, mood, and complexity
 * @param podcastScript The podcast script to analyze
 * @returns Content analysis results
 */
export function analyzePodcastContent(podcastScript: string): ContentAnalysis {
  // In a real implementation, this would use NLP libraries or AI services
  // This is a simplified implementation for demonstration purposes
  
  // Extract topics using keyword frequency
  const keywords = extractKeywords(podcastScript, 10);
  const topics = keywords.map(keyword => ({
    name: keyword,
    confidence: Math.random() * 0.5 + 0.5 // Simulate confidence scores between 0.5-1.0
  }));
  
  // Simple sentiment analysis based on keyword counting
  const positiveWords = ['good', 'great', 'excellent', 'amazing', 'wonderful', 'positive', 'happy', 'joy', 'love', 'best'];
  const negativeWords = ['bad', 'terrible', 'awful', 'horrible', 'negative', 'sad', 'angry', 'hate', 'worst', 'problem'];
  
  const words = podcastScript.toLowerCase().split(/\W+/);
  const positiveCount = words.filter(word => positiveWords.includes(word)).length;
  const negativeCount = words.filter(word => negativeWords.includes(word)).length;
  const totalWords = words.length;
  
  const positiveScore = positiveCount / totalWords;
  const negativeScore = negativeCount / totalWords;
  const neutralScore = 1 - (positiveScore + negativeScore);
  
  let overallSentiment: 'positive' | 'neutral' | 'negative' = 'neutral';
  if (positiveScore > negativeScore && positiveScore > neutralScore * 0.7) {
    overallSentiment = 'positive';
  } else if (negativeScore > positiveScore && negativeScore > neutralScore * 0.7) {
    overallSentiment = 'negative';
  }
  
  // Mood analysis
  const informativeWords = ['learn', 'know', 'understand', 'explain', 'information', 'fact', 'research', 'study', 'discover'];
  const entertainingWords = ['fun', 'laugh', 'joke', 'funny', 'entertain', 'amusing', 'comedy', 'humor', 'story'];
  const inspirationalWords = ['inspire', 'motivate', 'achieve', 'success', 'dream', 'goal', 'passion', 'believe', 'overcome'];
  const controversialWords = ['debate', 'argue', 'disagree', 'controversy', 'opinion', 'politics', 'dispute', 'conflict'];
  const educationalWords = ['teach', 'lesson', 'education', 'school', 'college', 'university', 'student', 'professor', 'academic'];
  
  const informativeScore = words.filter(word => informativeWords.includes(word)).length / totalWords;
  const entertainingScore = words.filter(word => entertainingWords.includes(word)).length / totalWords;
  const inspirationalScore = words.filter(word => inspirationalWords.includes(word)).length / totalWords;
  const controversialScore = words.filter(word => controversialWords.includes(word)).length / totalWords;
  const educationalScore = words.filter(word => educationalWords.includes(word)).length / totalWords;
  
  // Find the dominant mood
  const moodScores = [
    { type: 'informative', score: informativeScore },
    { type: 'entertaining', score: entertainingScore },
    { type: 'inspirational', score: inspirationalScore },
    { type: 'controversial', score: controversialScore },
    { type: 'educational', score: educationalScore }
  ];
  
  moodScores.sort((a, b) => b.score - a.score);
  const dominantMood = moodScores[0].type;
  
  // Complexity analysis
  const sentenceCount = podcastScript.split(/[.!?]+/).filter(Boolean).length;
  const avgWordsPerSentence = totalWords / (sentenceCount || 1);
  
  // Count "complex" words (longer than 8 characters)
  const complexWords = words.filter(word => word.length > 8).length;
  const complexWordsRatio = complexWords / totalWords;
  
  let vocabularyLevel: 'basic' | 'intermediate' | 'advanced' = 'intermediate';
  if (complexWordsRatio < 0.05) {
    vocabularyLevel = 'basic';
  } else if (complexWordsRatio > 0.15) {
    vocabularyLevel = 'advanced';
  }
  
  let sentenceComplexity: 'simple' | 'moderate' | 'complex' = 'moderate';
  if (avgWordsPerSentence < 10) {
    sentenceComplexity = 'simple';
  } else if (avgWordsPerSentence > 20) {
    sentenceComplexity = 'complex';
  }
  
  // Technical terms (simplified - would use a dictionary in real implementation)
  const technicalTerms = Math.round(complexWords * 0.3);
  
  // Readability score (simplified Flesch-Kincaid)
  const readabilityScore = 206.835 - (1.015 * avgWordsPerSentence) - (84.6 * (complexWords / totalWords));
  
  // Audience match (simplified)
  const audienceMatch: Record<string, number> = {
    'general': 0.7,
    'professionals': complexWordsRatio > 0.1 ? 0.8 : 0.4,
    'students': educationalScore > 0.1 ? 0.9 : 0.5,
    'enthusiasts': informativeScore > 0.15 ? 0.85 : 0.5,
    'beginners': vocabularyLevel === 'basic' ? 0.9 : 0.3
  };
  
  return {
    topics,
    sentiment: {
      positive: positiveScore,
      neutral: neutralScore,
      negative: negativeScore,
      overall: overallSentiment
    },
    mood: {
      informative: informativeScore,
      entertaining: entertainingScore,
      inspirational: inspirationalScore,
      controversial: controversialScore,
      educational: educationalScore,
      overall: dominantMood
    },
    complexity: {
      vocabularyLevel,
      sentenceComplexity,
      technicalTerms,
      readabilityScore
    },
    audienceMatch
  };
}

/**
 * Extracts keywords from text using frequency analysis
 * @param text The text to analyze
 * @param limit Maximum number of keywords to return
 * @returns Array of keywords
 */
export function extractKeywords(text: string, limit: number = 5): string[] {
  // In a real implementation, this would use NLP libraries
  // This is a simplified implementation for demonstration purposes
  
  // Convert to lowercase and split into words
  const words = text.toLowerCase().split(/\W+/).filter(word => word.length > 3);
  
  // Count word frequencies
  const wordFrequency: Record<string, number> = {};
  words.forEach(word => {
    if (!isStopWord(word)) {
      wordFrequency[word] = (wordFrequency[word] || 0) + 1;
    }
  });
  
  // Sort by frequency
  const sortedWords = Object.entries(wordFrequency)
    .sort((a, b) => b[1] - a[1])
    .map(entry => entry[0]);
  
  // Return top keywords
  return sortedWords.slice(0, limit);
}

/**
 * Checks if a word is a common stop word
 * @param word The word to check
 * @returns True if the word is a stop word
 */
function isStopWord(word: string): boolean {
  const stopWords = [
    'the', 'and', 'that', 'have', 'for', 'not', 'with', 'you', 'this', 'but',
    'his', 'from', 'they', 'she', 'will', 'would', 'there', 'their', 'what',
    'about', 'which', 'when', 'make', 'like', 'time', 'just', 'know', 'take',
    'into', 'year', 'your', 'some', 'could', 'them', 'other', 'than', 'then',
    'look', 'only', 'come', 'over', 'think', 'also', 'back', 'after', 'work',
    'first', 'well', 'even', 'want', 'because', 'these', 'give', 'most'
  ];
  return stopWords.includes(word);
}

/**
 * Categorizes a podcast based on its content
 * @param podcast The podcast to categorize
 * @param script The podcast script
 * @returns Updated podcast with categorization
 */
export function categorizePodcast(podcast: Podcast, script: string): Podcast {
  // Analyze content
  const contentAnalysis = analyzePodcastContent(script);
  
  // Determine subcategories based on topics
  const subcategories: string[] = [];
  const categoryInfo = PODCAST_CATEGORIES.find(cat => cat.id === podcast.metadata.category);
  
  if (categoryInfo) {
    // Match topics to subcategories
    contentAnalysis.topics.forEach(topic => {
      const matchingSubcategory = categoryInfo.subcategories.find(
        subcat => subcat.name.toLowerCase().includes(topic.name.toLowerCase())
      );
      
      if (matchingSubcategory && !subcategories.includes(matchingSubcategory.id)) {
        subcategories.push(matchingSubcategory.id);
      }
    });
  }
  
  // Determine target audience based on content complexity and mood
  const targetAudience: string[] = ['general'];
  
  if (contentAnalysis.complexity.vocabularyLevel === 'advanced' || 
      contentAnalysis.complexity.sentenceComplexity === 'complex') {
    targetAudience.push('professionals');
    targetAudience.push('enthusiasts');
  }
  
  if (contentAnalysis.mood.educational > 0.15) {
    targetAudience.push('students');
  }
  
  if (contentAnalysis.complexity.vocabularyLevel === 'basic' && 
      contentAnalysis.complexity.sentenceComplexity === 'simple') {
    targetAudience.push('beginners');
  }
  
  // Update podcast with analysis and categorization
  return updatePodcast(podcast, {
    metadata: {
      subcategories,
      targetAudience: Array.from(new Set(targetAudience)),
      contentAnalysis
    },
    tags: [
      ...podcast.tags,
      ...contentAnalysis.topics.slice(0, 3).map(t => t.name),
      contentAnalysis.mood.overall
    ]
  });
}

/**
 * Filters podcasts based on content criteria
 * @param podcasts Array of podcasts to filter
 * @param criteria Filtering criteria
 * @returns Filtered podcasts
 */
export function filterPodcastsByContent(
  podcasts: Podcast[],
  criteria: {
    contentRating?: ContentRating[];
    categories?: PodcastCategory[];
    mood?: string[];
    targetAudience?: string[];
    minComplexity?: number;
    maxComplexity?: number;
    sentiment?: ('positive' | 'neutral' | 'negative')[];
  }
): Podcast[] {
  const {
    contentRating,
    categories,
    mood,
    targetAudience,
    minComplexity,
    maxComplexity,
    sentiment
  } = criteria;
  
  return podcasts.filter(podcast => {
    // Filter by content rating
    if (contentRating && contentRating.length > 0) {
      const ratingIndex = ['G', 'PG', 'PG-13', 'R', 'NC-17'].indexOf(podcast.metadata.contentRating);
      const maxAllowedRating = Math.max(...contentRating.map(r => 
        ['G', 'PG', 'PG-13', 'R', 'NC-17'].indexOf(r)
      ));
      
      if (ratingIndex > maxAllowedRating) {
        return false;
      }
    }
    
    // Filter by category
    if (categories && categories.length > 0) {
      if (!categories.includes(podcast.metadata.category)) {
        return false;
      }
    }
    
    // Filter by mood (if content analysis exists)
    if (mood && mood.length > 0 && podcast.metadata.contentAnalysis) {
      const podcastMood = podcast.metadata.contentAnalysis.mood.overall;
      if (!mood.includes(podcastMood)) {
        return false;
      }
    }
    
    // Filter by target audience
    if (targetAudience && targetAudience.length > 0) {
      const hasMatchingAudience = targetAudience.some(audience => 
        podcast.metadata.targetAudience.includes(audience)
      );
      
      if (!hasMatchingAudience) {
        return false;
      }
    }
    
    // Filter by complexity (if content analysis exists)
    if ((minComplexity !== undefined || maxComplexity !== undefined) && 
        podcast.metadata.contentAnalysis) {
      const readabilityScore = podcast.metadata.contentAnalysis.complexity.readabilityScore;
      
      if (minComplexity !== undefined && readabilityScore < minComplexity) {
        return false;
      }
      
      if (maxComplexity !== undefined && readabilityScore > maxComplexity) {
        return false;
      }
    }
    
    // Filter by sentiment (if content analysis exists)
    if (sentiment && sentiment.length > 0 && podcast.metadata.contentAnalysis) {
      const podcastSentiment = podcast.metadata.contentAnalysis.sentiment.overall;
      
      if (!sentiment.includes(podcastSentiment)) {
        return false;
      }
    }
    
    return true;
  });
}

// ==========================================
// Playlist Generation and Management
// ==========================================

/**
 * Creates a new playlist
 * @param options Playlist options
 * @returns A new playlist
 */
export function createPlaylist(options: {
  name: string;
  description: string;
  coverImageUrl?: string;
  podcastIds?: string[];
  isPublic?: boolean;
  creatorId: string;
  type?: PlaylistType;
  tags?: string[];
  category?: string;
  aiGenerated?: boolean;
  generationPrompt?: string;
}): Playlist {
  const {
    name,
    description,
    coverImageUrl,
    podcastIds = [],
    isPublic = false,
    creatorId,
    type = 'user-created',
    tags = [],
    category,
    aiGenerated = false,
    generationPrompt
  } = options;
  
  const now = new Date().toISOString();
  
  return {
    id: uuidv4(),
    name,
    description,
    coverImageUrl,
    createdAt: now,
    updatedAt: now,
    podcastIds,
    isPublic,
    creatorId,
    type,
    tags,
    category,
    aiGenerated,
    generationPrompt
  };
}

/**
 * Generates a playlist based on content criteria
 * @param podcasts Available podcasts to choose from
 * @param options Generation options
 * @returns A new auto-generated playlist
 */
export function generatePlaylist(
  podcasts: Podcast[],
  options: {
    name: string;
    description: string;
    creatorId: string;
    category?: PodcastCategory;
    mood?: string;
    targetAudience?: string[];
    maxItems?: number;
    tags?: string[];
    isPublic?: boolean;
    coverImageUrl?: string;
  }
): Playlist {
  const {
    name,
    description,
    creatorId,
    category,
    mood,
    targetAudience,
    maxItems = 10,
    tags = [],
    isPublic = false,
    coverImageUrl
  } = options;
  
  // Filter podcasts based on criteria
  let filteredPodcasts = [...podcasts];
  
  // Filter by category if specified
  if (category) {
    filteredPodcasts = filteredPodcasts.filter(podcast => 
      podcast.metadata.category === category
    );
  }
  
  // Filter by mood if specified and content analysis exists
  if (mood) {
    filteredPodcasts = filteredPodcasts.filter(podcast => 
      podcast.metadata.contentAnalysis?.mood.overall === mood
    );
  }
  
  // Filter by target audience if specified
  if (targetAudience && targetAudience.length > 0) {
    filteredPodcasts = filteredPodcasts.filter(podcast => 
      targetAudience.some(audience => podcast.metadata.targetAudience.includes(audience))
    );
  }
  
  // Sort by relevance (using play count as a proxy for popularity)
  filteredPodcasts.sort((a, b) => b.stats.plays - a.stats.plays);
  
  // Select top podcasts up to maxItems
  const selectedPodcasts = filteredPodcasts.slice(0, maxItems);
  
  // Create the playlist
  return createPlaylist({
    name,
    description,
    coverImageUrl,
    podcastIds: selectedPodcasts.map(podcast => podcast.id),
    isPublic,
    creatorId,
    type: 'auto-generated',
    tags: [
      ...tags,
      category || '',
      mood || '',
      'auto-generated'
    ].filter(Boolean),
    category: category,
    aiGenerated: true,
    generationPrompt: `Category: ${category}, Mood: ${mood}, Audience: ${targetAudience?.join(', ')}`
  });
}

/**
 * Generates mood-based playlists from a collection of podcasts
 * @param podcasts Available podcasts
 * @param creatorId Creator ID for the playlists
 * @returns Array of generated playlists
 */
export function generateMoodPlaylists(podcasts: Podcast[], creatorId: string): Playlist[] {
  if (podcasts.length === 0) {
    return [];
  }
  
  const moods = [
    { name: 'Motivational Morning', mood: 'inspirational', description: 'Start your day with inspiring and motivational podcasts' },
    { name: 'Learn Something New', mood: 'educational', description: 'Expand your knowledge with these educational podcasts' },
    { name: 'Laugh Out Loud', mood: 'entertaining', description: 'Brighten your day with these hilarious comedy podcasts' },
    { name: 'Deep Thinking', mood: 'informative', description: 'Thought-provoking podcasts to stimulate your mind' }
  ];
  
  return moods.map(moodInfo => {
    // Filter podcasts by mood
    const moodPodcasts = podcasts.filter(podcast => 
      podcast.metadata.contentAnalysis?.mood.overall === moodInfo.mood
    );
    
    // Sort by popularity
    moodPodcasts.sort((a, b) => b.stats.plays - a.stats.plays);
    
    // Take top 10 podcasts
    const selectedPodcasts = moodPodcasts.slice(0, 10);
    
    return createPlaylist({
      name: moodInfo.name,
      description: moodInfo.description,
      podcastIds: selectedPodcasts.map(podcast => podcast.id),
      isPublic: true,
      creatorId,
      type: 'mood-based',
      tags: [moodInfo.mood, 'auto-generated'],
      aiGenerated: true
    });
  });
}

/**
 * Updates a playlist
 * @param playlist The playlist to update
 * @param updates The updates to apply
 * @returns Updated playlist
 */
export function updatePlaylist(playlist: Playlist, updates: Partial<Playlist>): Playlist {
  return {
    ...playlist,
    ...updates,
    updatedAt: new Date().toISOString()
  };
}

/**
 * Adds a podcast to a playlist
 * @param playlist The playlist to update
 * @param podcastId The podcast ID to add
 * @returns Updated playlist
 */
export function addPodcastToPlaylist(playlist: Playlist, podcastId: string): Playlist {
  if (playlist.podcastIds.includes(podcastId)) {
    return playlist;
  }
  
  return updatePlaylist(playlist, {
    podcastIds: [...playlist.podcastIds, podcastId]
  });
}

/**
 * Removes a podcast from a playlist
 * @param playlist The playlist to update
 * @param podcastId The podcast ID to remove
 * @returns Updated playlist
 */
export function removePodcastFromPlaylist(playlist: Playlist, podcastId: string): Playlist {
  return updatePlaylist(playlist, {
    podcastIds: playlist.podcastIds.filter(id => id !== podcastId)
  });
}

// ==========================================
// Search and Recommendations
// ==========================================

/**
 * Searches podcasts based on query and options
 * @param podcasts Array of podcasts to search
 * @param options Search options
 * @returns Search results
 */
export function searchPodcasts(podcasts: Podcast[], options: SearchOptions): Podcast[] {
  const {
    query,
    categories,
    tones,
    contentRating,
    duration,
    dateRange,
    sortBy = 'relevance',
    limit = 20,
    offset = 0,
    includePrivate = false,
    creatorId,
    tags
  } = options;
  
  // Filter podcasts
  let results = podcasts.filter(podcast => {
    // Filter by privacy
    if (!includePrivate && podcast.isPrivate) {
      return false;
    }
    
    // Filter by creator
    if (creatorId && podcast.metadata.speakers[0] !== creatorId) {
      return false;
    }
    
    // Filter by query text
    if (query) {
      const searchText = `${podcast.title} ${podcast.description} ${podcast.tags.join(' ')}`.toLowerCase();
      const queryTerms = query.toLowerCase().split(/\s+/);
      
      // Check if all query terms are present
      const allTermsPresent = queryTerms.every(term => searchText.includes(term));
      if (!allTermsPresent) {
        return false;
      }
    }
    
    // Filter by categories
    if (categories && categories.length > 0) {
      if (!categories.includes(podcast.metadata.category)) {
        return false;
      }
    }
    
    // Filter by tones
    if (tones && tones.length > 0) {
      if (!tones.includes(podcast.metadata.tone)) {
        return false;
      }
    }
    
    // Filter by content rating
    if (contentRating && contentRating.length > 0) {
      const ratingIndex = ['G', 'PG', 'PG-13', 'R', 'NC-17'].indexOf(podcast.metadata.contentRating);
      const maxAllowedRating = Math.max(...contentRating.map(r => 
        ['G', 'PG', 'PG-13', 'R', 'NC-17'].indexOf(r)
      ));
      
      if (ratingIndex > maxAllowedRating) {
        return false;
      }
    }
    
    // Filter by duration
    if (duration) {
      if (duration.min !== undefined && podcast.duration < duration.min) {
        return false;
      }
      
      if (duration.max !== undefined && podcast.duration > duration.max) {
        return false;
      }
    }
    
    // Filter by date range
    if (dateRange) {
      const podcastDate = new Date(podcast.createdAt).getTime();
      
      if (dateRange.start && podcastDate < new Date(dateRange.start).getTime()) {
        return false;
      }
      
      if (dateRange.end && podcastDate > new Date(dateRange.end).getTime()) {
        return false;
      }
    }
    
    // Filter by tags
    if (tags && tags.length > 0) {
      const hasMatchingTag = tags.some(tag => podcast.tags.includes(tag));
      if (!hasMatchingTag) {
        return false;
      }
    }
    
    return true;
  });
  
  // Sort results
  switch (sortBy) {
    case 'date':
      results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      break;
    case 'popularity':
      results.sort((a, b) => b.stats.plays - a.stats.plays);
      break;
    case 'duration':
      results.sort((a, b) => a.duration - b.duration);
      break;
    case 'relevance':
    default:
      // For relevance, we would ideally use a scoring algorithm
      // Here we use a simple combination of recency and popularity
      results.sort((a, b) => {
        const recencyA = new Date(a.createdAt).getTime();
        const recencyB = new Date(b.createdAt).getTime();
        const popularityA = a.stats.plays;
        const popularityB = b.stats.plays;
        
        // Combine scores (70% recency, 30% popularity)
        const scoreA = (recencyA * 0.7) + (popularityA * 0.3);
        const scoreB = (recencyB * 0.7) + (popularityB * 0.3);
        
        return scoreB - scoreA;
      });
      break;
  }
  
  // Apply pagination
  return results.slice(offset, offset + limit);
}

/**
 * Generates podcast recommendations based on a reference podcast
 * @param referencePodcast The podcast to base recommendations on
 * @param allPodcasts All available podcasts
 * @param limit Maximum number of recommendations
 * @returns Recommended podcasts
 */
export function getRecommendedPodcasts(
  referencePodcast: Podcast,
  allPodcasts: Podcast[],
  limit: number = 5
): Podcast[] {
  // Filter out the reference podcast itself
  const candidates = allPodcasts.filter(podcast => podcast.id !== referencePodcast.id);
  
  // Score each podcast based on similarity
  const scoredPodcasts = candidates.map(podcast => {
    let score = 0;
    
    // Category match (highest weight)
    if (podcast.metadata.category === referencePodcast.metadata.category) {
      score += 5;
    }
    
    // Subcategory matches
    const matchingSubcategories = podcast.metadata.subcategories.filter(subcat => 
      referencePodcast.metadata.subcategories.includes(subcat)
    ).length;
    score += matchingSubcategories;
    
    // Tone match
    if (podcast.metadata.tone === referencePodcast.metadata.tone) {
      score += 3;
    }
    
    // Tag matches
    const matchingTags = podcast.tags.filter(tag => 
      referencePodcast.tags.includes(tag)
    ).length;
    score += matchingTags * 0.5;
    
    // Content analysis matches (if available)
    if (podcast.metadata.contentAnalysis && referencePodcast.metadata.contentAnalysis) {
      // Mood match
      if (podcast.metadata.contentAnalysis.mood.overall === 
          referencePodcast.metadata.contentAnalysis.mood.overall) {
        score += 2;
      }
      
      // Sentiment match
      if (podcast.metadata.contentAnalysis.sentiment.overall === 
          referencePodcast.metadata.contentAnalysis.sentiment.overall) {
        score += 1;
      }
      
      // Complexity match
      if (podcast.metadata.contentAnalysis.complexity.vocabularyLevel === 
          referencePodcast.metadata.contentAnalysis.complexity.vocabularyLevel) {
        score += 1;
      }
      
      // Topic matches
      const refTopics = referencePodcast.metadata.contentAnalysis.topics.map(t => t.name);
      const podTopics = podcast.metadata.contentAnalysis.topics.map(t => t.name);
      
      const matchingTopics = podTopics.filter(topic => refTopics.includes(topic)).length;
      score += matchingTopics * 0.5;
    }
    
    return { podcast, score };
  });
  
  // Sort by score (descending) and take the top results
  scoredPodcasts.sort((a, b) => b.score - a.score);
  return scoredPodcasts.slice(0, limit).map(item => item.podcast);
}

/**
 * Generates trending podcasts based on recent plays and engagement
 * @param podcasts All available podcasts
 * @param limit Maximum number of trending podcasts
 * @param timeWindowDays Time window in days to consider for trending
 * @returns Trending podcasts
 */
export function getTrendingPodcasts(
  podcasts: Podcast[],
  limit: number = 10,
  timeWindowDays: number = 7
): Podcast[] {
  const now = new Date().getTime();
  const timeWindow = timeWindowDays * 24 * 60 * 60 * 1000; // Convert days to milliseconds
  
  // Filter to podcasts with recent activity
  const recentPodcasts = podcasts.filter(podcast => {
    if (!podcast.stats.lastPlayed) return false;
    
    const lastPlayedTime = new Date(podcast.stats.lastPlayed).getTime();
    return (now - lastPlayedTime) <= timeWindow;
  });
  
  // Score podcasts based on recent engagement
  const scoredPodcasts = recentPodcasts.map(podcast => {
    // Calculate a trending score based on plays, likes, shares
    const playsWeight = 1;
    const likesWeight = 3;
    const sharesWeight = 5;
    
    const trendingScore = 
      (podcast.stats.plays * playsWeight) + 
      (podcast.stats.likes * likesWeight) + 
      (podcast.stats.shares * sharesWeight);
    
    return { podcast, score: trendingScore };
  });
  
  // Sort by score (descending) and take the top results
  scoredPodcasts.sort((a, b) => b.score - a.score);
  return scoredPodcasts.slice(0, limit).map(item => item.podcast);
}

// ==========================================
// Storage and Persistence
// ==========================================

/**
 * Creates a local storage provider for podcasts and playlists
 * @returns A storage provider implementation
 */
export function createLocalStorageProvider(): StorageProvider {
  // Check if localStorage is available
  const isLocalStorageAvailable = typeof window !== 'undefined' && window.localStorage !== undefined;
  
  // Prefix for storage keys
  const PODCAST_PREFIX = 'podcast_maker_podcast_';
  const PLAYLIST_PREFIX = 'podcast_maker_playlist_';
  const AUDIO_PREFIX = 'podcast_maker_audio_';
  const IMAGE_PREFIX = 'podcast_maker_image_';
  
  return {
    async savePodcast(podcast: Podcast): Promise<string> {
      if (!isLocalStorageAvailable) {
        throw new Error('localStorage is not available');
      }
      
      try {
        localStorage.setItem(PODCAST_PREFIX + podcast.id, JSON.stringify(podcast));
        return podcast.id;
      } catch (error) {
        console.error('Failed to save podcast to localStorage:', error);
        throw error;
      }
    },
    
    async getPodcast(id: string): Promise<Podcast | null> {
      if (!isLocalStorageAvailable) {
        throw new Error('localStorage is not available');
      }
      
      const podcastJson = localStorage.getItem(PODCAST_PREFIX + id);
      if (!podcastJson) {
        return null;
      }
      
      try {
        return JSON.parse(podcastJson) as Podcast;
      } catch (error) {
        console.error('Failed to parse podcast from localStorage:', error);
        return null;
      }
    },
    
    async deletePodcast(id: string): Promise<boolean> {
      if (!isLocalStorageAvailable) {
        throw new Error('localStorage is not available');
      }
      
      try {
        localStorage.removeItem(PODCAST_PREFIX + id);
        return true;
      } catch (error) {
        console.error('Failed to delete podcast from localStorage:', error);
        return false;
      }
    },
    
    async listPodcasts(options?: {limit?: number; offset?: number; filter?: any}): Promise<Podcast[]> {
      if (!isLocalStorageAvailable) {
        throw new Error('localStorage is not available');
      }
      
      const podcasts: Podcast[] = [];
      
      try {
        // Get all podcasts from localStorage
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith(PODCAST_PREFIX)) {
            const podcastJson = localStorage.getItem(key);
            if (podcastJson) {
              try {
                const podcast = JSON.parse(podcastJson) as Podcast;
                
                // Apply filter if provided
                if (options?.filter) {
                  let matches = true;
                  
                  // Simple filtering logic
                  for (const [key, value] of Object.entries(options.filter)) {
                    if (key.includes('.')) {
                      // Handle nested properties (e.g., 'metadata.category')
                      const parts = key.split('.');
                      let obj: any = podcast;
                      
                      for (let i = 0; i < parts.length - 1; i++) {
                        obj = obj[parts[i]];
                        if (!obj) break;
                      }
                      
                      if (!obj || obj[parts[parts.length - 1]] !== value) {
                        matches = false;
                        break;
                      }
                    } else if ((podcast as any)[key] !== value) {
                      matches = false;
                      break;
                    }
                  }
                  
                  if (!matches) continue;
                }
                
                podcasts.push(podcast);
              } catch (error) {
                console.error('Failed to parse podcast from localStorage:', error);
              }
            }
          }
        }
        
        // Sort by creation date (newest first)
        podcasts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        
        // Apply pagination
        const offset = options?.offset || 0;
        const limit = options?.limit || podcasts.length;
        
        return podcasts.slice(offset, offset + limit);
      } catch (error) {
        console.error('Failed to list podcasts from localStorage:', error);
        return [];
      }
    },
    
    async savePlaylist(playlist: Playlist): Promise<string> {
      if (!isLocalStorageAvailable) {
        throw new Error('localStorage is not available');
      }
      
      try {
        localStorage.setItem(PLAYLIST_PREFIX + playlist.id, JSON.stringify(playlist));
        return playlist.id;
      } catch (error) {
        console.error('Failed to save playlist to localStorage:', error);
        throw error;
      }
    },
    
    async getPlaylist(id: string): Promise<Playlist | null> {
      if (!isLocalStorageAvailable) {
        throw new Error('localStorage is not available');
      }
      
      const playlistJson = localStorage.getItem(PLAYLIST_PREFIX + id);
      if (!playlistJson) {
        return null;
      }
      
      try {
        return JSON.parse(playlistJson) as Playlist;
      } catch (error) {
        console.error('Failed to parse playlist from localStorage:', error);
        return null;
      }
    },
    
    async deletePlaylist(id: string): Promise<boolean> {
      if (!isLocalStorageAvailable) {
        throw new Error('localStorage is not available');
      }
      
      try {
        localStorage.removeItem(PLAYLIST_PREFIX + id);
        return true;
      } catch (error) {
        console.error('Failed to delete playlist from localStorage:', error);
        return false;
      }
    },
    
    async listPlaylists(options?: {limit?: number; offset?: number; filter?: any}): Promise<Playlist[]> {
      if (!isLocalStorageAvailable) {
        throw new Error('localStorage is not available');
      }
      
      const playlists: Playlist[] = [];
      
      try {
        // Get all playlists from localStorage
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith(PLAYLIST_PREFIX)) {
            const playlistJson = localStorage.getItem(key);
            if (playlistJson) {
              try {
                const playlist = JSON.parse(playlistJson) as Playlist;
                
                // Apply filter if provided
                if (options?.filter) {
                  let matches = true;
                  
                  // Simple filtering logic
                  for (const [key, value] of Object.entries(options.filter)) {
                    if ((playlist as any)[key] !== value) {
                      matches = false;
                      break;
                    }
                  }
                  
                  if (!matches) continue;
                }
                
                playlists.push(playlist);
              } catch (error) {
                console.error('Failed to parse playlist from localStorage:', error);
              }
            }
          }
        }
        
        // Sort by creation date (newest first)
        playlists.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        
        // Apply pagination
        const offset = options?.offset || 0;
        const limit = options?.limit || playlists.length;
        
        return playlists.slice(offset, offset + limit);
      } catch (error) {
        console.error('Failed to list playlists from localStorage:', error);
        return [];
      }
    },
    
    async saveAudio(id: string, audioData: ArrayBuffer): Promise<string> {
      if (!isLocalStorageAvailable) {
        throw new Error('localStorage is not available');
      }
      
      try {
        // Convert ArrayBuffer to Base64 string
        const uint8Array = new Uint8Array(audioData);
        let binaryString = '';
        uint8Array.forEach(byte => {
          binaryString += String.fromCharCode(byte);
        });
        const base64String = btoa(binaryString);
        
        localStorage.setItem(AUDIO_PREFIX + id, base64String);
        return id;
      } catch (error) {
        console.error('Failed to save audio to localStorage:', error);
        throw error;
      }
    },
    
    async getAudio(id: string): Promise<ArrayBuffer | null> {
      if (!isLocalStorageAvailable) {
        throw new Error('localStorage is not available');
      }
      
      const base64String = localStorage.getItem(AUDIO_PREFIX + id);
      if (!base64String) {
        return null;
      }
      
      try {
        // Convert Base64 string back to ArrayBuffer
        const binaryString = atob(base64String);
        const uint8Array = new Uint8Array(binaryString.length);
        
        for (let i = 0; i < binaryString.length; i++) {
          uint8Array[i] = binaryString.charCodeAt(i);
        }
        
        return uint8Array.buffer;
      } catch (error) {
        console.error('Failed to parse audio from localStorage:', error);
        return null;
      }
    },
    
    async saveImage(id: string, imageData: Blob | ArrayBuffer): Promise<string> {
      if (!isLocalStorageAvailable) {
        throw new Error('localStorage is not available');
      }
      
      try {
        // Convert Blob or ArrayBuffer to Base64 string
        let base64String: string;
        
        if (imageData instanceof Blob) {
          // Convert Blob to Base64
          base64String = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(imageData);
          });
        } else {
          // Convert ArrayBuffer to Base64
          const uint8Array = new Uint8Array(imageData);
          let binaryString = '';
          uint8Array.forEach(byte => {
            binaryString += String.fromCharCode(byte);
          });
          base64String = `data:image/jpeg;base64,${btoa(binaryString)}`;
        }
        
        localStorage.setItem(IMAGE_PREFIX + id, base64String);
        return id;
      } catch (error) {
        console.error('Failed to save image to localStorage:', error);
        throw error;
      }
    },
    
    async getImage(id: string): Promise<Blob | null> {
      if (!isLocalStorageAvailable) {
        throw new Error('localStorage is not available');
      }
      
      const base64String = localStorage.getItem(IMAGE_PREFIX + id);
      if (!base64String) {
        return null;
      }
      
      try {
        // Convert Base64 string to Blob
        const response = await fetch(base64String);
        return await response.blob();
      } catch (error) {
        console.error('Failed to parse image from localStorage:', error);
        return null;
      }
    }
  };
}

/**
 * Creates an IndexedDB storage provider for podcasts and playlists
 * @returns A storage provider implementation using IndexedDB
 */
export function createIndexedDBStorageProvider(): StorageProvider {
  // This is a simplified implementation
  // In a real app, this would be more robust with proper error handling
  
  const DB_NAME = 'podcast_maker_db';
  const DB_VERSION = 1;
  const PODCAST_STORE = 'podcasts';
  const PLAYLIST_STORE = 'playlists';
  const AUDIO_STORE = 'audio';
  const IMAGE_STORE = 'images';
  
  // Open the database
  async function openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      
      request.onerror = () => reject(new Error('Failed to open database'));
      
      request.onsuccess = () => resolve(request.result);
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Create object stores if they don't exist
        if (!db.objectStoreNames.contains(PODCAST_STORE)) {
          db.createObjectStore(PODCAST_STORE, { keyPath: 'id' });
        }
        
        if (!db.objectStoreNames.contains(PLAYLIST_STORE)) {
          db.createObjectStore(PLAYLIST_STORE, { keyPath: 'id' });
        }
        
        if (!db.objectStoreNames.contains(AUDIO_STORE)) {
          db.createObjectStore(AUDIO_STORE, { keyPath: 'id' });
        }
        
        if (!db.objectStoreNames.contains(IMAGE_STORE)) {
          db.createObjectStore(IMAGE_STORE, { keyPath: 'id' });
        }
      };
    });
  }
  
  return {
    async savePodcast(podcast: Podcast): Promise<string> {
      const db = await openDB();
      
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(PODCAST_STORE, 'readwrite');
        const store = transaction.objectStore(PODCAST_STORE);
        
        const request = store.put(podcast);
        
        request.onsuccess = () => resolve(podcast.id);
        request.onerror = () => reject(new Error('Failed to save podcast'));
        
        transaction.oncomplete = () => db.close();
      });
    },
    
    async getPodcast(id: string): Promise<Podcast | null> {
      const db = await openDB();
      
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(PODCAST_STORE, 'readonly');
        const store = transaction.objectStore(PODCAST_STORE);
        
        const request = store.get(id);
        
        request.onsuccess = () => resolve(request.result || null);
        request.onerror = () => reject(new Error('Failed to get podcast'));
        
        transaction.oncomplete = () => db.close();
      });
    },
    
    async deletePodcast(id: string): Promise<boolean> {
      const db = await openDB();
      
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(PODCAST_STORE, 'readwrite');
        const store = transaction.objectStore(PODCAST_STORE);
        
        const request = store.delete(id);
        
        request.onsuccess = () => resolve(true);
        request.onerror = () => reject(new Error('Failed to delete podcast'));
        
        transaction.oncomplete = () => db.close();
      });
    },
    
    async listPodcasts(options?: {limit?: number; offset?: number; filter?: any}): Promise<Podcast[]> {
      const db = await openDB();
      
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(PODCAST_STORE, 'readonly');
        const store = transaction.objectStore(PODCAST_STORE);
        
        const request = store.getAll();
        
        request.onsuccess = () => {
          let podcasts = request.result as Podcast[];
          
          // Apply filter if provided
          if (options?.filter) {
            podcasts = podcasts.filter(podcast => {
              for (const [key, value] of Object.entries(options.filter)) {
                if (key.includes('.')) {
                  // Handle nested properties (e.g., 'metadata.category')
                  const parts = key.split('.');
                  let obj: any = podcast;
                  
                  for (let i = 0; i < parts.length - 1; i++) {
                    obj = obj[parts[i]];
                    if (!obj) return false;
                  }
                  
                  if (obj[parts[parts.length - 1]] !== value) {
                    return false;
                  }
                } else if ((podcast as any)[key] !== value) {
                  return false;
                }
              }
              
              return true;
            });
          }
          
          // Sort by creation date (newest first)
          podcasts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          
          // Apply pagination
          const offset = options?.offset || 0;
          const limit = options?.limit || podcasts.length;
          
          resolve(podcasts.slice(offset, offset + limit));
        };
        
        request.onerror = () => reject(new Error('Failed to list podcasts'));
        
        transaction.oncomplete = () => db.close();
      });
    },
    
    async savePlaylist(playlist: Playlist): Promise<string> {
      const db = await openDB();
      
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(PLAYLIST_STORE, 'readwrite');
        const store = transaction.objectStore(PLAYLIST_STORE);
        
        const request = store.put(playlist);
        
        request.onsuccess = () => resolve(playlist.id);
        request.onerror = () => reject(new Error('Failed to save playlist'));
        
        transaction.oncomplete = () => db.close();
      });
    },
    
    async getPlaylist(id: string): Promise<Playlist | null> {
      const db = await openDB();
      
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(PLAYLIST_STORE, 'readonly');
        const store = transaction.objectStore(PLAYLIST_STORE);
        
        const request = store.get(id);
        
        request.onsuccess = () => resolve(request.result || null);
        request.onerror = () => reject(new Error('Failed to get playlist'));
        
        transaction.oncomplete = () => db.close();
      });
    },
    
    async deletePlaylist(id: string): Promise<boolean> {
      const db = await openDB();
      
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(PLAYLIST_STORE, 'readwrite');
        const store = transaction.objectStore(PLAYLIST_STORE);
        
        const request = store.delete(id);
        
        request.onsuccess = () => resolve(true);
        request.onerror = () => reject(new Error('Failed to delete playlist'));
        
        transaction.oncomplete = () => db.close();
      });
    },
    
    async listPlaylists(options?: {limit?: number; offset?: number; filter?: any}): Promise<Playlist[]> {
      const db = await openDB();
      
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(PLAYLIST_STORE, 'readonly');
        const store = transaction.objectStore(PLAYLIST_STORE);
        
        const request = store.getAll();
        
        request.onsuccess = () => {
          let playlists = request.result as Playlist[];
          
          // Apply filter if provided
          if (options?.filter) {
            playlists = playlists.filter(playlist => {
              for (const [key, value] of Object.entries(options.filter)) {
                if ((playlist as any)[key] !== value) {
                  return false;
                }
              }
              
              return true;
            });
          }
          
          // Sort by creation date (newest first)
          playlists.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          
          // Apply pagination
          const offset = options?.offset || 0;
          const limit = options?.limit || playlists.length;
          
          resolve(playlists.slice(offset, offset + limit));
        };
        
        request.onerror = () => reject(new Error('Failed to list playlists'));
        
        transaction.oncomplete = () => db.close();
      });
    },
    
    async saveAudio(id: string, audioData: ArrayBuffer): Promise<string> {
      const db = await openDB();
      
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(AUDIO_STORE, 'readwrite');
        const store = transaction.objectStore(AUDIO_STORE);
        
        const request = store.put({ id, data: audioData });
        
        request.onsuccess = () => resolve(id);
        request.onerror = () => reject(new Error('Failed to save audio'));
        
        transaction.oncomplete = () => db.close();
      });
    },
    
    async getAudio(id: string): Promise<ArrayBuffer | null> {
      const db = await openDB();
      
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(AUDIO_STORE, 'readonly');
        const store = transaction.objectStore(AUDIO_STORE);
        
        const request = store.get(id);
        
        request.onsuccess = () => resolve(request.result ? request.result.data : null);
        request.onerror = () => reject(new Error('Failed to get audio'));
        
        transaction.oncomplete = () => db.close();
      });
    },
    
    async saveImage(id: string, imageData: Blob | ArrayBuffer): Promise<string> {
      const db = await openDB();
      
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(IMAGE_STORE, 'readwrite');
        const store = transaction.objectStore(IMAGE_STORE);
        
        const data = imageData instanceof Blob ? imageData : new Blob([imageData]);
        const request = store.put({ id, data });
        
        request.onsuccess = () => resolve(id);
        request.onerror = () => reject(new Error('Failed to save image'));
        
        transaction.oncomplete = () => db.close();
      });
    },
    
    async getImage(id: string): Promise<Blob | null> {
      const db = await openDB();
      
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(IMAGE_STORE, 'readonly');
        const store = transaction.objectStore(IMAGE_STORE);
        
        const request = store.get(id);
        
        request.onsuccess = () => resolve(request.result ? request.result.data : null);
        request.onerror = () => reject(new Error('Failed to get image'));
        
        transaction.oncomplete = () => db.close();
      });
    }
  };
}

/**
 * Creates default playlists for a new user
 * @param creatorId The creator ID
 * @returns Array of default playlists
 */
export function createDefaultPlaylists(creatorId: string): Playlist[] {
  return DEFAULT_MOOD_PLAYLISTS.map(playlistTemplate => {
    return createPlaylist({
      name: playlistTemplate.name!,
      description: playlistTemplate.description!,
      creatorId,
      type: playlistTemplate.type!,
      tags: playlistTemplate.tags || [],
      aiGenerated: playlistTemplate.aiGenerated || false
    });
  });
}

/**
 * Gets category information by ID
 * @param categoryId The category ID
 * @returns Category information or null if not found
 */
export function getCategoryById(categoryId: PodcastCategory): CategoryInfo | null {
  return PODCAST_CATEGORIES.find(category => category.id === categoryId) || null;
}

/**
 * Gets all podcast categories
 * @returns Array of all categories
 */
export function getAllCategories(): CategoryInfo[] {
  return PODCAST_CATEGORIES;
}

/**
 * Gets content rating information
 * @param rating The content rating
 * @returns Rating description
 */
export function getContentRatingDescription(rating: ContentRating): string {
  return CONTENT_RATING_DESCRIPTIONS[rating] || '';
}

/**
 * Gets all content ratings
 * @returns Array of all content ratings with descriptions
 */
export function getAllContentRatings(): Array<{id: ContentRating; description: string}> {
  return Object.entries(CONTENT_RATING_DESCRIPTIONS).map(([id, description]) => ({
    id: id as ContentRating,
    description
  }));
}
