import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import axiosClient from '../api/axiosClient';

export default function MobileScanner() {
    const [searchParams] = useSearchParams();
    const sessionId = searchParams.get('session');
    const pairingCode = searchParams.get('code');

    const [isScanning, setIsScanning] = useState(false);
    const [statusMsg, setStatusMsg] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [history, setHistory] = useState([]);
    const [scannedProduct, setScannedProduct] = useState(null);
    const [isFetchingProduct, setIsFetchingProduct] = useState(false);
    const [showProductCard, setShowProductCard] = useState(false);
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

        // Rung báo hiệu quét thành công
        if (navigator.vibrate) navigator.vibrate(100);

        // Gửi lên server cho máy tính
        try {
            setStatusMsg(`Đã gửi: ${decodedText}`);
            await axiosClient.post('/api/scanner/send', {
                sessionId: sessionId,
                pairingCode: pairingCode,
                scannedData: decodedText
            });
        } catch (err) {
            console.error(err);
            setStatusMsg('Gửi thất bại. Kiểm tra mạng.');
        }

        // Tìm sản phẩm và hiện thông tin ngay trên điện thoại
        setIsFetchingProduct(true);
        setScannedProduct(null);
        setShowProductCard(true);
        try {
            const res = await axiosClient.get(`/api/products/search?keyword=${encodeURIComponent(decodedText.trim())}`);
            if (res.data && res.data.length > 0) {
                setScannedProduct(res.data[0]);
            } else {
                setScannedProduct(null);
            }
        } catch (err) {
            console.error('Không thể tìm sản phẩm:', err);
            setScannedProduct(null);
        } finally {
            setIsFetchingProduct(false);
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
        
        const html5QrCode = new Html5Qrcode("mobile-camera-reader");
        scannerRef.current = html5QrCode;

        const config = {
            fps: 15,
            qrbox: { width: 250, height: 250 },
            formatsToSupport: [
                Html5QrcodeSupportedFormats.QR_CODE,
                Html5QrcodeSupportedFormats.CODE_128,
                Html5QrcodeSupportedFormats.EAN_13,
                Html5QrcodeSupportedFormats.EAN_8,
                Html5QrcodeSupportedFormats.CODE_39,
                Html5QrcodeSupportedFormats.UPC_A,
                Html5QrcodeSupportedFormats.UPC_E,
                Html5QrcodeSupportedFormats.ITF,
                Html5QrcodeSupportedFormats.DATA_MATRIX
            ]
        };

        try {
            await html5QrCode.start(
                { facingMode: { ideal: "environment" } }, 
                config,
                (decodedText) => handleScanSuccess(decodedText),
                () => {}
            );
            setIsScanning(true);
        } catch (err) {
            // Thử lại với facingMode đơn giản hơn
            try {
                await html5QrCode.start(
                    { facingMode: "environment" },
                    { fps: 15, qrbox: { width: 250, height: 250 } },
                    (decodedText) => handleScanSuccess(decodedText),
                    () => {}
                );
                setIsScanning(true);
            } catch (err2) {
                console.warn("Unable to start camera", err2);
                setIsScanning(false);
            }
        }
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        // Reset input để có thể chọn lại cùng 1 file
        e.target.value = '';

        setStatusMsg('Đang phân tích ảnh...');
        
        try {
            // Dùng Html5Qrcode.scanFile hỗ trợ cả barcode + QR code
            const tempScanner = new Html5Qrcode("mobile-file-scanner-tmp");
            const result = await tempScanner.scanFileV2(file, false);
            await tempScanner.clear();
            if (result && result.decodedText) {
                await handleScanSuccess(result.decodedText);
            } else {
                setStatusMsg('Không tìm thấy mã nào trong ảnh này.');
            }
        } catch (err) {
            console.warn('scanFileV2 failed, trying scanFile...', err);
            // Fallback sang scanFile API cũ
            try {
                const tempScanner2 = new Html5Qrcode("mobile-file-scanner-tmp2");
                const decodedText = await tempScanner2.scanFile(file, false);
                await tempScanner2.clear();
                if (decodedText) {
                    await handleScanSuccess(decodedText);
                } else {
                    setStatusMsg('Không tìm thấy mã nào trong ảnh này.');
                }
            } catch (err2) {
                console.error('Cả 2 phương pháp đều thất bại:', err2);
                setStatusMsg('❌ Không nhận diện được mã. Thử ảnh khác hoặc chụp gần hơn.');
            }
        }
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
                    capture="environment"
                    onChange={handleFileChange} 
                />
            </header>
            {/* Hidden divs required by Html5Qrcode.scanFile API */}
            <div id="mobile-file-scanner-tmp" style={{display:'none'}}></div>
            <div id="mobile-file-scanner-tmp2" style={{display:'none'}}></div>

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

            {/* ── Product Info Bottom Sheet ─────────────────────────────── */}
            {showProductCard && (
                <div
                    className="fixed inset-0 z-[100] flex flex-col justify-end"
                    onClick={() => setShowProductCard(false)}
                >
                    {/* Backdrop */}
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

                    {/* Sheet */}
                    <div
                        className="relative w-full bg-gray-900 rounded-t-3xl border-t border-white/10 animate-slide-up overflow-hidden"
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Drag handle */}
                        <div className="flex justify-center pt-3 pb-1">
                            <div className="w-10 h-1 bg-white/20 rounded-full" />
                        </div>

                        {/* Header */}
                        <div className="flex items-center justify-between px-5 py-3 border-b border-white/10">
                            <span className="text-[10px] font-black text-teal-400 uppercase tracking-widest">Thông tin sản phẩm</span>
                            <button
                                onClick={() => setShowProductCard(false)}
                                className="w-7 h-7 flex items-center justify-center rounded-full bg-white/10 text-white/60 hover:bg-white/20 transition text-base font-bold"
                            >
                                ×
                            </button>
                        </div>

                        {/* Loading */}
                        {isFetchingProduct && (
                            <div className="flex flex-col items-center justify-center py-12 gap-3">
                                <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
                                <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Đang tìm sản phẩm...</p>
                            </div>
                        )}

                        {/* Not found */}
                        {!isFetchingProduct && !scannedProduct && (
                            <div className="flex flex-col items-center justify-center py-12 gap-3 px-6 text-center">
                                <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center text-3xl">🔍</div>
                                <p className="text-white font-black text-base">Không tìm thấy</p>
                                <p className="text-gray-500 text-xs">
                                    Mã vừa quét chưa có trong hệ thống hoặc chưa được gán sản phẩm.
                                </p>
                                <button
                                    onClick={() => setShowProductCard(false)}
                                    className="mt-2 px-8 py-3 bg-white/10 rounded-2xl text-white font-black text-xs uppercase tracking-widest active:scale-95 transition-all"
                                >
                                    Đóng
                                </button>
                            </div>
                        )}

                        {/* Product Info */}
                        {!isFetchingProduct && scannedProduct && (() => {
                            const p = scannedProduct;
                            const stock = p.totalQuantity ?? p.stock ?? p.quantity ?? 0;
                            const price = p.costPrice ?? p.sellingPrice ?? p.price ?? null;
                            const sku   = p.sku || p.productCode || '—';
                            const bc    = p.barcode || '—';
                            const imgSrc = p.imageUrl
                                ? (p.imageUrl.startsWith('http') ? p.imageUrl : `/uploads/${p.imageUrl}`)
                                : null;
                            const statusColor = stock > 0 ? 'text-green-400' : 'text-red-400';
                            const statusLabel = stock > 0 ? 'Còn hàng' : 'Hết hàng';

                            return (
                                <div className="px-5 pt-4 pb-8">
                                    {/* Product header */}
                                    <div className="flex gap-4 items-start mb-5">
                                        {/* Image */}
                                        <div className="w-20 h-20 rounded-2xl overflow-hidden bg-gray-800 border border-white/10 shrink-0 flex items-center justify-center">
                                            {imgSrc ? (
                                                <img src={imgSrc} alt={p.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                                </svg>
                                            )}
                                        </div>
                                        {/* Name & status */}
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-xs font-black uppercase tracking-widest mb-1 ${statusColor}`}>{statusLabel}</p>
                                            <h2 className="text-white font-black text-lg leading-tight line-clamp-2">{p.name || p.productName}</h2>
                                            {p.category && (
                                                <span className="inline-block mt-1 text-[10px] bg-teal-500/20 text-teal-400 px-2 py-0.5 rounded-full font-bold">
                                                    {p.category}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Info grid */}
                                    <div className="grid grid-cols-2 gap-3 mb-5">
                                        <div className="bg-gray-800/60 rounded-2xl p-3 border border-white/5">
                                            <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">SKU</p>
                                            <p className="text-white font-bold text-sm truncate">{sku}</p>
                                        </div>
                                        <div className="bg-gray-800/60 rounded-2xl p-3 border border-white/5">
                                            <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">Barcode</p>
                                            <p className="text-white font-bold text-sm truncate">{bc}</p>
                                        </div>
                                        <div className="bg-gray-800/60 rounded-2xl p-3 border border-white/5">
                                            <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">Tồn kho</p>
                                            <p className={`font-black text-xl ${stock > 0 ? 'text-teal-400' : 'text-red-400'}`}>{stock.toLocaleString()}</p>
                                        </div>
                                        {price !== null && (
                                            <div className="bg-gray-800/60 rounded-2xl p-3 border border-white/5">
                                                <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">Đơn giá</p>
                                                <p className="text-yellow-400 font-black text-base">
                                                    {Number(price).toLocaleString('vi-VN')} ₫
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Unit & weight extra info */}
                                    {(p.unit || p.weight) && (
                                        <div className="flex gap-2 mb-5">
                                            {p.unit && (
                                                <span className="bg-gray-800 text-gray-400 text-xs font-bold px-3 py-1.5 rounded-xl border border-white/5">
                                                    Đơn vị: {p.unit}
                                                </span>
                                            )}
                                            {p.weight && (
                                                <span className="bg-gray-800 text-gray-400 text-xs font-bold px-3 py-1.5 rounded-xl border border-white/5">
                                                    KL: {p.weight} kg
                                                </span>
                                            )}
                                        </div>
                                    )}

                                    <button
                                        onClick={() => setShowProductCard(false)}
                                        className="w-full py-4 bg-teal-500 hover:bg-teal-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg shadow-teal-500/20 active:scale-95 transition-all"
                                    >
                                        Đóng
                                    </button>
                                </div>
                            );
                        })()}
                    </div>
                </div>
            )}

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
                @keyframes slide-up {
                    from { transform: translateY(100%); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                .animate-slide-up {
                    animation: slide-up 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
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
