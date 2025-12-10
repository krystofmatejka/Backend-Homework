export class NotFoundException extends Error {
  constructor(message) {
    super(message);
    this.name = "NotFoundException";
    this.status = 404;
  }
}

export class BadRequestException extends Error {
  constructor(message) {
    super(message);
    this.name = "BadRequestException";
    this.status = 400;
  }
}