let instance: TelegramWebApp | null = null;

interface ExpandedEventTarget extends EventTarget {
  addEventListener(
    type: string,
    callback: EventListenerOrEventListenerObject | null,
    options?: boolean | AddEventListenerOptions | undefined
  ): void;
  dispatchEvent(event: Event): boolean;
  removeEventListener(
    type: string,
    callback: EventListenerOrEventListenerObject | null,
    options?: boolean | EventListenerOptions | undefined
  ): void;
}

type MainButtonOptions = {
  is_visible?: boolean;
  is_active?: boolean;
  is_progress_visible?: boolean;
  text?: string;
  color?: string;
  text_color?: string;
};

interface MessageBody {
  eventType: string;
  eventData: string;
}

class TelegramWebApp extends EventTarget implements ExpandedEventTarget {
  private readonly debug: boolean = false;
  private readonly mainButtonOptions: MainButtonOptions;

  constructor(options: TelegramWebAppOptions) {
    super();
    this.mainButtonOptions = options.mainButton;
    this.debug = options.debug ?? this.debug;
    this.init();
  }

  private init() {
    const receiveEvent = (evtName: string) => {
      this.dispatchEvent(new CustomEvent(evtName));
    };

    window.TelegramGameProxy = {
      receiveEvent,
    };

    window.TelegramGameProxy_receiveEvent = receiveEvent;

    this.register_br();
    this.updateMainButton();
    this.registerDefaultReceivers();
    this.postDefaultEvents();
    this.registerDefaultListeners();
  }

  private registerDefaultReceivers() {
    if (window.TelegramGameProxy) {
      const proxy = window.TelegramGameProxy;
      proxy.receiveEvent("main_button_pressed");
      proxy.receiveEvent("back_button_pressed");
    }
  }

  private postDefaultEvents() {
    this.postEvent("web_app_ready");
    this.postEvent("web_app_request_theme");
    this.postEvent("web_app_request_viewport");
  }

  private registerDefaultListeners() {
    const _dispatch = (evtName: string) => {
      return () => {
        this.dispatchEvent(new CustomEvent(evtName));
      };
    };

    this.addEventListener(
      "main_button_pressed",
      _dispatch("MainButtonPressed")
    );

    this.addEventListener(
      "back_button_pressed",
      _dispatch("BackButtonPressed")
    );
  }
  private register_br() {
    const isIframe = window.parent != null && window != window.parent;
    if (isIframe) {
      window.addEventListener(
        "message",
        function (event: MessageEvent<string>) {
          if (event.source !== window.parent) return;
          let dataObj: MessageBody | null = null;
          try {
            dataObj = JSON.parse(event?.data) as MessageBody;
            this.dispatchEvent(
              new CustomEvent(dataObj.eventType, { detail: dataObj.eventData })
            );
            window.parent.postMessage(
              JSON.stringify({ eventType: "iframe_ready" }),
              "*"
            );
          } catch (e) {
            console.error(e);
          }
        }
      );
    }
  }

  private updateMainButton() {
    this.postEvent(
      "web_app_setup_main_button",
      undefined,
      this.mainButtonOptions
    );
  }

  postMainButtonOptions(options: MainButtonOptions) {
    Object.assign(this.mainButtonOptions, options);
    this.updateMainButton();
  }

  onBackButtonPress(cb: () => void) {
    this.addEventListener("BackButtonPressed", cb);
  }

  onMainButtonPress(cb: () => void) {
    this.addEventListener("MainButtonPressed", cb);
  }

  close() {
    this.postEvent("web_app_close");
  }

  postEvent(evtName: string, cb?: (e?: any) => void, data: any = "") {
    try {
      const proxy = window.TelegramWebviewProxy;
      if (proxy) {
        proxy.postEvent(evtName, JSON.stringify(data));
      } else {
        window.parent.postMessage(
          JSON.stringify({ eventType: evtName, eventData: data }),
          "*"
        );
      }
      cb?.();
    } catch (e: any) {
      cb?.(e);
    }
  }
}

type TelegramWebAppOptions = {
  mainButton: MainButtonOptions;
  backButton?: any;
  debug?: boolean;
};

export function createTelegramWebApp(options: TelegramWebAppOptions) {
  return instance ?? new TelegramWebApp(options);
}
