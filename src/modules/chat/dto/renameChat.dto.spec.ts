import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { RenameChatReqDto } from './renameChat.dto';

describe('RenameChatReqDto', () => {
  describe('valid payload', () => {
    it('should create a valid instance with a short title', async () => {
      const payload = {
        title: 'New Chat',
      };

      const instance = plainToInstance(RenameChatReqDto, payload);
      const errors = await validate(instance);

      expect(errors).toHaveLength(0);
      expect(instance.title).toBe(payload.title);
    });

    it('should create a valid instance with a long title', async () => {
      const payload = {
        title: 'A'.repeat(255),
      };

      const instance = plainToInstance(RenameChatReqDto, payload);
      const errors = await validate(instance);

      expect(errors).toHaveLength(0);
      expect(instance.title).toBe(payload.title);
      expect(instance.title.length).toBe(255);
    });

    it('should create a valid instance with special characters', async () => {
      const payload = {
        title: 'Chat @#$%^&*() with special chars',
      };

      const instance = plainToInstance(RenameChatReqDto, payload);
      const errors = await validate(instance);

      expect(errors).toHaveLength(0);
      expect(instance.title).toBe(payload.title);
    });

    it('should create a valid instance with unicode characters', async () => {
      const payload = {
        title: '你好世界 مرحبا العالم 🌍',
      };

      const instance = plainToInstance(RenameChatReqDto, payload);
      const errors = await validate(instance);

      expect(errors).toHaveLength(0);
      expect(instance.title).toBe(payload.title);
    });
  });

  describe('title field', () => {
    it('should fail validation when title is not provided', async () => {
      const payload = {};

      const instance = plainToInstance(RenameChatReqDto, payload);
      const errors = await validate(instance);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('title');
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });

    it('should fail validation when title is empty string', async () => {
      const payload = {
        title: '',
      };

      const instance = plainToInstance(RenameChatReqDto, payload);
      const errors = await validate(instance);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('title');
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });

    it('should fail validation when title is null', async () => {
      const payload = {
        title: null,
      };

      const instance = plainToInstance(RenameChatReqDto, payload);
      const errors = await validate(instance);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('title');
      expect(errors[0].constraints).toHaveProperty('isString');
    });

    it('should fail validation when title is not a string', async () => {
      const payload = {
        title: 123,
      };

      const instance = plainToInstance(RenameChatReqDto, payload);
      const errors = await validate(instance);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('title');
      expect(errors[0].constraints).toHaveProperty('isString');
    });

    it('should fail validation when title is an object', async () => {
      const payload = {
        title: { name: 'Chat' },
      };

      const instance = plainToInstance(RenameChatReqDto, payload);
      const errors = await validate(instance);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('title');
      expect(errors[0].constraints).toHaveProperty('isString');
    });

    it('should fail validation when title is an array', async () => {
      const payload = {
        title: ['Chat', 'Name'],
      };

      const instance = plainToInstance(RenameChatReqDto, payload);
      const errors = await validate(instance);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('title');
      expect(errors[0].constraints).toHaveProperty('isString');
    });

    it('should fail validation when title exceeds 255 characters', async () => {
      const payload = {
        title: 'A'.repeat(256),
      };

      const instance = plainToInstance(RenameChatReqDto, payload);
      const errors = await validate(instance);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('title');
      expect(errors[0].constraints).toHaveProperty('maxLength');
    });

    it('should fail validation when title is only whitespace', async () => {
      const payload = {
        title: '   ',
      };

      const instance = plainToInstance(RenameChatReqDto, payload);
      const errors = await validate(instance);

      expect(errors).toHaveLength(0);
      expect(instance.title).toBe('   ');
    });
  });

  describe('boundary values', () => {
    it('should accept title with exactly 1 character', async () => {
      const payload = {
        title: 'A',
      };

      const instance = plainToInstance(RenameChatReqDto, payload);
      const errors = await validate(instance);

      expect(errors).toHaveLength(0);
      expect(instance.title.length).toBe(1);
    });

    it('should accept title with exactly 255 characters', async () => {
      const payload = {
        title: 'B'.repeat(255),
      };

      const instance = plainToInstance(RenameChatReqDto, payload);
      const errors = await validate(instance);

      expect(errors).toHaveLength(0);
      expect(instance.title.length).toBe(255);
    });

    it('should reject title with 256 characters', async () => {
      const payload = {
        title: 'C'.repeat(256),
      };

      const instance = plainToInstance(RenameChatReqDto, payload);
      const errors = await validate(instance);

      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('maxLength');
    });
  });
});
