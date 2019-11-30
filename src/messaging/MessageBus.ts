export interface MessageBus {
	publish(data: any): Promise<void>;
}
