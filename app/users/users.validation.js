import { ValidationFailed } from '../lib/errors.js';

function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export function parseCreateUserParams() {
  const errors = [];
  let name = null;
  let email = null;

  return {
    parseName(rawName) {
      if (!rawName || typeof rawName !== 'string' || rawName.trim().length === 0) {
        errors.push('Name is required and must be a non-empty string');
      } else {
        name = rawName;
      }
      return this;
    },
    parseEmail(rawEmail) {
      if (!rawEmail || typeof rawEmail !== 'string') {
        errors.push('Email is required');
      } else if (!validateEmail(rawEmail)) {
        errors.push('Email must be a valid email address');
      } else {
        email = rawEmail;
      }
      return this;
    },
    run() {
      if (errors.length > 0) {
        throw new ValidationFailed('Create user validation failed', errors);
      }

      return {
        name,
        email,
      }
    }
  }
}