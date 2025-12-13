import { ValidationFailed } from '../lib/errors.js';

export function parseListParams() {
  const errors = [];
  let title = undefined;
  let member_ids = undefined;

  return {
    parseTitle(rawTitle) {
      if (!rawTitle || typeof rawTitle !== 'string' || rawTitle.trim().length === 0) {
        errors.push('Title is required and must be a non-empty string');
      } else {
        title = rawTitle;
      }
      return this;
    },
    parseTitleOptional(rawTitle) {
      if (rawTitle !== undefined) {
        if (typeof rawTitle !== 'string' || rawTitle.trim().length === 0) {
          errors.push('Title must be a non-empty string if provided');
        } else {
          title = rawTitle;
        }
      }
      return this;
    },
    parseMemberIdsOptional(rawMemberIds) {
      if (rawMemberIds !== undefined) {
        if (!Array.isArray(rawMemberIds)) {
          errors.push('member_ids must be an array of strings representing ObjectIds');
        } else {
          member_ids = rawMemberIds;
        }
      }
      return this;
    },
    run() {
      if (errors.length > 0) {
        throw new ValidationFailed('List validation failed', errors);
      }
      return {
        title,
        member_ids: member_ids,
      }
    }
  }
}

export function parseItemParams() {
  const errors = [];
  let name = undefined;
  let quantity = undefined;

  return {
    parseName(rawName) {
      if (!rawName || typeof rawName !== 'string' || rawName.trim().length === 0) {
        errors.push('Name is required and must be a non-empty string');
      } else {
        name = rawName;
      }
      return this;
    },
    parseQuantity(rawQuantity) {
      const qty = rawQuantity ?? 1;
      if (typeof qty !== 'number' || qty < 1) {
        errors.push('Quantity must be a number greater than 0');
      } else {
        quantity = qty;
      }
      return this;
    },
    run() {
      if (errors.length > 0) {
        throw new ValidationFailed('Item validation failed', errors);
      }
      return { name, quantity };
    }
  };
}

export function parseItemUpdateParams() {
  const errors = [];
  let name = undefined;
  let quantity = undefined;
  let purchased = undefined;

  return {
    parseName(rawName) {
      if (!rawName || typeof rawName !== 'string' || rawName.trim().length === 0) {
        errors.push('Name is required and must be a non-empty string');
      } else {
        name = rawName;
      }
      return this;
    },
    parseQuantity(rawQuantity) {
      if (typeof rawQuantity !== 'number' || rawQuantity < 1) {
        errors.push('Quantity must be a number greater than 0');
      } else {
        quantity = rawQuantity;
      }
      return this;
    },
    parsePurchased(rawPurchased) {
      if (typeof rawPurchased !== 'boolean') {
        errors.push('Purchased must be a boolean');
      } else {
        purchased = rawPurchased;
      }
      return this;
    },
    run() {
      if (errors.length > 0) {
        throw new ValidationFailed('Item update validation failed', errors);
      }
      return { name, quantity, purchased };
    }
  };
}