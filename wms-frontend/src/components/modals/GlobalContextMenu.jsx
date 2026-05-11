import React, { useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useContextMenu } from '../../context/ContextMenuContext';
import { useAuth } from '../../context/AuthContext';

export default function GlobalContextMenu() {
    const { menuState, openMenu, closeMenu } = useContextMenu();
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const { isOpen, x, y, title, subtitle, actions } = menuState;

    // Các hành động mặc định "hợp lý" cho toàn trang
    const defaultActions = useMemo(() => [
        { 
            label: 'Quét mã nhanh (F2)', 
            onClick: () => {
                // Chúng ta sẽ dispatch một custom event để mở scanner ở bất kỳ đâu
                window.dispatchEvent(new CustomEvent('wms:open-global-scanner'));
            }
        },
        { divider: true },
        { 
            label: 'Làm mới trang', 
            onClick: () => window.location.reload()
        },
        { 
            label: 'Quay lại', 
            onClick: () => navigate(-1)
        },
        { divider: true },
        { 
            label: 'Toàn màn hình', 
            onClick: () => {
                if (!document.fullscreenElement) {
                    document.documentElement.requestFullscreen();
                } else if (document.exitFullscreen) {
                    document.exitFullscreen();
                }
            }
        },
        { 
            label: 'Sao chép liên kết', 
            onClick: () => {
                navigator.clipboard.writeText(window.location.href);
            }
        },
        { divider: true },
        { 
            label: 'Đăng xuất', 
            onClick: logout, 
            danger: true
        }
    ], [navigate, logout]);

    useEffect(() => {
        const handleGlobalContextMenu = (e) => {
            // Không chặn context menu nếu đang nhấn vào input hoặc textarea (để người dùng vẫn copy/paste được)
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) {
                return;
            }

            e.preventDefault();

            // Kiểm tra xem click vào một vùng đã có menu riêng chưa
            // Chúng ta có thể dùng thuộc tính data-context-menu để xác định các vùng đặc biệt
            // Nhưng ở đây chúng ta sẽ ưu tiên actions truyền vào menuState
            
            // Nếu click vào background chung, show defaultActions
            // Nếu click vào row cụ thể (đã được xử lý bởi component con), menuState sẽ được set bởi component đó
            
            // Tuy nhiên, vì các component con thường gọi e.stopPropagation(), 
            // nên listener này thường chỉ bắt các click vào "khoảng trắng".
            
            openMenu({
                x: e.clientX,
                y: e.clientY,
                title: 'Hệ thống WMS',
                subtitle: user?.fullName || user?.username || 'Menu nhanh',
                actions: defaultActions
            });
        };

        window.addEventListener('contextmenu', handleGlobalContextMenu);
        return () => window.removeEventListener('contextmenu', handleGlobalContextMenu);
    }, [openMenu, defaultActions, user]);

    if (!isOpen) return null;

    // Tính toán vị trí để không bị tràn
    const menuWidth = 240;
    const itemHeight = 40;
    const dividerHeight = 10;
    const headerHeight = 60;
    
    const estimatedHeight = headerHeight + 
        actions.filter(a => !a.divider).length * itemHeight + 
        actions.filter(a => a.divider).length * dividerHeight;

    let adjustedX = x;
    let adjustedY = y;
    if (x + menuWidth > window.innerWidth) adjustedX = x - menuWidth;
    if (y + estimatedHeight > window.innerHeight) adjustedY = y - estimatedHeight;

    return (
        <div
            className="fixed inset-0 z-[999] cursor-default"
            onContextMenu={(e) => { e.preventDefault(); closeMenu(); }}
            onClick={closeMenu}
        >
            <div
                className="absolute w-60 rounded-2xl border border-gray-100 bg-white/95 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] overflow-hidden animate-in fade-in zoom-in-95 duration-150 ease-out"
                style={{ left: adjustedX, top: adjustedY }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="px-5 py-3.5 bg-gray-50/80 border-b border-gray-100">
                    <p className="text-[10px] uppercase text-gray-400 font-black tracking-[0.1em] mb-0.5">{title}</p>
                    <p className="text-xs font-bold text-[#1192a8] truncate drop-shadow-sm">{subtitle}</p>
                </div>

                {/* Actions */}
                <div className="p-1.5 max-h-[70vh] overflow-y-auto no-scrollbar">
                    {actions.map((action, idx) => (
                        action.divider ? (
                            <div key={`div-${idx}`} className="h-px bg-gray-100 my-1.5 mx-2" />
                        ) : (
                            <MenuItem
                                key={action.label || idx}
                                label={action.label}
                                icon={action.icon}
                                onClick={() => {
                                    action.onClick();
                                    closeMenu();
                                }}
                                danger={action.danger}
                            />
                        )
                    ))}
                </div>
            </div>
        </div>
    );
}

function MenuItem({ label, icon, onClick, danger = false }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`
                w-full text-left px-4 py-2 text-[13px] font-semibold rounded-xl transition-all duration-200
                flex items-center justify-between group
                ${danger 
                    ? 'text-red-500 hover:bg-red-50 active:bg-red-100' 
                    : 'text-gray-600 hover:bg-[#1192a8]/10 hover:text-[#1192a8] active:bg-[#1192a8]/20'}
            `}
        >
            <div className="flex items-center gap-3">
                {icon && <span className="text-base grayscale group-hover:grayscale-0 transition-all">{icon}</span>}
                <span>{label}</span>
            </div>
            <span className={`opacity-0 group-hover:opacity-100 transition-opacity text-[10px] ${danger ? 'text-red-300' : 'text-[#1192a8]/40'}`}>
                {danger ? '●' : '→'}
            </span>
        </button>
    );
}
