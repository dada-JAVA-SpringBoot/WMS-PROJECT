import React, { useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';

export default function ScannerModal({ isOpen, onClose, onScanSuccess }) {
    useEffect(() => {
        if (!isOpen) return;

        // Cấu hình scanner
        const scanner = new Html5QrcodeScanner("wms-scanner-reader", {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0,
            showTorchButtonIfSupported: true,
            rememberLastUsedCamera: true
        });

        const handleSuccess = (decodedText) => {
            onScanSuccess(decodedText);
            scanner.clear().catch(error => console.error("Failed to clear scanner", error));
        };

        const handleError = (err) => {
            // Lỗi quét (thường là do không thấy mã, ignore để tiếp tục quét)
        };

        scanner.render(handleSuccess, handleError);

        return () => {
            scanner.clear().catch(error => console.error("Failed to clear scanner on cleanup", error));
        };
    }, [isOpen, onScanSuccess]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-black/90 backdrop-blur-md p-4">
            <div className="w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl relative">
                {/* Header */}
                <div className="p-4 border-b flex items-center justify-between bg-gray-50">
                    <h3 className="font-black text-[#1192a8] uppercase text-sm tracking-wider">Quét mã sản phẩm</h3>
                    <button 
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 text-gray-600 hover:bg-gray-300 transition"
                    >
                        &times;
                    </button>
                </div>

                {/* Camera View Area */}
                <div className="p-4">
                    <div 
                        id="wms-scanner-reader" 
                        className="w-full rounded-2xl overflow-hidden border-2 border-dashed border-gray-200"
                    ></div>
                </div>

                {/* Footer / Instructions */}
                <div className="p-6 bg-gray-50 text-center">
                    <p className="text-xs text-gray-500 font-medium">
                        Hướng camera về phía mã vạch hoặc mã QR của sản phẩm để tự động nhận diện
                    </p>
                    <button 
                        onClick={onClose}
                        className="mt-4 w-full py-3 bg-[#1192a8] text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-teal-500/20 active:scale-95 transition-all"
                    >
                        Hủy bỏ
                    </button>
                </div>
            </div>
            
            {/* Safe Area for Mobile */}
            <div className="h-8 lg:hidden"></div>
        </div>
    );
}
