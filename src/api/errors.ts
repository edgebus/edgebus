import { InnerError } from "@zxteam/errors";

export abstract class ApiError extends InnerError { }

export class ServiceUnavailableSubscriberApiError extends ApiError { }

export class WrongArgumentSubscriberApiError extends ApiError { }

export class ForbiddenSubcriberApiError extends ApiError { }

export function apiHandledException(error: any): Error {
	throw new ServiceUnavailableSubscriberApiError();
}
