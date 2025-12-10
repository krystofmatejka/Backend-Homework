function validateEmail (email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export function validateUser(userData) {
  const errors = [];

  if (!userData.name || typeof userData.name !== 'string' || userData.name.trim().length === 0) {
    errors.push('Name is required and must be a non-empty string');
  }

  if (!userData.email || typeof userData.email !== 'string') {
    errors.push('Email is required');
  } else if (!validateEmail(userData.email)) {
    errors.push('Email must be a valid email address');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};
