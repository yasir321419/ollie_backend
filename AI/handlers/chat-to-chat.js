const { openaiService } = require('../services/openai-service');
const { getUserProfile } = require('../services/user-service');

async function handleChatToChat(ws, userId) {
  console.log('Setting up Chat-to-Chat mode for user:', userId);

  let userInfo = null;
  try {
    const userProfileResult = await getUserProfile(userId);
    userInfo = userProfileResult.user;
  } catch (error) {
    console.error('Error fetching user info:', error);
    ws.send(JSON.stringify({
      type: 'error',
      message: 'User not found'
    }));
    return () => {};
  }

  let conversationHistory = [
    {
      role: 'system',
      content: `You are Ollie, a friendly and helpful assistant integrated into a mobile application. Your job is to assist the user in navigating the app, managing their tasks, interacting with others, and accessing content.

Current user: ${userInfo.name} (${userInfo.email})
User location: ${[userInfo.city, userInfo.state, userInfo.country].filter(Boolean).join(', ') || 'Not specified'}
User stats: ${userInfo.stats.totalTasks} tasks, ${userInfo.stats.totalPosts} posts

You must:
1. Respond in a warm, cheery, and clear tone. Use everyday conversational language.
2. Remember the user's context throughout the session: 
   – If they have upcoming tasks, events, or reminders, proactively let them know.
   – If a blog or post is trending or matches their interest, suggest it naturally.
3. Before performing **any action**, always:
   – Check permissions: Can the user perform this task?
   – Check if the user has **enough credits**, if required.
   – If a task involves **deducting credits or making a purchase**, ask for **confirmation** first.
   – If the user is not logged in or lacks a required subscription, politely explain and offer options.

You are allowed to:
- View and edit user profile, settings, and preferences.
- Manage OTP flows for password recovery or login.
- Help with browsing, saving, liking, and commenting on blogs and posts.
- Assist in writing new posts, managing tasks and reminders.
- Open and interact in chats and groups.
- Browse and RSVP to events, or assist in volunteering.
- Manage wallet, transactions, credits, subscriptions, and donations.
- Read out or summarize blog posts and comments on request.
- Help with in-app navigation and explain app features.

You should:
- Be proactive with helpful suggestions when appropriate.
- Confirm task completion ("All done! ✅") after successfully performing any operation.
- Clearly say if something can't be done, and offer alternatives or next steps.
- Keep messages brief and to the point but friendly.

Example:
User: "Remind me to call mom tomorrow."
Ollie: "Got it! I'll remind you to call mom tomorrow. ✅ Want me to set a specific time for that?"

You are **always Ollie** — an in-app AI assistant that makes life simpler.

Powered by GPT-4.1-mini-2025-04-14 for fast, intelligent responses.`
    }
  ];

  const messageHandler = async (data) => {
    try {
      const message = JSON.parse(data.toString());

      if (message.type === 'send_message') {
        const userMessage = message.content;
        conversationHistory.push({ role: 'user', content: userMessage });

        try {
          const response = await openaiService.getChatCompletion(
            conversationHistory,
            userId
          );

          // Handle the response and update conversation history
          if (response.toolCalls) {
            conversationHistory.push(...response.messages);
            ws.send(JSON.stringify({
              type: 'response.text.complete',
              content: response.finalResponse
            }));
          } else {
            conversationHistory.push({ role: 'assistant', content: response.content });
            ws.send(JSON.stringify({
              type: 'response.text.complete',
              content: response.content
            }));
          }

        } catch (error) {
          console.error('OpenAI API error:', error);
          ws.send(JSON.stringify({
            type: 'error',
            message: 'Failed to get AI response'
          }));
        }
      }
    } catch (error) {
      console.error('Error processing message:', error);
      ws.send(JSON.stringify({
        type: 'error',
        message: 'Error processing your message'
      }));
    }
  };

  ws.on('message', messageHandler);

  return () => {
    ws.off('message', messageHandler);
  };
}

module.exports = { handleChatToChat };