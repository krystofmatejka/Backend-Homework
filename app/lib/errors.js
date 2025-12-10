export class NotFound extends Error {
  constructor(message) {
    super(message);
    this.name = "NotFound";
  }
}

export class ValidationFailed extends Error {
  constructor(message, errors) {
    super(message);
    this.name = "ValidationFailed";
    this.errors = errors;
  }
}