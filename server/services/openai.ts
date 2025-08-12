import OpenAI from "openai";

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "sk-default_key"
});

export interface ModerationResult {
  isApproved: boolean;
  flaggedCategories: string[];
  confidence: number;
}

export interface SentimentResult {
  rating: number; // 1-5 stars
  confidence: number; // 0-1
}

// Content moderation using OpenAI moderation API
export async function moderateContent(text: string): Promise<ModerationResult> {
  try {
    const moderation = await openai.moderations.create({
      input: text,
    });

    const result = moderation.results[0];
    const flaggedCategories = Object.keys(result.categories).filter(
      category => result.categories[category as keyof typeof result.categories]
    );

    return {
      isApproved: !result.flagged,
      flaggedCategories,
      confidence: Math.max(...Object.values(result.category_scores)),
    };
  } catch (error) {
    console.error("OpenAI moderation error:", error);
    // Default to approved if moderation fails
    return {
      isApproved: true,
      flaggedCategories: [],
      confidence: 0,
    };
  }
}

// Sentiment analysis for conversation health
export async function analyzeSentiment(text: string): Promise<SentimentResult> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content:
            "You are a sentiment analysis expert focused on community interactions. Analyze the sentiment of the text and provide a rating from 1 to 5 stars (where 5 is very positive, constructive, and community-building) and a confidence score between 0 and 1. Consider factors like helpfulness, kindness, authenticity, and contribution to meaningful dialogue. Respond with JSON in this format: { 'rating': number, 'confidence': number }",
        },
        {
          role: "user",
          content: text,
        },
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");

    return {
      rating: Math.max(1, Math.min(5, Math.round(result.rating || 3))),
      confidence: Math.max(0, Math.min(1, result.confidence || 0.5)),
    };
  } catch (error) {
    console.error("OpenAI sentiment analysis error:", error);
    return {
      rating: 3, // neutral default
      confidence: 0,
    };
  }
}

// Generate contextual introduction messages
export async function generateIntroductionContext(
  requesterProfile: { name: string; bio?: string },
  targetProfile: { name: string; bio?: string },
  contextMessage: string,
  sharedInterest: string
): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: `You are an expert at facilitating meaningful introductions in a community networking platform. Create a warm, contextual introduction message that:
          1. Highlights genuine shared interests or values
          2. References the specific context that sparked interest
          3. Suggests natural conversation starters
          4. Maintains authenticity and avoids overly formal language
          5. Keeps it concise but personal
          
          Format as a friendly message that could be sent directly.`,
        },
        {
          role: "user",
          content: `Introduction context:
          Requester: ${requesterProfile.name} ${requesterProfile.bio ? `(${requesterProfile.bio})` : ''}
          Target: ${targetProfile.name} ${targetProfile.bio ? `(${targetProfile.bio})` : ''}
          Shared interest/context: ${sharedInterest}
          Requester's message: ${contextMessage}
          
          Generate a warm introduction message.`,
        },
      ],
    });

    return response.choices[0].message.content || contextMessage;
  } catch (error) {
    console.error("OpenAI introduction generation error:", error);
    return contextMessage; // Fallback to original message
  }
}

// Analyze conversation patterns for smart matching
export async function analyzeConversationPatterns(
  userResponses: string[],
  userComments: string[]
): Promise<{
  communicationStyle: string;
  interests: string[];
  values: string[];
  compatibilityFactors: string[];
}> {
  try {
    const allContent = [...userResponses, ...userComments].join('\n\n');
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: `Analyze this user's communication patterns and identify:
          1. Communication style (e.g., "thoughtful and reflective", "enthusiastic and direct")
          2. Key interests (topics they engage with most)
          3. Core values (what matters to them based on their responses)
          4. Compatibility factors (what they might connect with in others)
          
          Respond with JSON in this format: 
          {
            "communicationStyle": "string",
            "interests": ["string"],
            "values": ["string"], 
            "compatibilityFactors": ["string"]
          }`,
        },
        {
          role: "user",
          content: allContent,
        },
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    
    return {
      communicationStyle: result.communicationStyle || "balanced",
      interests: result.interests || [],
      values: result.values || [],
      compatibilityFactors: result.compatibilityFactors || [],
    };
  } catch (error) {
    console.error("OpenAI conversation analysis error:", error);
    return {
      communicationStyle: "balanced",
      interests: [],
      values: [],
      compatibilityFactors: [],
    };
  }
}
