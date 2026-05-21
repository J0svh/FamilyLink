/**
 * Haptic feedback utilities for mobile devices.
 * Falls back silently on devices that don't support vibration.
 */

export const haptics = {
  /** Light tap — button press, toggle */
  light() {
    if (navigator.vibrate) navigator.vibrate(10);
  },

  /** Medium tap — action confirmed (location shared, message sent) */
  medium() {
    if (navigator.vibrate) navigator.vibrate(50);
  },

  /** Strong tap — error, warning */
  strong() {
    if (navigator.vibrate) navigator.vibrate([50, 30, 50]);
  },

  /** Success pattern — double tap */
  success() {
    if (navigator.vibrate) navigator.vibrate([30, 50, 30]);
  },

  /** Notification — incoming message */
  notification() {
    if (navigator.vibrate) navigator.vibrate([20, 40, 20, 40, 20]);
  },
};
