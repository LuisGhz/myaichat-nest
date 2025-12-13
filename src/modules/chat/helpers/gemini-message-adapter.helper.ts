import { Content, Part } from '@google/genai';
import { Message, MessageRole } from '../entities';

export const setSystemMessageGemini = (systemPrompt?: string): Content => {
  return {
    role: 'user',
    parts: [
      {
        text: systemPrompt || 'You are a helpful assistant.',
      },
    ],
  };
};

export const messagesTransformerForGemini = (
  messages: Message[],
): Content[] => {
  return messages.map((msg) => ({
    role: msg.role,
    parts: [
      {
        text: msg.content,
      },
    ],
  }));
};

export const newMessageTransformerForGemini = (
  newMessage: string,
  image?: {
    mimeType: string;
    dataBase64: string;
  },
): Content => {
  const partWithImage: Part[] = [];
  if (image) {
    partWithImage.push({
      inlineData: {
        data: image.dataBase64,
        mimeType: image.mimeType,
      },
    });
  }
  return {
    role: MessageRole.USER,
    parts: [
      {
        text: newMessage,
      },
      ...partWithImage,
    ],
  };
};
