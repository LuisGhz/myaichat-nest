import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { UpdateWebSearchReqDto } from './updateWebSearch.dto';

describe('UpdateWebSearchReqDto', () => {
  describe('valid payload', () => {
    it('should create a valid instance when isWebSearch is true', async () => {
      const payload = {
        isWebSearch: true,
      };

      const instance = plainToInstance(UpdateWebSearchReqDto, payload);
      const errors = await validate(instance);

      expect(errors).toHaveLength(0);
      expect(instance.isWebSearch).toBe(true);
    });

    it('should create a valid instance when isWebSearch is false', async () => {
      const payload = {
        isWebSearch: false,
      };

      const instance = plainToInstance(UpdateWebSearchReqDto, payload);
      const errors = await validate(instance);

      expect(errors).toHaveLength(0);
      expect(instance.isWebSearch).toBe(false);
    });
  });

  describe('isWebSearch field', () => {
    it('should fail validation when isWebSearch is not provided', async () => {
      const payload = {};

      const instance = plainToInstance(UpdateWebSearchReqDto, payload);
      const errors = await validate(instance);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('isWebSearch');
      expect(errors[0].constraints).toHaveProperty('isBoolean');
    });

    it('should fail validation when isWebSearch is null', async () => {
      const payload = {
        isWebSearch: null,
      };

      const instance = plainToInstance(UpdateWebSearchReqDto, payload);
      const errors = await validate(instance);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('isWebSearch');
      expect(errors[0].constraints).toHaveProperty('isBoolean');
    });

    it('should fail validation when isWebSearch is undefined', async () => {
      const payload = {
        isWebSearch: undefined,
      };

      const instance = plainToInstance(UpdateWebSearchReqDto, payload);
      const errors = await validate(instance);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('isWebSearch');
      expect(errors[0].constraints).toHaveProperty('isBoolean');
    });

    it('should fail validation when isWebSearch is a string', async () => {
      const payload = {
        isWebSearch: 'true',
      };

      const instance = plainToInstance(UpdateWebSearchReqDto, payload);
      const errors = await validate(instance);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('isWebSearch');
      expect(errors[0].constraints).toHaveProperty('isBoolean');
    });

    it('should fail validation when isWebSearch is a string "false"', async () => {
      const payload = {
        isWebSearch: 'false',
      };

      const instance = plainToInstance(UpdateWebSearchReqDto, payload);
      const errors = await validate(instance);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('isWebSearch');
      expect(errors[0].constraints).toHaveProperty('isBoolean');
    });

    it('should fail validation when isWebSearch is a number 1', async () => {
      const payload = {
        isWebSearch: 1,
      };

      const instance = plainToInstance(UpdateWebSearchReqDto, payload);
      const errors = await validate(instance);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('isWebSearch');
      expect(errors[0].constraints).toHaveProperty('isBoolean');
    });

    it('should fail validation when isWebSearch is a number 0', async () => {
      const payload = {
        isWebSearch: 0,
      };

      const instance = plainToInstance(UpdateWebSearchReqDto, payload);
      const errors = await validate(instance);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('isWebSearch');
      expect(errors[0].constraints).toHaveProperty('isBoolean');
    });

    it('should fail validation when isWebSearch is an empty string', async () => {
      const payload = {
        isWebSearch: '',
      };

      const instance = plainToInstance(UpdateWebSearchReqDto, payload);
      const errors = await validate(instance);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('isWebSearch');
      expect(errors[0].constraints).toHaveProperty('isBoolean');
    });

    it('should fail validation when isWebSearch is an object', async () => {
      const payload = {
        isWebSearch: { value: true },
      };

      const instance = plainToInstance(UpdateWebSearchReqDto, payload);
      const errors = await validate(instance);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('isWebSearch');
      expect(errors[0].constraints).toHaveProperty('isBoolean');
    });

    it('should fail validation when isWebSearch is an array', async () => {
      const payload = {
        isWebSearch: [true],
      };

      const instance = plainToInstance(UpdateWebSearchReqDto, payload);
      const errors = await validate(instance);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('isWebSearch');
      expect(errors[0].constraints).toHaveProperty('isBoolean');
    });

    it('should fail validation when isWebSearch is NaN', async () => {
      const payload = {
        isWebSearch: NaN,
      };

      const instance = plainToInstance(UpdateWebSearchReqDto, payload);
      const errors = await validate(instance);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('isWebSearch');
      expect(errors[0].constraints).toHaveProperty('isBoolean');
    });
  });

  describe('extra properties', () => {
    it('should ignore extra properties when isWebSearch is true', async () => {
      const payload = {
        isWebSearch: true,
        extraField: 'should be ignored',
        anotherField: 123,
      };

      const instance = plainToInstance(UpdateWebSearchReqDto, payload);
      const errors = await validate(instance);

      expect(errors).toHaveLength(0);
      expect(instance.isWebSearch).toBe(true);
    });

    it('should ignore extra properties when isWebSearch is false', async () => {
      const payload = {
        isWebSearch: false,
        extraField: 'should be ignored',
        nestedObject: { key: 'value' },
      };

      const instance = plainToInstance(UpdateWebSearchReqDto, payload);
      const errors = await validate(instance);

      expect(errors).toHaveLength(0);
      expect(instance.isWebSearch).toBe(false);
    });
  });
});
