import { plainToInstance } from 'class-transformer';
import { SendMessageReqDto, SendMessageResDto } from './sendMessage.dto';

describe('SendMessageReqDto', () => {
  describe('transformation and basic validation', () => {
    it('should transform maxTokens from string to number', () => {
      const payload = {
        message: 'Hello',
        model: 'gpt-4o',
        modelDeveloper: 'OpenAI',
        maxTokens: '1000',
        temperature: 0.7,
        isImageGeneration: false,
        isWebSearch: false,
      };

      const instance = plainToInstance(SendMessageReqDto, payload);
      expect(instance.maxTokens).toBe(1000);
      expect(typeof instance.maxTokens).toBe('number');
    });

    it('should transform temperature from string to number', () => {
      const payload = {
        message: 'Hello',
        model: 'gpt-4o',
        modelDeveloper: 'OpenAI',
        maxTokens: 1000,
        temperature: '0.7',
        isImageGeneration: false,
        isWebSearch: false,
      };

      const instance = plainToInstance(SendMessageReqDto, payload);
      expect(instance.temperature).toBe(0.7);
      expect(typeof instance.temperature).toBe('number');
    });

    it('should transform isImageGeneration from string "true" to boolean', () => {
      const payload = {
        message: 'Hello',
        model: 'gpt-4o',
        modelDeveloper: 'OpenAI',
        maxTokens: 1000,
        temperature: 0.7,
        isImageGeneration: 'true',
        isWebSearch: false,
      };

      const instance = plainToInstance(SendMessageReqDto, payload);
      expect(instance.isImageGeneration).toBe(true);
      expect(typeof instance.isImageGeneration).toBe('boolean');
    });

    it('should transform isImageGeneration from string "false" to boolean false', () => {
      const payload = {
        message: 'Hello',
        model: 'gpt-4o',
        modelDeveloper: 'OpenAI',
        maxTokens: 1000,
        temperature: 0.7,
        isImageGeneration: 'false',
        isWebSearch: false,
      };

      const instance = plainToInstance(SendMessageReqDto, payload);
      expect(instance.isImageGeneration).toBe(false);
    });

    it('should transform isWebSearch from string "true" to boolean', () => {
      const payload = {
        message: 'Hello',
        model: 'gpt-4o',
        modelDeveloper: 'OpenAI',
        maxTokens: 1000,
        temperature: 0.7,
        isImageGeneration: false,
        isWebSearch: 'true',
      };

      const instance = plainToInstance(SendMessageReqDto, payload);
      expect(instance.isWebSearch).toBe(true);
      expect(typeof instance.isWebSearch).toBe('boolean');
    });
  });

  describe('instance creation and property assignment', () => {
    it('should create instance with all required fields', () => {
      const payload = {
        message: 'Hello, how are you?',
        model: 'gpt-4o',
        modelDeveloper: 'OpenAI',
        maxTokens: 1000,
        temperature: 0.7,
        isImageGeneration: false,
        isWebSearch: false,
      };

      const instance = plainToInstance(SendMessageReqDto, payload);
      expect(instance.message).toBe(payload.message);
      expect(instance.model).toBe(payload.model);
      expect(instance.modelDeveloper).toBe(payload.modelDeveloper);
      expect(instance.maxTokens).toBe(payload.maxTokens);
      expect(instance.temperature).toBe(payload.temperature);
      expect(instance.isImageGeneration).toBe(payload.isImageGeneration);
      expect(instance.isWebSearch).toBe(payload.isWebSearch);
    });

    it('should create instance with optional chatId and promptId', () => {
      const payload = {
        chatId: '550e8400-e29b-41d4-a716-446655440000',
        promptId: '550e8400-e29b-41d4-a716-446655440001',
        message: 'Test message',
        model: 'gpt-4o-mini',
        modelDeveloper: 'OpenAI',
        maxTokens: 512,
        temperature: 0.5,
        isImageGeneration: true,
        isWebSearch: true,
      };

      const instance = plainToInstance(SendMessageReqDto, payload);
      expect(instance.chatId).toBe(payload.chatId);
      expect(instance.promptId).toBe(payload.promptId);
    });

    it('should set optional fields as undefined when not provided', () => {
      const payload = {
        message: 'Hello',
        model: 'gpt-4o',
        modelDeveloper: 'OpenAI',
        maxTokens: 1000,
        temperature: 0.7,
        isImageGeneration: false,
        isWebSearch: false,
      };

      const instance = plainToInstance(SendMessageReqDto, payload);
      expect(instance.chatId).toBeUndefined();
      expect(instance.promptId).toBeUndefined();
    });
  });

  describe('edge cases and boundary values', () => {
    it('should accept maxTokens at minimum boundary (1)', () => {
      const payload = {
        message: 'Hello',
        model: 'gpt-4o',
        modelDeveloper: 'OpenAI',
        maxTokens: 1,
        temperature: 0.7,
        isImageGeneration: false,
        isWebSearch: false,
      };

      const instance = plainToInstance(SendMessageReqDto, payload);
      expect(instance.maxTokens).toBe(1);
    });

    it('should accept maxTokens at maximum boundary (16384)', () => {
      const payload = {
        message: 'Hello',
        model: 'gpt-4o',
        modelDeveloper: 'OpenAI',
        maxTokens: 16384,
        temperature: 0.7,
        isImageGeneration: false,
        isWebSearch: false,
      };

      const instance = plainToInstance(SendMessageReqDto, payload);
      expect(instance.maxTokens).toBe(16384);
    });

    it('should accept temperature at minimum boundary (0)', () => {
      const payload = {
        message: 'Hello',
        model: 'gpt-4o',
        modelDeveloper: 'OpenAI',
        maxTokens: 1000,
        temperature: 0,
        isImageGeneration: false,
        isWebSearch: false,
      };

      const instance = plainToInstance(SendMessageReqDto, payload);
      expect(instance.temperature).toBe(0);
    });

    it('should accept temperature at maximum boundary (1)', () => {
      const payload = {
        message: 'Hello',
        model: 'gpt-4o',
        modelDeveloper: 'OpenAI',
        maxTokens: 1000,
        temperature: 1,
        isImageGeneration: false,
        isWebSearch: false,
      };

      const instance = plainToInstance(SendMessageReqDto, payload);
      expect(instance.temperature).toBe(1);
    });

    it('should handle decimal temperatures', () => {
      const payload = {
        message: 'Hello',
        model: 'gpt-4o',
        modelDeveloper: 'OpenAI',
        maxTokens: 1000,
        temperature: 0.75,
        isImageGeneration: false,
        isWebSearch: false,
      };

      const instance = plainToInstance(SendMessageReqDto, payload);
      expect(instance.temperature).toBe(0.75);
    });

    it('should handle long messages', () => {
      const longMessage = 'A'.repeat(5000);
      const payload = {
        message: longMessage,
        model: 'gpt-4o',
        modelDeveloper: 'OpenAI',
        maxTokens: 1000,
        temperature: 0.7,
        isImageGeneration: false,
        isWebSearch: false,
      };

      const instance = plainToInstance(SendMessageReqDto, payload);
      expect(instance.message).toBe(longMessage);
      expect(instance.message.length).toBe(5000);
    });

    it('should handle different model values', () => {
      const models = [
        'gpt-4o',
        'gpt-4o-mini',
        'gpt-4.1-2025-04-14',
        'gemini-2.0-flash-lite',
        'gemini-2.5-pro',
      ];

      models.forEach(model => {
        const payload = {
          message: 'Hello',
          model,
          modelDeveloper: 'OpenAI',
          maxTokens: 1000,
          temperature: 0.7,
          isImageGeneration: false,
          isWebSearch: false,
        };

        const instance = plainToInstance(SendMessageReqDto, payload);
        expect(instance.model).toBe(model);
      });
    });
  });
});

describe('SendMessageResDto', () => {
  it('should have all required properties defined', () => {
    const instance = new SendMessageResDto();
    expect(instance).toBeDefined();
  });

  it('should be able to assign properties', () => {
    const instance = new SendMessageResDto();
    instance.chatId = 'test-chat-id';
    instance.message = 'test message';
    instance.inputTokens = 100;
    instance.outputTokens = 200;
    instance.title = 'Test Title';

    expect(instance.chatId).toBe('test-chat-id');
    expect(instance.message).toBe('test message');
    expect(instance.inputTokens).toBe(100);
    expect(instance.outputTokens).toBe(200);
    expect(instance.title).toBe('Test Title');
  });
});
