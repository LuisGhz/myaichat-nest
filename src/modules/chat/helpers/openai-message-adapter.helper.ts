import {
  ResponseInput,
  ResponseInputText,
  ResponseInputImage,
} from 'openai/resources/responses/responses.js';
import { Message } from '../entities';

export const transformMessagesToOpenAIFormat = (
  messages: Message[],
  cdnDomain: string,
): ResponseInput => {
  return messages.map((msg, index) => {
    // Handle user messages
    if (msg.role === 'user') {
      const content: Array<ResponseInputText | ResponseInputImage> = [];

      // Add text content
      content.push({ type: 'input_text', text: msg.content });

      // Add image if present in user message
      if (msg.fileKey && isImage(msg.fileKey)) {
        const imageUrl = `${cdnDomain}${msg.fileKey}`;
        content.push({
          type: 'input_image',
          image_url: imageUrl,
          detail: 'auto',
        });
      }

      if (index > 0) {
        const prevMsg = messages[index - 1];
        if (
          prevMsg.role === 'assistant' &&
          prevMsg.fileKey &&
          isImage(prevMsg.fileKey)
        ) {
          const assistantImageUrl = `${cdnDomain}${prevMsg.fileKey}`;
          content.push({
            type: 'input_image',
            image_url: assistantImageUrl,
            detail: 'high',
          });
        }
      }

      return { role: 'user', content };
    }

    return {
      role: 'assistant',
      content: msg.content,
    };
  });
};

export const transformNewMessageToOpenAIFormat = (
  message: string,
  cdnDomain: string,
  fileKey?: string,
): ResponseInput => {
  const content: Array<ResponseInputText | ResponseInputImage> = [
    { type: 'input_text' as const, text: message },
  ];
  if (fileKey && isImage(fileKey)) {
    const imageUrl = `${cdnDomain}${fileKey}`;
    content.push({
      type: 'input_image' as const,
      image_url: imageUrl,
      detail: 'high',
    });
  }
  return [
    {
      role: 'user',
      content,
    },
  ];
};

export const isImage = (fileKey: string): boolean => {
  const imageExtensions = ['.png', '.jpg', '.jpeg'];
  return imageExtensions.some((ext) => fileKey.endsWith(ext));
};
