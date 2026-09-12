/**
 * Toast helper compatible with react-hot-toast + react-toastify-style APIs.
 * react-hot-toast has no toast.info / toast.warning — those crashed buttons.
 */
import hotToast from 'react-hot-toast';

const toast = Object.assign((message, opts) => hotToast(message, opts), {
  success: hotToast.success.bind(hotToast),
  error: hotToast.error.bind(hotToast),
  loading: hotToast.loading.bind(hotToast),
  dismiss: hotToast.dismiss.bind(hotToast),
  custom: hotToast.custom.bind(hotToast),
  promise: hotToast.promise.bind(hotToast),
  info: (message, opts = {}) =>
    hotToast(message, { icon: 'ℹ️', duration: 4000, ...opts }),
  warning: (message, opts = {}) =>
    hotToast(message, {
      icon: '⚠️',
      duration: 4500,
      style: {
        background: '#422006',
        color: '#fef3c7',
        border: '1px solid #a16207',
        ...(opts.style || {}),
      },
      ...opts,
    }),
});

export default toast;
export { toast };

