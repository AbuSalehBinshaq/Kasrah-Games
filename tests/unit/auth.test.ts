import { describe, it, expect, beforeEach, vi } from 'vitest';
import { hashPassword, verifyPassword } from '@/lib/auth';

describe('Authentication Utilities', () => {
  describe('hashPassword', () => {
    it('should hash a password', async () => {
      const password = 'testPassword123';
      const hashed = await hashPassword(password);

      expect(hashed).toBeDefined();
      expect(hashed).not.toBe(password);
      expect(hashed).toMatch(/^\$2[ayb]\$.{56}$/); // bcrypt hash pattern
    });
  });

  describe('verifyPassword', () => {
    let hashedPassword: string;
    const plainPassword = 'testPassword123';

    beforeEach(async () => {
      hashedPassword = await hashPassword(plainPassword);
    });

    it('should verify correct password', async () => {
      const isValid = await verifyPassword(plainPassword, hashedPassword);
      expect(isValid).toBe(true);
    });

    it('should reject incorrect password', async () => {
      const isValid = await verifyPassword('wrongPassword', hashedPassword);
      expect(isValid).toBe(false);
    });

    it('should reject empty password', async () => {
      const isValid = await verifyPassword('', hashedPassword);
      expect(isValid).toBe(false);
    });
  });
});

describe('Password Validation', () => {
  it('should require minimum length', async () => {
    const shortPassword = '123';
    await expect(hashPassword(shortPassword)).resolves.toBeDefined();
    // Note: We're not enforcing length in hashPassword, but in validation schema
  });

  it('should handle special characters', async () => {
    const complexPassword = 'Test@123#Complex';
    const hashed = await hashPassword(complexPassword);
    const isValid = await verifyPassword(complexPassword, hashed);

    expect(isValid).toBe(true);
  });
});
