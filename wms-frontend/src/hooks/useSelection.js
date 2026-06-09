import { useState, useCallback, useRef } from 'react';

/**
 * Hook quản lý việc chọn nhiều dòng trong bảng (hỗ trợ Ctrl và Shift)
 * @param {Array} data - Danh sách dữ liệu đang hiển thị trong bảng
 */
export const useSelection = (data = [], onDoubleTapAction = null) => {
    const [selectedIds, setSelectedIds] = useState([]);
    const [anchorIndex, setAnchorIndex] = useState(null);
    const lastClickRef = useRef({ id: null, time: 0 });

    const handleRowClick = useCallback((item, index, event) => {
        const now = Date.now();
        const isDoubleTap = lastClickRef.current.id === item.id && (now - lastClickRef.current.time < 300);

        if (isDoubleTap && onDoubleTapAction) {
            onDoubleTapAction(item, index);
            lastClickRef.current = { id: null, time: 0 };
            return;
        }
        lastClickRef.current = { id: item.id, time: now };

        const isToggle = event.ctrlKey || event.metaKey;
        const isRange = event.shiftKey && anchorIndex !== null;

        if (isRange) {
            const start = Math.min(anchorIndex, index);
            const end = Math.max(anchorIndex, index);
            const rangeIds = data.slice(start, end + 1).map(i => i.id);
            // Kết hợp với các id đã chọn trước đó (nếu dùng Ctrl + Shift)
            setSelectedIds(prev => {
                const newIds = new Set([...prev, ...rangeIds]);
                return Array.from(newIds);
            });
            return;
        }

        if (isToggle) {
            setSelectedIds(prev => {
                const exists = prev.includes(item.id);
                return exists ? prev.filter(id => id !== item.id) : [...prev, item.id];
            });
            setAnchorIndex(index);
            return;
        }

        // Click bình thường: chọn duy nhất 1 dòng
        setSelectedIds([item.id]);
        setAnchorIndex(index);
    }, [data, anchorIndex]);

    const selectAll = useCallback(() => {
        setSelectedIds(data.map(i => i.id));
    }, [data]);

    const clearSelection = useCallback(() => {
        setSelectedIds([]);
        setAnchorIndex(null);
    }, []);

    const isSelected = useCallback((id) => selectedIds.includes(id), [selectedIds]);

    const selectedItems = data.filter(item => selectedIds.includes(item.id));

    return {
        selectedIds,
        setSelectedIds,
        anchorIndex,
        setAnchorIndex,
        handleRowClick,
        selectAll,
        clearSelection,
        isSelected,
        selectedItems
    };
};
