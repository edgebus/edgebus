import { ExternalLabelsHandlerException } from "./external_process_labels_handler_exception";

export class ExternalProcessException extends ExternalLabelsHandlerException { }

export class ExternalProcessExceptionCannotSpawn extends ExternalProcessException { }

export class ExternalProcessExceptionTimeout extends ExternalProcessException { }

export class ExternalProcessExceptionUnexpectedExitCode extends ExternalProcessException { }

export class ExternalProcessExceptionParse extends ExternalProcessException { }

export class ExternalProcessExceptionKilled extends ExternalProcessException { }
