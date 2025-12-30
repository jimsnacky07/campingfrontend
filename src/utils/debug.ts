const isDevelopment = __DEV__;

export const debug = {
  log: (message: string, data?: any) => {
    if (isDevelopment) {
      console.log(`[LOG] ${message}`, data || '');
    }
  },

  info: (message: string, data?: any) => {
    if (isDevelopment) {
      console.info(`[INFO] ${message}`, data || '');
    }
  },

  warn: (message: string, data?: any) => {
    if (isDevelopment) {
      console.warn(`[WARN] ${message}`, data || '');
    }
  },

  error: (message: string, error?: any) => {
    if (isDevelopment) {
      console.error(`[ERROR] ${message}`, error || '');
    }
  },

  api: {
    request: (method: string, endpoint: string, data?: any) => {
      if (isDevelopment) {
        console.log(`[API REQUEST] ${method} ${endpoint}`, data || '');
      }
    },

    response: (endpoint: string, status: number, data?: any) => {
      if (isDevelopment) {
        console.log(`[API RESPONSE] ${endpoint} - ${status}`, data || '');
      }
    },

    error: (endpoint: string, error: any) => {
      if (isDevelopment) {
        console.error(`[API ERROR] ${endpoint}`, error);
      }
    },
  },

  screen: {
    mount: (screenName: string) => {
      if (isDevelopment) {
        console.log(`[SCREEN] ${screenName} mounted`);
      }
    },

    unmount: (screenName: string) => {
      if (isDevelopment) {
        console.log(`[SCREEN] ${screenName} unmounted`);
      }
    },

    action: (screenName: string, action: string, data?: any) => {
      if (isDevelopment) {
        console.log(`[SCREEN ACTION] ${screenName} - ${action}`, data || '');
      }
    },
  },
};
