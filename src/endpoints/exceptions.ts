import { FException } from "@freemework/common";

export abstract class HttpException extends FException { }

export class HttpBadRequestException extends HttpException { }
