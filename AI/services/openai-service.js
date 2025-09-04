const OpenAI = require('openai');
const { AI_MODELS, MODEL_SETTINGS, VOICE_INSTRUCTIONS } = require('../config/models');
const { getTasksByUserId, createUserTask, markTaskComplete } = require('./task-service');
const { getBlogsByTopic, getLatestBlogs, getAllTopics } = require('./blog-service');
const { getLatestEvents, getAllEvents } = require('./event-service');
const { getUserProfile } = require('./user-service');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Define available functions that the AI can call
const availableTools = [
  {
    type: 'function',
    function: {
      name: 'get_user_tasks',
      description: 'Get all tasks for the current user, optionally filtered by completion status',
      parameters: {
        type: 'object',
        properties: {
          completed: {
            type: 'boolean',
            description: 'Filter tasks by completion status (true for completed, false for pending, omit for all)'
          }
        },
        required: []
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'create_task',
      description: 'Create a new task for the user',
      parameters: {
        type: 'object',
        properties: {
          taskName: {
            type: 'string',
            description: 'Title of the task'
          },
          taskDescription: {
            type: 'string',
            description: 'Description of the task'
          },
          scheduledAt: {
            type: 'string',
            description: 'When the task should be scheduled (ISO format date-time)'
          }
        },
        required: ['taskName', 'taskDescription']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'complete_task',
      description: 'Mark a task as completed',
      parameters: {
        type: 'object',
        properties: {
          taskId: {
            type: 'number',
            description: 'ID of the task to mark as completed'
          }
        },
        required: ['taskId']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'get_latest_blogs',
      description: 'Get the latest blog posts',
      parameters: {
        type: 'object',
        properties: {
          limit: {
            type: 'number',
            description: 'Number of blogs to fetch (default: 5)'
          }
        },
        required: []
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'get_blogs_by_topic',
      description: 'Get blogs filtered by a specific topic/interest',
      parameters: {
        type: 'object',
        properties: {
          topicId: {
            type: 'number',
            description: 'ID of the topic/interest to filter blogs by'
          },
          limit: {
            type: 'number',
            description: 'Number of blogs to fetch (default: 5)'
          }
        },
        required: ['topicId']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'get_available_topics',
      description: 'Get all available topics/interests for blogs',
      parameters: {
        type: 'object',
        properties: {},
        required: []
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'get_latest_events',
      description: 'Get the latest upcoming events',
      parameters: {
        type: 'object',
        properties: {
          limit: {
            type: 'number',
            description: 'Number of events to fetch (default: 5)'
          }
        },
        required: []
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'get_user_profile',
      description: 'Get current user profile information',
      parameters: {
        type: 'object',
        properties: {},
        required: []
      }
    }
  }
];

// Execute function calls
async function executeFunctionCall(functionName, args, userId) {
  try {
    switch (functionName) {
      case 'get_user_tasks':
        return await getTasksByUserId(userId, args.completed);
      
      case 'create_task':
        return await createUserTask(userId, args);
      
      case 'complete_task':
        return await markTaskComplete(userId, args.taskId);
      
      case 'get_latest_blogs':
        return await getLatestBlogs(args.limit || 5);
      
      case 'get_blogs_by_topic':
        return await getBlogsByTopic(args.topicId, args.limit || 5);
      
      case 'get_available_topics':
        return await getAllTopics();
      
      case 'get_latest_events':
        return await getLatestEvents(args.limit || 5);
      
      case 'get_user_profile':
        return await getUserProfile(userId);
      
      default:
        return { error: 'Unknown function' };
    }
  } catch (error) {
    console.error(`Error executing function ${functionName}:`, error);
    return { error: error.message || 'Function execution failed' };
  }
}

const openaiService = {
  async getChatCompletion(messages, userId) {
    try {
      const response = await openai.chat.completions.create({
        model: AI_MODELS.CHAT,
        messages: messages,
        tools: availableTools,
        tool_choice: 'auto',
        max_tokens: MODEL_SETTINGS.MAX_TOKENS,
        temperature: MODEL_SETTINGS.TEMPERATURE
      });

      const aiMessage = response.choices[0].message;

      // Handle function calls
      if (aiMessage.tool_calls) {
        const conversationMessages = [aiMessage];

        for (const toolCall of aiMessage.tool_calls) {
          const functionName = toolCall.function.name;
          const functionArgs = JSON.parse(toolCall.function.arguments);

          const functionResult = await executeFunctionCall(functionName, functionArgs, userId);

          conversationMessages.push({
            role: 'tool',
            tool_call_id: toolCall.id,
            content: JSON.stringify(functionResult)
          });
        }

        // Get final response after function calls
        const finalResponse = await openai.chat.completions.create({
          model: AI_MODELS.CHAT,
          messages: [...messages, ...conversationMessages],
          max_tokens: MODEL_SETTINGS.MAX_TOKENS,
          temperature: MODEL_SETTINGS.TEMPERATURE
        });

        const finalMessage = finalResponse.choices[0].message.content;
        conversationMessages.push({ role: 'assistant', content: finalMessage });

        return {
          toolCalls: true,
          messages: conversationMessages,
          finalResponse: finalMessage
        };
      } else {
        return {
          toolCalls: false,
          content: aiMessage.content
        };
      }
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw error;
    }
  },

  async transcribeAudio(audioBuffer) {
    try {
      const response = await openai.audio.transcriptions.create({
        file: new File([audioBuffer], 'audio.wav', { type: 'audio/wav' }),
        model: AI_MODELS.SPEECH_TO_TEXT,
      });
      return response;
    } catch (error) {
      console.error('Audio transcription error:', error);
      throw error;
    }
  },

  async generateSpeech(text, voice = AI_MODELS.DEFAULT_VOICE, voiceStyle = 'DEFAULT') {
    try {
      // For gpt-4o-mini-tts, we can include voice instructions
      const voiceInstruction = VOICE_INSTRUCTIONS[voiceStyle] || VOICE_INSTRUCTIONS.DEFAULT;
      
      const response = await openai.audio.speech.create({
        model: AI_MODELS.TEXT_TO_SPEECH,
        voice: voice,
        input: text,
        response_format: MODEL_SETTINGS.AUDIO_FORMAT,
        // Add voice instructions for gpt-4o-mini-tts
        ...(AI_MODELS.TEXT_TO_SPEECH === 'gpt-4o-mini-tts' && {
          instructions: voiceInstruction
        })
      });

      return Buffer.from(await response.arrayBuffer());
    } catch (error) {
      console.error('Speech generation error:', error);
      throw error;
    }
  }
};

module.exports = { openaiService };