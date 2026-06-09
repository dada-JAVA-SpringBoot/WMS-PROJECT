import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Html5Qrcode } from 'html5-qrcode';
import axiosClient from '../api/axiosClient';
import jsQR from 'jsqr';

export default function MobileScanner() {
    const [searchParams] = useSearchParams();
    const sessionId = searchParams.get('session');
    const pairingCode = searchParams.get('code');

    const [isScanning, setIsScanning] = useState(false);
    const [statusMsg, setStatusMsg] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [history, setHistory] = useState([]);
    const scannerRef = useRef(null);
    const fileInputRef = useRef(null);

    // Load lịch sử từ localStorage
    useEffect(() => {
        const savedHistory = localStorage.getItem('wms_scan_history');
        if (savedHistory) {
            setHistory(JSON.parse(savedHistory));
        }
    }, []);

    // Lưu lịch sử mỗi khi thay đổi
    useEffect(() => {
        localStorage.setItem('wms_scan_history', JSON.stringify(history));
    }, [history]);

    useEffect(() => {
        if (!sessionId || !pairingCode) {
            setErrorMsg("URL không hợp lệ. Vui lòng quét lại mã QR trên màn hình máy tính.");
            return;
        }

        // Thử tự động bật camera (sẽ thất bại nếu không có HTTPS)
        startCamera();

        // Gửi tín hiệu đã kết nối thành công tới server
        const notifyConnection = async () => {
            try {
                await axiosClient.post('/api/scanner/send', {
                    sessionId: sessionId,
                    pairingCode: pairingCode,
                    scannedData: '__CONNECTED__'
                });
            } catch (err) {
                console.error("Failed to notify connection", err);
            }
        };
        
        const timer = setTimeout(notifyConnection, 1000);

        return () => {
            clearTimeout(timer);
            stopCamera();
        };
    }, [sessionId, pairingCode]);

    const handleScanSuccess = async (decodedText) => {
        // Cập nhật lịch sử (đưa lên đầu)
        const newEntry = {
            data: decodedText,
            time: new Date().toLocaleTimeString(),
            id: Date.now()
        };
        setHistory(prev => [newEntry, ...prev.slice(0, 19)]); // Giữ tối đa 20 mục

        try {
            setStatusMsg(`Đã gửi: ${decodedText}`);
            
            await axiosClient.post('/api/scanner/send', {
                sessionId: sessionId,
                pairingCode: pairingCode,
                scannedData: decodedText
            });
            
            if (navigator.vibrate) navigator.vibrate(100);

        } catch (err) {
            console.error(err);
            setStatusMsg('Gửi thất bại. Kiểm tra mạng.');
        }
    };

    const stopCamera = async () => {
        if (scannerRef.current && scannerRef.current.isScanning) {
            try {
                await scannerRef.current.stop();
                setIsScanning(false);
            } catch (err) {
                console.error("Failed to stop camera", err);
            }
        }
    };

    const startCamera = async () => {
        setErrorMsg('');
        setStatusMsg('');
        
        try {
            const html5QrCode = new Html5Qrcode("mobile-camera-reader");
            scannerRef.current = html5QrCode;

            await html5QrCode.start(
                { facingMode: "environment" }, 
                {
                    fps: 15,
                    qrbox: { width: 250, height: 250 },
                },
                (decodedText) => handleScanSuccess(decodedText),
                () => {}
            );
            setIsScanning(true);
        } catch (err) {
            console.warn("Unable to start camera - likely due to insecure context (no HTTPS)");
            // Không set errorMsg ở đây để người dùng vẫn thấy giao diện upload ảnh
            setIsScanning(false);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setStatusMsg('Đang phân tích ảnh...');
        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                canvas.width = img.width;
                canvas.height = img.height;
                context.drawImage(img, 0, 0, img.width, img.height);
                
                const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
                const code = jsQR(imageData.data, imageData.width, imageData.height);
                
                if (code) {
                    handleScanSuccess(code.data);
                } else {
                    setStatusMsg('Không tìm thấy mã QR trong ảnh này.');
                }
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    };

    const clearHistory = () => {
        if (window.confirm("Xóa toàn bộ lịch sử quét?")) {
            setHistory([]);
        }
    };

    if (errorMsg && !isScanning) {
        // (Giữ nguyên phần render error nếu URL sai)
    }

    return (
        <div className="min-h-screen bg-black text-white font-sans flex flex-col overflow-hidden">
            <header className="p-6 bg-gray-900/50 backdrop-blur-md border-b border-white/5 flex items-center justify-between sticky top-0 z-50">
                <div>
                    <h1 className="font-black text-2xl tracking-tighter bg-gradient-to-r from-teal-400 to-blue-500 bg-clip-text text-transparent">WMS GO</h1>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Connected: {pairingCode}</span>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => fileInputRef.current.click()}
                        className="p-2 bg-teal-500/20 text-teal-400 rounded-xl hover:bg-teal-500/30 transition border border-teal-500/30"
                        title="Tải ảnh lên"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </button>
                    <button 
                        onClick={clearHistory}
                        className="p-2 bg-white/5 rounded-xl hover:bg-white/10 transition"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>
                </div>
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*" 
                    onChange={handleFileChange} 
                />
            </header>

            <main className="flex-1 flex flex-col overflow-hidden">
                <div className="flex-1 flex flex-col relative bg-black">
                    {/* Viewfinder Camera Section */}
                    <div className="flex-[1.5] relative overflow-hidden bg-gray-900 flex flex-col items-center justify-center">
                        {isScanning ? (
                            <>
                                <div id="mobile-camera-reader" className="w-full h-full object-cover"></div>
                                <div className="absolute inset-0 bg-black/40 pointer-events-none flex flex-col">
                                    <div className="flex-1"></div>
                                    <div className="flex flex-row h-64">
                                        <div className="flex-1 bg-black/40"></div>
                                        <div className="w-64 relative">
                                            <div className="absolute inset-0 border-2 border-teal-500 rounded-3xl shadow-[0_0_20px_rgba(20,184,166,0.3)]">
                                                <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-teal-400 rounded-tl-2xl -m-1"></div>
                                                <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-teal-400 rounded-tr-2xl -m-1"></div>
                                                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-teal-400 rounded-bl-2xl -m-1"></div>
                                                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-teal-400 rounded-br-2xl -m-1"></div>
                                            </div>
                                        </div>
                                        <div className="flex-1 bg-black/40"></div>
                                    </div>
                                    <div className="flex-1 bg-black/40 p-6 flex items-start justify-center text-center">
                                        <p className="text-white/80 font-bold text-sm bg-black/50 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
                                            {statusMsg || "Đưa mã vào khung hình"}
                                        </p>
                                    </div>
                                </div>
                                <div className="absolute top-1/2 left-0 right-0 h-1 bg-teal-400/50 shadow-[0_0_15px_rgba(45,212,191,0.8)] animate-scanner-line pointer-events-none"></div>
                            </>
                        ) : (
                            <div className="p-8 text-center flex flex-col items-center max-w-xs">
                                <div className="w-24 h-24 bg-teal-500/10 rounded-full flex items-center justify-center mb-6 text-teal-400">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                </div>
                                <h2 className="font-black text-xl mb-2 text-white">Chế độ ảnh</h2>
                                <p className="text-gray-400 text-sm mb-8 leading-relaxed">
                                    Do môi trường mạng chưa bảo mật (HTTP), Camera không thể tự động mở. Vui lòng **Chụp ảnh** hoặc **Chọn ảnh** mã vạch để quét.
                                </p>
                                <button 
                                    onClick={() => fileInputRef.current.click()}
                                    className="w-full bg-teal-500 hover:bg-teal-600 text-white py-4 rounded-2xl font-black transition-all shadow-lg shadow-teal-500/20 active:scale-95 flex items-center justify-center gap-3"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                    </svg>
                                    CHỤP / CHỌN ẢNH
                                </button>
                                {statusMsg && (
                                    <p className="mt-4 text-teal-400 font-bold text-xs animate-pulse italic">{statusMsg}</p>
                                )}
                            </div>
                        )}
                    </div>
                    
                    {/* Lịch sử quét */}
                    <div className="flex-1 flex flex-col overflow-hidden bg-gray-950 border-t border-white/10 p-4">
                        <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-3 px-2">Recent Scans</h3>
                        <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                            {history.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-gray-700 italic text-sm">
                                    <p>Ready to scan...</p>
                                </div>
                            ) : (
                                history.map(item => (
                                    <div key={item.id} className="bg-gray-900/80 p-3 rounded-xl border border-white/5 flex items-center justify-between animate-slide-in">
                                        <div className="flex-1 mr-3">
                                            <p className="font-bold text-teal-400 text-sm truncate">{item.data}</p>
                                            <p className="text-[10px] text-gray-500 mt-0.5 font-medium">{item.time}</p>
                                        </div>
                                        <div className="w-6 h-6 rounded-full bg-green-500/10 flex items-center justify-center shrink-0">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </main>

            <style jsx>{`
                @keyframes scanner-line {
                    0% { transform: translateY(-100px); opacity: 0; }
                    20% { opacity: 1; }
                    80% { opacity: 1; }
                    100% { transform: translateY(100px); opacity: 0; }
                }
                .animate-scanner-line {
                    animation: scanner-line 2s infinite ease-in-out;
                }
                .animate-slide-in {
                    animation: slide-in 0.3s ease-out forwards;
                }
                @keyframes slide-in {
                    from { transform: translateX(20px); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(255,255,255,0.1);
                    border-radius: 10px;
                }
            `}</style>
        </div>
    );
}
