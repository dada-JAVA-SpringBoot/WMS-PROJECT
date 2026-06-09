import { useEffect } from 'react';

/**
 * useWorkspaceRefresh hook
 * @param {Function} refreshCallback - The function to call when the workspace company is changed
 */
export const useWorkspaceRefresh = (refreshCallback) => {
    useEffect(() => {
        if (!refreshCallback || typeof refreshCallback !== 'function') return;

        const handleWorkspaceChange = () => {
            console.log('[useWorkspaceRefresh] Workspace changed, refreshing data...');
            refreshCallback();
        };

        window.addEventListener('wms:workspace-changed', handleWorkspaceChange);
        return () => {
            window.removeEventListener('wms:workspace-changed', handleWorkspaceChange);
        };
    }, [refreshCallback]);
};
