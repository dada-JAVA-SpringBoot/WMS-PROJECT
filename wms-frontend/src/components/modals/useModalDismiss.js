import { useEffect } from 'react';

export function useModalDismiss(isOpen, onDismiss, enabled = true) {
    useEffect(() => {
        if (!isOpen || !enabled) return;

        const handleDismiss = (event) => {
            if (event.type === 'keydown' && event.key !== 'Escape') return;
            if (event.type === 'contextmenu') {
                event.preventDefault();
            }
            onDismiss?.();
        };

        window.addEventListener('keydown', handleDismiss);
        window.addEventListener('contextmenu', handleDismiss);

        return () => {
            window.removeEventListener('keydown', handleDismiss);
            window.removeEventListener('contextmenu', handleDismiss);
        };
    }, [isOpen, onDismiss, enabled]);
}
