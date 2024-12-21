/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect, useRef } from "react";
import { FaSmile, FaMeh, FaAngry, FaSadTear } from "react-icons/fa";
import { RiSendPlaneFill } from "react-icons/ri";
import {
  generatePrompts,
  getMood,
  getPromptForMood,
  SYSTEM_PROMPT,
} from "../library/opeanai";
import { ChatCompletionMessageParam } from "openai/resources/index.mjs";
import { useDevCycleClient } from "@devcycle/nextjs-sdk";

export enum MOOD {
  "ANGRY" = "ANGRY",
  "NEUTRAL" = "NEUTRAL",
  "HAPPY" = "HAPPY",
  "FRUSTRATED" = "FRUSTRATED",
  "SAD" = "SAD",
}
export type MOOD_TYPE = {
  bgColor: string;
  textColor: string;
  buttonColor: string;
  messageColor: string;
  aiMessage: string;
  fontFamily: string;
};

const DEFAULT_MOOD_CONFIG: Record<MOOD, MOOD_TYPE> = {
  [MOOD.HAPPY]: {
    bgColor: "bg-yellow-100",
    textColor: "text-yellow-800",
    buttonColor: "bg-yellow-500 hover:bg-yellow-600",
    messageColor: "bg-orange-200",
    aiMessage: "I'm so happy to chat with you! 🌟",
    fontFamily: "font-poppins",
  },
  [MOOD.NEUTRAL]: {
    bgColor: "bg-blue-50",
    textColor: "text-blue-800",
    buttonColor: "bg-blue-500 hover:bg-blue-600",
    messageColor: "bg-blue-200",
    aiMessage: "How can I help you today? 😊",
    fontFamily: "font-helvetica",
  },
  [MOOD.ANGRY]: {
    bgColor: "bg-red-50",
    textColor: "text-red-800",
    buttonColor: "bg-red-500 hover:bg-red-600",
    messageColor: "bg-red-200",
    aiMessage: "Take deep breaths, I'm here to help. 🌸",
    fontFamily: "font-roboto",
  },
  [MOOD.SAD]: {
    bgColor: "bg-purple-50",
    textColor: "text-purple-800",
    buttonColor: "bg-purple-500 hover:bg-purple-600",
    messageColor: "bg-purple-200",
    aiMessage: "I'm here to listen and support you. 💜",
    fontFamily: "font-nunito",
  },
  [MOOD.FRUSTRATED]: {
    bgColor: "bg-orange-50",
    textColor: "text-orange-800",
    buttonColor: "bg-orange-500 hover:bg-orange-600",
    messageColor: "bg-orange-200",
    aiMessage: "Let's work through this together. 💪",
    fontFamily: "font-arial",
  },
};

const MoodChat = ({ moodSwitcherValue }: { moodSwitcherValue: MOOD_TYPE }) => {
  const [currentMood, setCurrentMood] = useState<MOOD>(MOOD.NEUTRAL);
  const [message, setMessage] = useState<string>("");
  const [messages, setMessages] = useState<ChatCompletionMessageParam[]>([
    { role: "assistant", content: "Hai how can i help you" },
  ]);

  const [moodConfig, setMoodConfig] = useState<MOOD_TYPE>(moodSwitcherValue);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const client = useDevCycleClient();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (message.trim()) {
      setMessage("");
      const newMessage = [...messages, { content: message, role: "user" }];
      setMessages(newMessage as any);
      const newMood = await getMood(message);

      const tMessage = [
        ...messages,
        {
          content: `${SYSTEM_PROMPT} \n ${getPromptForMood(newMood)}`,
          role: "assistant",
        },
        { content: message, role: "user" },
      ];

      const aiResponse = (await generatePrompts(tMessage as any)) as string;
      if (newMood in MOOD) {
        setCurrentMood(newMood);
        client.user = client.user?.updateUser(
          { user_id: "123", customData: { mood: newMood } },
          { eventFlushIntervalMS: 10, enableEdgeDB: true }
        );
        const moodTheme = (await client.variableValue(
          "mood-switcher",
          DEFAULT_MOOD_CONFIG[newMood]
        )) as MOOD_TYPE;
        setMoodConfig(moodTheme);
      } else {
        setCurrentMood(MOOD.NEUTRAL);
      }
      setMessages((prev) => [
        ...prev,
        { content: aiResponse || "", role: "assistant" },
      ]);
    }
  };

  console.log(moodConfig, "Hey, I feel really happy today!");
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  const MoodSelector = ({
    mood,
    icon: Icon,
    label,
  }: {
    mood: MOOD;
    icon: React.ComponentType;
    label: string;
  }) => (
    <button
      className={`p-4 rounded-full transition-all duration-300 transform hover:scale-110
        ${currentMood === mood ? moodConfig.buttonColor : "bg-gray-200"}
        ${currentMood === mood ? "text-white" : "text-gray-600"}`}
      aria-label={`Select ${label} mood`}
    >
      <Icon />
    </button>
  );

  return (
    <div
      className={`min-h-screen ${moodConfig.bgColor} transition-colors duration-500`}
    >
      <h1 className="text-black text-center text-4xl font-extrabold">
        {" "}
        Emo Assist
      </h1>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-white rounded-lg shadow-xl overflow-hidden">
          <div className="p-4 border-b flex justify-center space-x-6">
            <MoodSelector mood={MOOD.HAPPY} icon={FaSmile} label="Happy" />
            <MoodSelector mood={MOOD.NEUTRAL} icon={FaMeh} label="Neutral" />
            <MoodSelector mood={MOOD.ANGRY} icon={FaAngry} label="Anxious" />
            <MoodSelector mood={MOOD.SAD} icon={FaSadTear} label="Sad" />
          </div>

          <div className="h-96 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <p
                  className={`max-w-[70%] rounded-lg px-4 py-2 ${
                    msg.role === "user" ? moodConfig.textColor : "text-black"
                  } ${moodConfig.fontFamily} ${
                    msg.role === "user"
                      ? moodConfig.messageColor
                      : "bg-gray-200"
                  }`}
                >
                  {msg.content as string}
                </p>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 border-t">
            <div className="flex space-x-4">
              <input
                type="text"
                value={message}
                onChange={(e) => {
                  setMessage(e.target.value);
                }}
                onKeyDown={handleKeyDown}
                className={`flex-1 px-4 py-2 rounded-full border focus:outline-none
                  focus:ring-2 ${moodConfig.textColor}
                  ${moodConfig.fontFamily}`}
                placeholder="Type your message..."
              />
              <button
                onClick={handleSendMessage}
                className={`${moodConfig.buttonColor} text-white px-6 py-2
                  rounded-full transition-all duration-300 transform hover:scale-105
                  focus:outline-none focus:ring-2 flex items-center`}
                aria-label="Send message"
              >
                <RiSendPlaneFill className="text-xl" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MoodChat;
