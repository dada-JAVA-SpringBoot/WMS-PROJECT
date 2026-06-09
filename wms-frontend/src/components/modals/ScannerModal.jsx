import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

export default function ScannerModal({ isOpen, onClose, onScanSuccess }) {
    const scannerRef = useRef(null);
    const [isCameraStarted, setIsCameraStarted] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    useEffect(() => {
        if (!isOpen) return;

        const html5QrCode = new Html5Qrcode("wms-scanner-reader");
        scannerRef.current = html5QrCode;

        const stopCamera = async () => {
            if (scannerRef.current && scannerRef.current.isScanning) {
                try {
                    await scannerRef.current.stop();
                    setIsCameraStarted(false);
                } catch (err) {
                    console.error("Failed to stop camera", err);
                }
            }
        };

        const startCamera = async () => {
            try {
                await html5QrCode.start(
                    { facingMode: { ideal: "environment" } }, 
                    {
                        fps: 10,
                        qrbox: { width: 300, height: 150 }, // Barcode-friendly aspect ratio
                        formatsToSupport: [
                            Html5Qrcode.Html5QrcodeSupportedFormats.QR_CODE,
                            Html5Qrcode.Html5QrcodeSupportedFormats.CODE_128,
                            Html5Qrcode.Html5QrcodeSupportedFormats.EAN_13,
                            Html5Qrcode.Html5QrcodeSupportedFormats.EAN_8,
                            Html5Qrcode.Html5QrcodeSupportedFormats.CODE_39
                        ]
                    },
                    (decodedText) => {
                        onScanSuccess(decodedText);
                        stopCamera();
                    },
                    () => {
                        // Ignore scan errors
                    }
                );
                setIsCameraStarted(true);
                setErrorMsg('');
            } catch (err) {
                console.error("Unable to start camera", err);
                setErrorMsg("Cannot access the camera. Please allow permission or check the device.");
                setIsCameraStarted(false);
            }
        };

        // Delay một chút để đảm bảo DOM đã render
        const timer = setTimeout(startCamera, 300);

        return () => {
            clearTimeout(timer);
            stopCamera();
        };
    }, [isOpen, onScanSuccess]);

    const stopCameraOutside = async () => {
        if (scannerRef.current && scannerRef.current.isScanning) {
            try {
                await scannerRef.current.stop();
                setIsCameraStarted(false);
            } catch (err) {
                console.error("Failed to stop camera", err);
            }
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-black/90 backdrop-blur-md p-4">
            <div className="w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl relative">
                {/* Header */}
                <div className="p-4 border-b flex items-center justify-between bg-gray-50">
                    <h3 className="font-black text-[#1192a8] uppercase text-sm tracking-wider">Scan Product Code</h3>
                    <button 
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 text-gray-600 hover:bg-gray-300 transition"
                    >
                        &times;
                    </button>
                </div>

                {/* Camera View Area */}
                <div className="p-4 relative">
                    {!isCameraStarted && !errorMsg && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50 z-10 p-6 text-center">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#1192a8] mb-4"></div>
                            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Initializing camera...</p>
                        </div>
                    )}

                    {errorMsg && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-50 z-10 p-8 text-center">
                            <span className="text-4xl mb-4">🚫</span>
                            <p className="text-sm text-red-600 font-bold mb-4">{errorMsg}</p>
                            <button 
                                onClick={() => window.location.reload()}
                                className="px-6 py-2 bg-red-600 text-white rounded-xl text-xs font-black uppercase"
                            >
                                Retry
                            </button>
                        </div>
                    )}

                    <div 
                        id="wms-scanner-reader" 
                        className="w-full aspect-square rounded-2xl overflow-hidden bg-black border-2 border-[#1192a8]/20"
                    ></div>
                    
                    {/* Scanner Overlay UI */}
                    {isCameraStarted && (
                        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                            <div className="w-[300px] h-[150px] relative shadow-[0_0_0_999px_rgba(0,0,0,0.5)] border-2 border-teal-400/50">
                                {/* Laser line */}
                                <div className="absolute top-1/2 left-0 w-full h-0.5 bg-red-500 shadow-[0_0_10px_rgba(255,0,0,0.8)] animate-scan-line-horizontal"></div>
                                {/* Plus (+) crosshair */}
                                <div className="absolute top-1/2 left-0 w-full h-0.5 bg-teal-400/50"></div>
                                <div className="absolute top-0 left-1/2 w-0.5 h-full bg-teal-400/50"></div>
                                
                                {/* Corner markers */}
                                <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-teal-400"></div>
                                <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-teal-400"></div>
                                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-teal-400"></div>
                                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-teal-400"></div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer / Instructions */}
                <div className="p-6 bg-gray-50 text-center">
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-tight">
                        {isCameraStarted ? "Aim the camera at a barcode or QR code" : "Please allow camera access"}
                    </p>
                    <button 
                        onClick={onClose}
                        className="mt-4 w-full py-4 bg-gray-800 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg active:scale-95 transition-all"
                    >
                        Close Scanner
                    </button>
                </div>
            </div>
            
            {/* Safe Area for Mobile */}
            <div className="h-20 lg:hidden"></div>
        </div>
    );
}
