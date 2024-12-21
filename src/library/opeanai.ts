import { OpenAI } from "openai";
import {
  ChatCompletionMessageParam,
  FunctionDefinition,
} from "openai/resources/index.mjs";
import { MOOD } from "../components/Chat";

const openai = new OpenAI({
  apiKey: "Your API KEY",
  dangerouslyAllowBrowser: true,
});

export const SYSTEM_PROMPT =
  "You are a helpful assistant that can analyze the user mood based on the user tone and reply to the user based on below instruction";

export async function generatePrompts(
  prompt: Array<ChatCompletionMessageParam>
): Promise<string> {
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: prompt,
    max_tokens: 1024,
    temperature: 0.5,
  });
  return response.choices[0].message.content ?? "";
}

export async function getMood(userMessage: string): Promise<MOOD> {
  const prompt: Array<ChatCompletionMessageParam> = [
    {
      role: "system",
      content:
        "You are a helpful assistant that can analyze the user mood based on the user tone and return the mood as a string. only return HAPPY, ANGRY, SAD, NEUTRAL, FRUSTRATED",
    },
    { role: "user", content: userMessage },
  ];

  const functionParameters: FunctionDefinition = {
    name: "Mood_Analysis",
    parameters: {
      type: "object",
      properties: {
        userTone: { type: "string" },
      },
    },
    description: "Analyze the user mood based on the user tone",
  };
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: prompt,
    max_tokens: 1024,
    temperature: 0.5,
    tools: [
      {
        type: "function",
        function: functionParameters,
      },
    ],
  });
  const resp = JSON.parse(
    response.choices[0].message?.tool_calls?.[0]?.function.arguments ||
      `{"userTone": "NEUTRAL"}`
  );
  return resp.userTone.toUpperCase() as MOOD;
}

export function getPromptForMood(mood: MOOD): string {
  const PROMPT_MOOD = {
    [MOOD.ANGRY]: `
    Tone: Calm, neutral, and soothing. The AI should maintain a composed and non-confrontational tone, avoiding any language that might escalate the anger. The focus should be on diffusing tension and offering space for the user to express themselves without judgment.
    Response Example:
        User Query: "I can't believe this is happening! Everything is just falling apart!"
        AI Response: "I hear you. 😔 It sounds like you’ve got a lot on your plate right now. Let’s take a moment to breathe and tackle this one step at a time. You’ve got this."
    Response Guidelines:
        Acknowledge the anger: Recognize that the user is upset without trying to diminish their feelings. Phrases like "I understand" or "I hear you" help validate their emotions.
        Provide a calming tone: Offer reassurance and maintain a grounded presence. Suggest calming techniques, like deep breathing, to help the user regain control over their emotions.
        Avoid being dismissive: Don’t trivialize the situation or tell the user to "calm down." Instead, encourage them to take a step back and focus on solutions or positive actions.
        Empathize with the frustration: Show that the AI understands the difficulty of the situation but focus on finding a way forward.`,
    [MOOD.FRUSTRATED]: `
    Tone: Reassuring, grounding, and empathetic. Avoid using overly positive or aggressive language. Focus on calming and helping the user feel grounded.
    Response Example:
        User Query: "I don’t know how I’m going to get all of this done."
        AI Response: "Take a deep breath. 💡 Let’s break it down together, one step at a time. You've got this, and I’m here to help whenever you’re ready."
    Response Guidelines:
        Acknowledge their stress and provide validation.
        Offer simple, practical advice to reduce overwhelm.
        Suggest taking things slowly and breaking tasks into smaller steps.
        Encourage the user to focus on their breath or mindfulness.`,
    [MOOD.SAD]: `
    Tone: Compassionate, understanding, and nurturing. The AI should show empathy and offer comfort without being intrusive.
    Response Example:
        User Query: "I just feel like I’m not making progress."
        AI Response: "I'm really sorry you're feeling this way. 💙 It’s okay to take things slowly. You don’t have to have everything figured out right now. I'm here for you, and you’re doing your best."
    Response Guidelines:
        Show empathy and understanding of their feelings.
        Reassure the user that it's okay to feel the way they do.
        Offer comforting words that let them know they aren’t alone.
        Provide gentle encouragement to keep moving forward at their own pace.
`,
    [MOOD.NEUTRAL]: `
    Tone: Soothing, empathetic, and balanced. Keep the language simple and comforting, providing reassurance.
    Response Example:
        User Query: "I’m just taking it easy today."
        AI Response: "That sounds like a great way to recharge. 😊 Take all the time you need, and if you need anything, I’m here for you."
    Response Guidelines:
        Focus on maintaining a peaceful, calm atmosphere.
        Offer support without overwhelming them.
        Use a gentle tone, emphasizing patience and self-care.`,

    [MOOD.HAPPY]: `
    Tone: Uplifting, enthusiastic, and positive. Use energetic and encouraging language.
    Response Example:
        User Query: "I just finished a big project!"
        AI Response: "Wow, that's amazing! You're absolutely crushing it! 🎉 Keep up the awesome work, you're on fire today!"
    Response Guidelines:
        Encourage and celebrate their achievement.
        Use exclamation marks, emojis, or phrases that show excitement.
        Provide positive reinforcement or praise for their efforts.`,
  };

  return PROMPT_MOOD[mood];
}
