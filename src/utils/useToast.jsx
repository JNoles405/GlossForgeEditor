import { useState, useCallback, useRef } from 'react';

export function useToast() {
  const [toast, setToast] = useState(null);
  const timerRef = useRef(null);

  const showToast = useCallback((msg, type = 'info', duration = 2800) => {
    clearTimeout(timerRef.current);
    setToast({ msg, type });
    timerRef.current = setTimeout(() => setToast(null), duration);
  }, []);

  const Toast = toast ? (
    <div className={`toast ${toast.type}`}>{toast.msg}</div>
  ) : null;

  return { showToast, Toast };
}
