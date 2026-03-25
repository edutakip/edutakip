// Global toast event bus
export function showToast({ message, type = 'success', icon = '✓' }) {
  window.dispatchEvent(new CustomEvent('edu:toast', { detail: { message, type, icon } }));
}