export class NotFoundException extends Error {
  constructor(message) {
    super(message);
    this.name = "NotFoundException";
    this.status = 404;
  }
}

export class ValidationFailed extends Error {
  constructor(message, errors) {
    super(message);
    this.name = "ValidationFailed";
    this.errors = errors;
  }
}