import { Message } from "../entities";

export interface StreamResponseParams {
  previousMessages: Message[];
  newMessage: string;
  model: string;
  maxTokens: number;
  temperature: number;
  fileKey?: string;
}

export interface StreamResponseResult {
  content: string;
  inputTokens: number;
  outputTokens: number;
}

export interface AIProvider {
  /**
   * Unique identifier for the provider (e.g., 'openai', 'gemini', 'anthropic')
   */
  readonly providerName: string;

  /**
   * Stream a response from the AI provider
   * @param params - The parameters for the request
   * @param onDelta - Callback for each text delta received
   * @returns The complete response with token usage
   */
  streamResponse(
    params: StreamResponseParams,
    onDelta: (delta: string) => void,
  ): Promise<StreamResponseResult>;

  /**
   * Generate a title for a chat based on the first user message and assistant response
   */
  generateTitle(
    userMessage: string,
    assistantResponse: string,
  ): Promise<string>;
}

export const AI_PROVIDERS = Symbol('AI_PROVIDERS');
