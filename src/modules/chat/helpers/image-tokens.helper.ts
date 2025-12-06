/**
 * Image Generation Token Calculator
 * Calculates tokens used for image generation based on size and quality parameters
 * Token values sourced from OpenAI's image generation model documentation
 */

import type { ImageGenerationToolConfig } from '../interfaces';

/**
 * Token cost mapping for image generation based on size and quality
 * Format: { size: { quality: tokens } }
 */
const IMAGE_TOKENS_MAPPING: Record<string, Record<string, number>> = {
  '1024x1024': {
    low: 272,
    medium: 1056,
    high: 4160,
  },
  '1024x1536': {
    low: 408,
    medium: 1584,
    high: 6240,
  },
  '1536x1024': {
    low: 400,
    medium: 1568,
    high: 6208,
  },
  auto: {
    low: 272,
    medium: 1056,
    high: 4160,
  },
};

/**
 * Get the token cost for image generation based on size and quality
 * @param size - The size of the generated image
 * @param quality - The quality level of the generated image
 * @returns The number of tokens required for the image generation
 * @throws Error if size or quality combination is not found
 */
export function getImageGenerationTokens(
  size: string = '1024x1024',
  quality: string = 'medium',
): number {
  const normalizedSize = size || '1024x1024';
  const normalizedQuality = quality || 'medium';

  const sizeTokens = IMAGE_TOKENS_MAPPING[normalizedSize];

  if (!sizeTokens)
    throw new Error(
      `Invalid image size: ${normalizedSize}. Supported sizes: ${Object.keys(IMAGE_TOKENS_MAPPING).join(', ')}`,
    );

  const tokens = sizeTokens[normalizedQuality];

  if (tokens === undefined)
    throw new Error(
      `Invalid image quality: ${normalizedQuality}. Supported qualities: ${Object.keys(sizeTokens).join(', ')}`,
    );

  return tokens;
}

/**
 * Calculate total tokens for image generation tool
 * @param toolConfig - The image generation tool configuration
 * @returns The total number of tokens required
 */
export function calculateImageGenerationTokens(
  toolConfig: ImageGenerationToolConfig,
): number {
  return getImageGenerationTokens(toolConfig.size, toolConfig.quality);
}

/**
 * Get the token cost for image generation with partial images
 * Calculates tokens for initial image plus any partial images specified
 * @param size - The size of the generated image
 * @param quality - The quality level of the generated image
 * @param partialImages - Number of partial images (0-3)
 * @returns The total number of tokens required
 */
export function calculateImageGenerationTokensWithPartials(
  size: string = '1024x1024',
  quality: string = 'medium',
  partialImages: number = 0,
): number {
  const baseTokens = getImageGenerationTokens(size, quality);
  // Each partial image costs the same as the base image
  const additionalTokens = Math.max(0, Math.min(partialImages, 3)) * baseTokens;
  return baseTokens + additionalTokens;
}
