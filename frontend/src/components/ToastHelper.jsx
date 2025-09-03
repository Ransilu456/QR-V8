import { toast } from "react-hot-toast";

// Track recent toast messages to prevent duplicates
const recentToasts = new Map();
const DEBOUNCE_TIME = 2000; // 2 seconds

const isDuplicate = (type, message) => {
  const key = `${type}:${message}`;
  const now = Date.now();
  const lastTime = recentToasts.get(key);
  
  if (lastTime && now - lastTime < DEBOUNCE_TIME) {
    return true;
  }
  
  recentToasts.set(key, now);
  return false;
};

// Clean up old entries every minute
setInterval(() => {
  const now = Date.now();
  for (const [key, timestamp] of recentToasts.entries()) {
    if (now - timestamp > 60000) { // 1 minute
      recentToasts.delete(key);
    }
  }
}, 60000);

// Success toast
export const showSuccessToast = (message) => {
  if (isDuplicate('success', message)) return null;
  
  return toast.success(message, {
    id: `success-${Date.now()}`,
    duration: 5000,
  });
};

// Error toast
export const showErrorToast = (message) => {
  if (isDuplicate('error', message)) return null;
  
  return toast.error(message, {
    id: `error-${Date.now()}`,
    duration: 7000,
  });
};

// Info toast
export const showInfoToast = (message) => {
  if (isDuplicate('info', message)) return null;
  
  return toast(message, {
    id: `info-${Date.now()}`,
    icon: "🔔",
    duration: 5000,
  });
};

// Warning
export const showWarningToast = (message) => {
  if (isDuplicate('warning', message)) return null;
  
  return toast(message, {
    id: `warning-${Date.now()}`,
    icon: "⚠️",
    duration: 6000,
    style: {
      borderLeft: "4px solid #f59e0b",
    },
  });
};

// Loading toast
export const showLoadingToast = (message) => {
  if (isDuplicate('loading', message)) return null;
  
  const toastId = toast.loading(message, {
    id: `loading-${Date.now()}`,
  });

  return {
    // Update the loading toast
    updateLoading: (newMessage) => {
      toast.loading(newMessage, { id: toastId });
    },
    // Convert to success
    success: (successMessage) => {
      toast.success(successMessage, { id: toastId });
    },
    // Convert to error
    error: (errorMessage) => {
      toast.error(errorMessage, { id: toastId });
    },
    // Dismiss the toast
    dismiss: () => {
      toast.dismiss(toastId);
    },
  };
};

export const dismissAllToasts = () => {
  toast.dismiss();
};

const ToastHelper = {
  success: showSuccessToast,
  error: showErrorToast,
  info: showInfoToast,
  warning: showWarningToast,
  loading: showLoadingToast,
  dismissAll: dismissAllToasts,
};

export default ToastHelper;
