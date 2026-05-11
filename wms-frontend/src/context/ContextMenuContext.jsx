import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const ContextMenuContext = createContext();

export const useContextMenu = () => useContext(ContextMenuContext);

export const ContextMenuProvider = ({ children }) => {
    const [menuState, setMenuState] = useState({
        isOpen: false,
        x: 0,
        y: 0,
        title: 'Hệ thống WMS',
        subtitle: '',
        actions: []
    });

    const openMenu = useCallback(({ x, y, title, subtitle, actions }) => {
        setMenuState({
            isOpen: true,
            x,
            y,
            title: title || 'Hệ thống WMS',
            subtitle: subtitle || '',
            actions: actions || []
        });
    }, []);

    const closeMenu = useCallback(() => {
        setMenuState(prev => ({ ...prev, isOpen: false }));
    }, []);

    return (
        <ContextMenuContext.Provider value={{ menuState, openMenu, closeMenu }}>
            {children}
        </ContextMenuContext.Provider>
    );
};
