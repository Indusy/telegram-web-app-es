declare interface Window extends Window {
  TelegramWebviewProxy?: {
    postEvent(string, string?): void;
  };

  TelegramGameProxy?: {
    receiveEvent(string): void;
  };

  TelegramGameProxy_receiveEvent?(string): void;
}
