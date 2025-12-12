import { Message, MessageRole } from '../entities';

export const setSystemMessageGemini = (systemPrompt?: string) => {
  return {
    role: 'user',
    parts: [
      {
        text: systemPrompt || 'You are a helpful assistant.',
      },
    ],
  };
};

export const messagesTransformerForGemini = (messages: Message[]) => {
  return messages.map((msg) => ({
    role: msg.role,
    parts: [
      {
        text: msg.content,
      },
    ],
  }));
};

export const newMessageTransformerForGemini = (newMessage: string) => {
  return {
    role: MessageRole.USER,
    parts: [
      {
        text: newMessage,
      },
    ],
  };
};
