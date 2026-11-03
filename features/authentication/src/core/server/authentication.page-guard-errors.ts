export class PageForbiddenError extends Error {
  readonly kind = "forbidden" as const;

  constructor(message = "Not allowed") {
    super(message);
    this.name = "PageForbiddenError";
  }
}

export class PageNotFoundError extends Error {
  readonly kind = "not_found" as const;

  constructor(message = "Not found") {
    super(message);
    this.name = "PageNotFoundError";
  }
}
