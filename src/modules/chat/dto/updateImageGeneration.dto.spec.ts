import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { UpdateImageGenerationReqDto } from './updateImageGeneration.dto';

describe('UpdateImageGenerationReqDto', () => {
  describe('valid payload', () => {
    it('should create a valid instance when isImageGeneration is true', async () => {
      const payload = {
        isImageGeneration: true,
      };

      const instance = plainToInstance(UpdateImageGenerationReqDto, payload);
      const errors = await validate(instance);

      expect(errors).toHaveLength(0);
      expect(instance.isImageGeneration).toBe(true);
    });

    it('should create a valid instance when isImageGeneration is false', async () => {
      const payload = {
        isImageGeneration: false,
      };

      const instance = plainToInstance(UpdateImageGenerationReqDto, payload);
      const errors = await validate(instance);

      expect(errors).toHaveLength(0);
      expect(instance.isImageGeneration).toBe(false);
    });
  });

  describe('isImageGeneration field', () => {
    it('should fail validation when isImageGeneration is not provided', async () => {
      const payload = {};

      const instance = plainToInstance(UpdateImageGenerationReqDto, payload);
      const errors = await validate(instance);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('isImageGeneration');
      expect(errors[0].constraints).toHaveProperty('isBoolean');
    });

    it('should fail validation when isImageGeneration is null', async () => {
      const payload = {
        isImageGeneration: null,
      };

      const instance = plainToInstance(UpdateImageGenerationReqDto, payload);
      const errors = await validate(instance);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('isImageGeneration');
      expect(errors[0].constraints).toHaveProperty('isBoolean');
    });

    it('should fail validation when isImageGeneration is undefined', async () => {
      const payload = {
        isImageGeneration: undefined,
      };

      const instance = plainToInstance(UpdateImageGenerationReqDto, payload);
      const errors = await validate(instance);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('isImageGeneration');
      expect(errors[0].constraints).toHaveProperty('isBoolean');
    });

    it('should fail validation when isImageGeneration is a string', async () => {
      const payload = {
        isImageGeneration: 'true',
      };

      const instance = plainToInstance(UpdateImageGenerationReqDto, payload);
      const errors = await validate(instance);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('isImageGeneration');
      expect(errors[0].constraints).toHaveProperty('isBoolean');
    });

    it('should fail validation when isImageGeneration is a string "false"', async () => {
      const payload = {
        isImageGeneration: 'false',
      };

      const instance = plainToInstance(UpdateImageGenerationReqDto, payload);
      const errors = await validate(instance);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('isImageGeneration');
      expect(errors[0].constraints).toHaveProperty('isBoolean');
    });

    it('should fail validation when isImageGeneration is a number 1', async () => {
      const payload = {
        isImageGeneration: 1,
      };

      const instance = plainToInstance(UpdateImageGenerationReqDto, payload);
      const errors = await validate(instance);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('isImageGeneration');
      expect(errors[0].constraints).toHaveProperty('isBoolean');
    });

    it('should fail validation when isImageGeneration is a number 0', async () => {
      const payload = {
        isImageGeneration: 0,
      };

      const instance = plainToInstance(UpdateImageGenerationReqDto, payload);
      const errors = await validate(instance);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('isImageGeneration');
      expect(errors[0].constraints).toHaveProperty('isBoolean');
    });

    it('should fail validation when isImageGeneration is an empty string', async () => {
      const payload = {
        isImageGeneration: '',
      };

      const instance = plainToInstance(UpdateImageGenerationReqDto, payload);
      const errors = await validate(instance);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('isImageGeneration');
      expect(errors[0].constraints).toHaveProperty('isBoolean');
    });

    it('should fail validation when isImageGeneration is an object', async () => {
      const payload = {
        isImageGeneration: { value: true },
      };

      const instance = plainToInstance(UpdateImageGenerationReqDto, payload);
      const errors = await validate(instance);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('isImageGeneration');
      expect(errors[0].constraints).toHaveProperty('isBoolean');
    });

    it('should fail validation when isImageGeneration is an array', async () => {
      const payload = {
        isImageGeneration: [true],
      };

      const instance = plainToInstance(UpdateImageGenerationReqDto, payload);
      const errors = await validate(instance);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('isImageGeneration');
      expect(errors[0].constraints).toHaveProperty('isBoolean');
    });

    it('should fail validation when isImageGeneration is NaN', async () => {
      const payload = {
        isImageGeneration: NaN,
      };

      const instance = plainToInstance(UpdateImageGenerationReqDto, payload);
      const errors = await validate(instance);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('isImageGeneration');
      expect(errors[0].constraints).toHaveProperty('isBoolean');
    });
  });

  describe('extra properties', () => {
    it('should ignore extra properties when isImageGeneration is true', async () => {
      const payload = {
        isImageGeneration: true,
        extraField: 'should be ignored',
        anotherField: 123,
      };

      const instance = plainToInstance(UpdateImageGenerationReqDto, payload);
      const errors = await validate(instance);

      expect(errors).toHaveLength(0);
      expect(instance.isImageGeneration).toBe(true);
    });

    it('should ignore extra properties when isImageGeneration is false', async () => {
      const payload = {
        isImageGeneration: false,
        extraField: 'should be ignored',
        nestedObject: { key: 'value' },
      };

      const instance = plainToInstance(UpdateImageGenerationReqDto, payload);
      const errors = await validate(instance);

      expect(errors).toHaveLength(0);
      expect(instance.isImageGeneration).toBe(false);
    });
  });
});
