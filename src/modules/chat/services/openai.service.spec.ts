import { Test, TestingModule } from '@nestjs/testing';
import { OpenAIService } from './openai.service';
import { EnvService } from '@cfg/schema/env.service';
import OpenAI from 'openai';
import { StreamResponseParams, StreamResponseResult } from '../interfaces';

jest.mock('openai');

const envServiceMock = {
  openaiApiKey: 'test-openai-api-key',
  cdnDomain: 'https://cdn.example.com/',
};

const mockStreamResponse = {
  on: jest.fn(),
  finalResponse: jest.fn(),
};

const mockOpenAIClient = {
  responses: {
    stream: jest.fn(),
    create: jest.fn(),
  },
  audio: {
    transcriptions: {
      create: jest.fn(),
    },
  },
};

describe('OpenAIService', () => {
  let service: OpenAIService;
  let envServiceInstance: EnvService;

  beforeEach(async () => {
    jest.clearAllMocks();

    (OpenAI as jest.MockedClass<typeof OpenAI>).mockImplementation(
      () => mockOpenAIClient as any,
    );

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OpenAIService,
        {
          provide: EnvService,
          useValue: envServiceMock,
        },
      ],
    }).compile();

    service = module.get<OpenAIService>(OpenAIService);
    envServiceInstance = module.get<EnvService>(EnvService);
  });

  describe('streamResponse', () => {
    const baseParams: StreamResponseParams = {
      previousMessages: [],
      newMessage: 'Hello, how are you?',
      model: 'gpt-4',
      maxTokens: 1000,
      temperature: 0.7,
      isImageGeneration: false,
      isWebSearch: false,
    };

    const mockFinalResponse = {
      output_text: 'I am doing well, thank you for asking!',
      usage: {
        input_tokens: 10,
        output_tokens: 15,
      },
      output: [],
    };

    it('should stream response successfully with default parameters', async () => {
      const onDeltaMock = jest.fn();
      mockOpenAIClient.responses.stream.mockReturnValue(mockStreamResponse);
      mockStreamResponse.finalResponse.mockResolvedValue(mockFinalResponse);

      const result = await service.streamResponse(baseParams, onDeltaMock);

      expect(result).toEqual({
        content: 'I am doing well, thank you for asking!',
        inputTokens: 10,
        outputTokens: 15,
        imageKey: undefined,
      });
      expect(mockOpenAIClient.responses.stream).toHaveBeenCalledWith(
        expect.objectContaining({
          model: 'gpt-4',
          max_output_tokens: 1000,
          temperature: 0.7,
        }),
      );
    });

    it('should call onDelta callback with streaming deltas', async () => {
      const onDeltaMock = jest.fn();
      mockOpenAIClient.responses.stream.mockReturnValue(mockStreamResponse);
      mockStreamResponse.finalResponse.mockResolvedValue(mockFinalResponse);

      await service.streamResponse(baseParams, onDeltaMock);

      expect(mockStreamResponse.on).toHaveBeenCalledWith(
        'response.output_text.delta',
        expect.any(Function),
      );
    });

    it('should handle image generation response with image tokens', async () => {
      const onDeltaMock = jest.fn();
      const paramsWithImage = {
        ...baseParams,
        isImageGeneration: true,
      };

      const mockImageResponse = {
        output_text: 'Here is your generated image',
        usage: {
          input_tokens: 10,
          output_tokens: 15,
        },
        output: [
          {
            type: 'image_generation_call',
            result: 'base64imagedata',
          },
        ],
      };

      mockOpenAIClient.responses.stream.mockReturnValue(mockStreamResponse);
      mockStreamResponse.finalResponse.mockResolvedValue(mockImageResponse);

      const result = await service.streamResponse(
        paramsWithImage,
        onDeltaMock,
      );

      expect(result.imageKey).toBe('base64imagedata');
      expect(result.content).toBe('Here is your generated image');
    });

    it('should handle web search tool parameters', async () => {
      const onDeltaMock = jest.fn();
      const paramsWithWebSearch = {
        ...baseParams,
        isWebSearch: true,
      };

      mockOpenAIClient.responses.stream.mockReturnValue(mockStreamResponse);
      mockStreamResponse.finalResponse.mockResolvedValue(mockFinalResponse);

      await service.streamResponse(paramsWithWebSearch, onDeltaMock);

      expect(mockOpenAIClient.responses.stream).toHaveBeenCalledWith(
        expect.objectContaining({
          tools: expect.any(Array),
        }),
      );
    });

    it('should handle custom system prompt', async () => {
      const onDeltaMock = jest.fn();
      const paramsWithSystemPrompt = {
        ...baseParams,
        systemPrompt: 'You are a helpful assistant',
      };

      mockOpenAIClient.responses.stream.mockReturnValue(mockStreamResponse);
      mockStreamResponse.finalResponse.mockResolvedValue(mockFinalResponse);

      await service.streamResponse(paramsWithSystemPrompt, onDeltaMock);

      expect(mockOpenAIClient.responses.stream).toHaveBeenCalled();
    });

    it('should handle response with missing usage data', async () => {
      const onDeltaMock = jest.fn();
      const mockResponseNoUsage = {
        output_text: 'Response without usage',
        usage: null,
        output: [],
      };

      mockOpenAIClient.responses.stream.mockReturnValue(mockStreamResponse);
      mockStreamResponse.finalResponse.mockResolvedValue(mockResponseNoUsage);

      const result = await service.streamResponse(baseParams, onDeltaMock);

      expect(result.inputTokens).toBe(0);
      expect(result.outputTokens).toBe(0);
    });

    it('should propagate stream errors to caller', async () => {
      const onDeltaMock = jest.fn();
      const error = new Error('OpenAI API Error');

      mockOpenAIClient.responses.stream.mockReturnValue(mockStreamResponse);
      mockStreamResponse.finalResponse.mockRejectedValue(error);

      await expect(
        service.streamResponse(baseParams, onDeltaMock),
      ).rejects.toThrow('OpenAI API Error');
    });

    it('should handle network timeout errors', async () => {
      const onDeltaMock = jest.fn();
      const timeoutError = new Error('Request timeout');

      mockOpenAIClient.responses.stream.mockReturnValue(mockStreamResponse);
      mockStreamResponse.finalResponse.mockRejectedValue(timeoutError);

      await expect(
        service.streamResponse(baseParams, onDeltaMock),
      ).rejects.toThrow('Request timeout');
    });

    it('should handle empty message response', async () => {
      const onDeltaMock = jest.fn();
      const mockEmptyResponse = {
        output_text: '',
        usage: {
          input_tokens: 5,
          output_tokens: 0,
        },
        output: [],
      };

      mockOpenAIClient.responses.stream.mockReturnValue(mockStreamResponse);
      mockStreamResponse.finalResponse.mockResolvedValue(mockEmptyResponse);

      const result = await service.streamResponse(baseParams, onDeltaMock);

      expect(result.content).toBe('');
      expect(result.outputTokens).toBe(0);
    });

    it('should handle maximum token limits', async () => {
      const onDeltaMock = jest.fn();
      const paramsMaxTokens = {
        ...baseParams,
        maxTokens: 4000,
      };

      mockOpenAIClient.responses.stream.mockReturnValue(mockStreamResponse);
      mockStreamResponse.finalResponse.mockResolvedValue(mockFinalResponse);

      await service.streamResponse(paramsMaxTokens, onDeltaMock);

      expect(mockOpenAIClient.responses.stream).toHaveBeenCalledWith(
        expect.objectContaining({
          max_output_tokens: 4000,
        }),
      );
    });
  });

  describe('generateTitle', () => {
    const mockCreateResponse = {
      output_text: 'Generated Chat Title',
    };

    it('should generate chat title successfully', async () => {
      const userMessage = 'Hello, what is TypeScript?';
      const assistantResponse =
        'TypeScript is a typed superset of JavaScript.';

      mockOpenAIClient.responses.create.mockResolvedValue(mockCreateResponse);

      const result = await service.generateTitle(
        userMessage,
        assistantResponse,
      );

      expect(result).toBe('Generated Chat Title');
      expect(mockOpenAIClient.responses.create).toHaveBeenCalledWith(
        expect.objectContaining({
          max_output_tokens: 30,
        }),
      );
    });

    it('should trim whitespace from generated title', async () => {
      const userMessage = 'Test message';
      const assistantResponse = 'Test response';

      mockOpenAIClient.responses.create.mockResolvedValue({
        output_text: '  Trimmed Title  ',
      });

      const result = await service.generateTitle(
        userMessage,
        assistantResponse,
      );

      expect(result).toBe('Trimmed Title');
    });

    it('should return default title on generation error', async () => {
      const userMessage = 'Test message';
      const assistantResponse = 'Test response';

      mockOpenAIClient.responses.create.mockRejectedValue(
        new Error('API Error'),
      );

      const result = await service.generateTitle(
        userMessage,
        assistantResponse,
      );

      expect(result).toBe('New Chat');
    });

    it('should handle empty response text gracefully', async () => {
      const userMessage = 'Test message';
      const assistantResponse = 'Test response';

      mockOpenAIClient.responses.create.mockResolvedValue({
        output_text: '',
      });

      const result = await service.generateTitle(
        userMessage,
        assistantResponse,
      );

      expect(result).toBe('');
    });

    it('should handle network failure during title generation', async () => {
      const userMessage = 'Test message';
      const assistantResponse = 'Test response';

      mockOpenAIClient.responses.create.mockRejectedValue(
        new Error('Network error'),
      );

      const result = await service.generateTitle(
        userMessage,
        assistantResponse,
      );

      expect(result).toBe('New Chat');
    });

    it('should handle very long generated titles', async () => {
      const userMessage = 'Test message';
      const assistantResponse = 'Test response';
      const longTitle =
        'This is a very long title that exceeds the typical length of a chat title';

      mockOpenAIClient.responses.create.mockResolvedValue({
        output_text: longTitle,
      });

      const result = await service.generateTitle(
        userMessage,
        assistantResponse,
      );

      expect(result).toBe(longTitle);
    });
  });
});
