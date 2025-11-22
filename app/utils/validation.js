// Validation helper functions

const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validateUser = (userData) => {
  const errors = [];

  if (!userData.name || typeof userData.name !== 'string' || userData.name.trim().length === 0) {
    errors.push('Name is required and must be a non-empty string');
  }

  if (!userData.email || typeof userData.email !== 'string') {
    errors.push('Email is required');
  } else if (!validateEmail(userData.email)) {
    errors.push('Email must be a valid email address');
  }

  if (!userData.password || typeof userData.password !== 'string' || userData.password.length < 6) {
    errors.push('Password is required and must be at least 6 characters');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

const validateList = (listData) => {
  const errors = [];

  if (!listData.title || typeof listData.title !== 'string' || listData.title.trim().length === 0) {
    errors.push('Title is required and must be a non-empty string');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

const validateItem = (itemData) => {
  const errors = [];

  if (!itemData.name || typeof itemData.name !== 'string' || itemData.name.trim().length === 0) {
    errors.push('Item name is required and must be a non-empty string');
  }

  if (itemData.quantity !== undefined && (typeof itemData.quantity !== 'number' || itemData.quantity < 1)) {
    errors.push('Quantity must be a positive number');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

const validateListUpdate = (updateData) => {
  const errors = [];

  if (updateData.title !== undefined && (typeof updateData.title !== 'string' || updateData.title.trim().length === 0)) {
    errors.push('Title must be a non-empty string');
  }

  if (updateData.member_ids !== undefined && !Array.isArray(updateData.member_ids)) {
    errors.push('member_ids must be an array');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

const validateItemUpdate = (updateData) => {
  const errors = [];

  if (updateData.name !== undefined && (typeof updateData.name !== 'string' || updateData.name.trim().length === 0)) {
    errors.push('Item name must be a non-empty string');
  }

  if (updateData.quantity !== undefined && (typeof updateData.quantity !== 'number' || updateData.quantity < 1)) {
    errors.push('Quantity must be a positive number');
  }

  if (updateData.purchased !== undefined && typeof updateData.purchased !== 'boolean') {
    errors.push('Purchased must be a boolean value');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

module.exports = {
  validateUser,
  validateList,
  validateItem,
  validateListUpdate,
  validateItemUpdate
};
