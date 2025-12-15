import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { UpdateMaxTokensReqDto } from './updateMaxTokens.dto';

describe('UpdateMaxTokensReqDto', () => {
  describe('valid payload', () => {
    it('should create a valid instance with minimum allowed value', async () => {
      const payload = {
        maxTokens: 1,
      };

      const instance = plainToInstance(UpdateMaxTokensReqDto, payload);
      const errors = await validate(instance);

      expect(errors).toHaveLength(0);
      expect(instance.maxTokens).toBe(1);
    });

    it('should create a valid instance with maximum allowed value', async () => {
      const payload = {
        maxTokens: 128000,
      };

      const instance = plainToInstance(UpdateMaxTokensReqDto, payload);
      const errors = await validate(instance);

      expect(errors).toHaveLength(0);
      expect(instance.maxTokens).toBe(128000);
    });

    it('should create a valid instance with middle range value', async () => {
      const payload = {
        maxTokens: 50000,
      };

      const instance = plainToInstance(UpdateMaxTokensReqDto, payload);
      const errors = await validate(instance);

      expect(errors).toHaveLength(0);
      expect(instance.maxTokens).toBe(50000);
    });
  });

  describe('maxTokens field', () => {
    it('should fail validation when maxTokens is not provided', async () => {
      const payload = {};

      const instance = plainToInstance(UpdateMaxTokensReqDto, payload);
      const errors = await validate(instance);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('maxTokens');
      expect(errors[0].constraints).toHaveProperty('isInt');
    });

    it('should fail validation when maxTokens is null', async () => {
      const payload = {
        maxTokens: null,
      };

      const instance = plainToInstance(UpdateMaxTokensReqDto, payload);
      const errors = await validate(instance);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('maxTokens');
      expect(errors[0].constraints).toHaveProperty('isInt');
    });

    it('should fail validation when maxTokens is less than 1', async () => {
      const payload = {
        maxTokens: 0,
      };

      const instance = plainToInstance(UpdateMaxTokensReqDto, payload);
      const errors = await validate(instance);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('maxTokens');
      expect(errors[0].constraints).toHaveProperty('min');
    });

    it('should fail validation when maxTokens is negative', async () => {
      const payload = {
        maxTokens: -100,
      };

      const instance = plainToInstance(UpdateMaxTokensReqDto, payload);
      const errors = await validate(instance);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('maxTokens');
      expect(errors[0].constraints).toHaveProperty('min');
    });

    it('should fail validation when maxTokens exceeds maximum limit', async () => {
      const payload = {
        maxTokens: 128001,
      };

      const instance = plainToInstance(UpdateMaxTokensReqDto, payload);
      const errors = await validate(instance);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('maxTokens');
      expect(errors[0].constraints).toHaveProperty('max');
    });

    it('should fail validation when maxTokens is a float', async () => {
      const payload = {
        maxTokens: 1000.5,
      };

      const instance = plainToInstance(UpdateMaxTokensReqDto, payload);
      const errors = await validate(instance);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('maxTokens');
      expect(errors[0].constraints).toHaveProperty('isInt');
    });

    it('should fail validation when maxTokens is a string', async () => {
      const payload = {
        maxTokens: '1000',
      };

      const instance = plainToInstance(UpdateMaxTokensReqDto, payload);
      const errors = await validate(instance);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('maxTokens');
      expect(errors[0].constraints).toHaveProperty('isInt');
    });

    it('should fail validation when maxTokens is not a number type', async () => {
      const payload = {
        maxTokens: 'invalid',
      };

      const instance = plainToInstance(UpdateMaxTokensReqDto, payload);
      const errors = await validate(instance);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('maxTokens');
      expect(errors[0].constraints).toHaveProperty('isInt');
    });

    it('should fail validation when maxTokens is an object', async () => {
      const payload = {
        maxTokens: {},
      };

      const instance = plainToInstance(UpdateMaxTokensReqDto, payload);
      const errors = await validate(instance);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('maxTokens');
      expect(errors[0].constraints).toHaveProperty('isInt');
    });

    it('should fail validation when maxTokens is an array', async () => {
      const payload = {
        maxTokens: [1000],
      };

      const instance = plainToInstance(UpdateMaxTokensReqDto, payload);
      const errors = await validate(instance);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('maxTokens');
      expect(errors[0].constraints).toHaveProperty('isInt');
    });
  });

  describe('boundary values', () => {
    it('should accept maxTokens exactly at minimum boundary (1)', async () => {
      const payload = {
        maxTokens: 1,
      };

      const instance = plainToInstance(UpdateMaxTokensReqDto, payload);
      const errors = await validate(instance);

      expect(errors).toHaveLength(0);
      expect(instance.maxTokens).toBe(1);
    });

    it('should reject maxTokens below minimum boundary (0)', async () => {
      const payload = {
        maxTokens: 0,
      };

      const instance = plainToInstance(UpdateMaxTokensReqDto, payload);
      const errors = await validate(instance);

      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('min');
    });

    it('should accept maxTokens exactly at maximum boundary (128000)', async () => {
      const payload = {
        maxTokens: 128000,
      };

      const instance = plainToInstance(UpdateMaxTokensReqDto, payload);
      const errors = await validate(instance);

      expect(errors).toHaveLength(0);
      expect(instance.maxTokens).toBe(128000);
    });

    it('should reject maxTokens above maximum boundary (128001)', async () => {
      const payload = {
        maxTokens: 128001,
      };

      const instance = plainToInstance(UpdateMaxTokensReqDto, payload);
      const errors = await validate(instance);

      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('max');
    });
  });
});
