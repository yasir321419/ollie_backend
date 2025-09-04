// AI Model Configuration
// Easily change models here instead of searching through code

const AI_MODELS = {
  // Chat/Conversation Models
  CHAT: 'gpt-4.1-mini-2025-04-14',  // Latest mini model
  // CHAT: 'gpt-4o-mini',             // Alternative fast model
  // CHAT: 'gpt-4o',                  // Most capable, higher cost
  // CHAT: 'gpt-4',                   // Standard GPT-4
  // CHAT: 'gpt-3.5-turbo',           // Cheapest option
  
  // Audio Models
  SPEECH_TO_TEXT: 'whisper-1',        // Industry standard
  TEXT_TO_SPEECH: 'gpt-4o-mini-tts',  // Advanced TTS with voice instructions
  // TEXT_TO_SPEECH: 'tts-1-hd',      // Standard high quality
  // TEXT_TO_SPEECH: 'tts-1',         // Standard quality, faster
  
  // Voice Options for TTS
  DEFAULT_VOICE: 'alloy',             // Neutral voice
  // OTHER_VOICES: ['echo', 'fable', 'onyx', 'nova', 'shimmer']
};

// Model Settings
const MODEL_SETTINGS = {
  MAX_TOKENS: 1000,
  TEMPERATURE: 0.7,
  AUDIO_FORMAT: 'mp3'
};

// Voice Instructions for gpt-4o-mini-tts
const VOICE_INSTRUCTIONS = {
  DEFAULT: "Style: Cheerful. Emotion: Friendly. Speak in a caring, supportive, and encouraging tone. Sound warm and empathetic, like a helpful friend who genuinely cares about the user's wellbeing. Use a gentle pace and emphasize important points with warmth.",
  ENCOURAGING: "Style: Cheerful. Emotion: Friendly. Use an uplifting and motivational tone. Sound enthusiastic and positive while maintaining warmth and care.",
  CALM: "Style: Cheerful. Emotion: Friendly. Speak in a very calm, soothing voice. Use slow, gentle pacing that helps the user feel relaxed and supported.",
  PROFESSIONAL: "Style: Cheerful. Emotion: Friendly. Maintain a professional but warm tone. Sound competent and reliable while still being caring and approachable."
};

// Cost Information (approximate, check OpenAI pricing for current rates)
const MODEL_COSTS = {
  'gpt-4o-mini': '~15x cheaper than GPT-4',
  'gpt-4o': '~2x cheaper than GPT-4',
  'gpt-4': 'Premium pricing',
  'gpt-3.5-turbo': 'Most economical',
  'whisper-1': '$0.006 per minute',
  'tts-1-hd': '$30 per 1M characters',
  'tts-1': '$15 per 1M characters'
};

module.exports = {
  AI_MODELS,
  MODEL_SETTINGS,
  VOICE_INSTRUCTIONS,
  MODEL_COSTS
};