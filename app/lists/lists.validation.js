import { parse } from "dotenv";

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