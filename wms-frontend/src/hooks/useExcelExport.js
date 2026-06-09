import { useState, useCallback } from 'react';
import * as XLSX from 'xlsx';

/**
 * Hook xử lý logic xuất Excel đồng bộ cho toàn project
 */
export const useExcelExport = (defaultFileName = 'export.xlsx') => {
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);
    const [exportFileName, setExportFileName] = useState(defaultFileName);
    const [exportSaveMode, setExportSaveMode] = useState('standard');

    const openExportModal = useCallback((suggestedName) => {
        if (suggestedName) setExportFileName(suggestedName);
        setIsExportModalOpen(true);
    }, []);

    const closeExportModal = useCallback(() => {
        setIsExportModalOpen(false);
    }, []);

    const detectBestExportMode = () => {
        return (typeof window.showSaveFilePicker === 'function') ? 'save-picker' : 'standard';
    };

    const normalizeExportFileName = (name) => {
        if (!name) return defaultFileName;
        return name.toLowerCase().endsWith('.xlsx') ? name : `${name}.xlsx`;
    };

    const autoFitColumns = (data) => {
        if (!data || data.length === 0) return [];
        const keys = Object.keys(data[0]);
        return keys.map(key => {
            const maxLen = data.reduce((max, row) => {
                const cellValue = row[key] ? String(row[key]) : "";
                return Math.max(max, cellValue.length);
            }, key.length); // So sánh với cả độ dài của tiêu đề cột
            return { wch: maxLen + 5 }; // Thêm 5 khoảng trắng đệm để đẹp hơn
        });
    };

    const performExport = async (workbook, fileName, originalData = []) => {
        const mode = detectBestExportMode();
        const finalFileName = normalizeExportFileName(fileName || exportFileName);

        try {
            // Nếu có truyền dữ liệu gốc, tự động căn chỉnh độ rộng cột cho tất cả các sheet
            if (originalData.length > 0) {
                workbook.SheetNames.forEach(sheetName => {
                    const ws = workbook.Sheets[sheetName];
                    ws['!cols'] = autoFitColumns(originalData);
                });
            }

            if (mode === 'save-picker') {
                const fileHandle = await window.showSaveFilePicker({
                    suggestedName: finalFileName,
                    types: [{
                        description: 'Excel Workbook',
                        accept: { 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'] }
                    }]
                });

                const writable = await fileHandle.createWritable();
                const workbookBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
                await writable.write(new Blob([workbookBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }));
                await writable.close();
            } else {
                XLSX.writeFile(workbook, finalFileName);
            }
            return true;
        } catch (error) {
            if (error?.name === 'AbortError') return false;
            throw error;
        }
    };

    return {
        isExportModalOpen,
        setIsExportModalOpen,
        exportFileName,
        setExportFileName,
        exportSaveMode,
        setExportSaveMode,
        openExportModal,
        closeExportModal,
        performExport,
        detectBestExportMode
    };
};
