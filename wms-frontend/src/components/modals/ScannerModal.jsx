import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';

// Các định dạng barcode/QR hỗ trợ
const SUPPORTED_FORMATS = [
    Html5QrcodeSupportedFormats.QR_CODE,
    Html5QrcodeSupportedFormats.CODE_128,
    Html5QrcodeSupportedFormats.EAN_13,
    Html5QrcodeSupportedFormats.EAN_8,
    Html5QrcodeSupportedFormats.CODE_39,
    Html5QrcodeSupportedFormats.UPC_A,
    Html5QrcodeSupportedFormats.UPC_E,
    Html5QrcodeSupportedFormats.ITF,
    Html5QrcodeSupportedFormats.DATA_MATRIX,
];

// Detect có phải mobile/tablet không
const isMobileDevice = () =>
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

export default function ScannerModal({ isOpen, onClose, onScanSuccess }) {
    const scannerRef        = useRef(null);
    const fileInputRef      = useRef(null);
    const [status, setStatus]   = useState('idle'); // idle | requesting | starting | scanning | error | denied | file-mode
    const [errorMsg, setErrorMsg] = useState('');
    const [cameras, setCameras]   = useState([]);
    const [selectedCam, setSelectedCam] = useState(null);

    // ── Cleanup helper ──────────────────────────────────────────────────────
    const stopScanner = useCallback(async () => {
        if (scannerRef.current) {
            try {
                if (scannerRef.current.isScanning) {
                    await scannerRef.current.stop();
                }
            } catch (_) { /* bỏ qua */ }
            try { scannerRef.current.clear(); } catch (_) { /* bỏ qua */ }
            scannerRef.current = null;
        }
    }, []);

    // ── Khởi động camera với cameraId cụ thể ───────────────────────────────
    const startWithId = useCallback(async (cameraId) => {
        await stopScanner();
        setStatus('starting');
        setErrorMsg('');

        const qr = new Html5Qrcode('wms-scanner-reader');
        scannerRef.current = qr;

        try {
            await qr.start(
                cameraId,
                {
                    fps: 10,
                    qrbox: { width: 280, height: 140 },
                    formatsToSupport: SUPPORTED_FORMATS,
                },
                (decodedText) => {
                    onScanSuccess(decodedText);
                    stopScanner();
                    onClose();
                },
                () => { /* frame scan error — bỏ qua */ }
            );
            setStatus('scanning');
        } catch (err) {
            console.error('startWithId failed:', err);
            setStatus('error');
            setErrorMsg('Không thể mở camera. Hãy kiểm tra quyền truy cập trong cài đặt trình duyệt.');
        }
    }, [stopScanner, onScanSuccess, onClose]);

    // ── Luồng chính: xin quyền → liệt kê camera → khởi động ──────────────
    const initCamera = useCallback(async () => {
        setStatus('requesting');
        setErrorMsg('');

        // 1. Xin quyền trước (getUserMedia) để browser hiện dialog "Allow"
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            stream.getTracks().forEach(t => t.stop()); // thả ngay sau khi được quyền
        } catch (err) {
            console.warn('getUserMedia denied:', err);
            if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
                setStatus('denied');
            } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
                setStatus('error');
                setErrorMsg('Không tìm thấy camera nào trên thiết bị này.');
            } else {
                setStatus('error');
                setErrorMsg(`Lỗi camera: ${err.message}`);
            }
            return;
        }

        // 2. Lấy danh sách camera
        let deviceList = [];
        try {
            deviceList = await Html5Qrcode.getCameras();
        } catch (err) {
            console.error('getCameras failed:', err);
        }

        if (!deviceList || deviceList.length === 0) {
            setStatus('error');
            setErrorMsg('Không liệt kê được camera. Hãy thử tải lại trang.');
            return;
        }

        setCameras(deviceList);

        // 3. Chọn camera phù hợp:
        //    - Mobile: ưu tiên camera sau (environment)
        //    - PC/laptop: dùng camera đầu tiên (thường là webcam)
        let chosen = deviceList[0];
        if (isMobileDevice() && deviceList.length > 1) {
            const back = deviceList.find(c =>
                /back|rear|environment/i.test(c.label)
            );
            if (back) chosen = back;
        }
        setSelectedCam(chosen.id);
        await startWithId(chosen.id);
    }, [startWithId]);

    // ── Effect: khởi động khi modal mở ─────────────────────────────────────
    useEffect(() => {
        if (!isOpen) {
            stopScanner();
            setStatus('idle');
            setErrorMsg('');
            setCameras([]);
            setSelectedCam(null);
            return;
        }
        const timer = setTimeout(initCamera, 250);
        return () => {
            clearTimeout(timer);
            stopScanner();
        };
    }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

    // ── Đổi camera (khi có nhiều cam) ──────────────────────────────────────
    const handleCameraChange = async (e) => {
        const id = e.target.value;
        setSelectedCam(id);
        await startWithId(id);
    };

    // ── Upload ảnh fallback ─────────────────────────────────────────────────
    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        e.target.value = '';
        setErrorMsg('');

        const qr = new Html5Qrcode('wms-scanner-reader');
        try {
            const result = await qr.scanFileV2(file, /* showImage */ false);
            await qr.clear();
            if (result?.decodedText) {
                onScanSuccess(result.decodedText);
                onClose();
            } else {
                setErrorMsg('Không tìm thấy mã trong ảnh này. Thử ảnh khác.');
            }
        } catch {
            try {
                const decoded = await qr.scanFile(file, false);
                await qr.clear();
                if (decoded) {
                    onScanSuccess(decoded);
                    onClose();
                } else {
                    setErrorMsg('Không nhận ra mã. Hãy chụp rõ hơn và thử lại.');
                }
            } catch (err2) {
                try { await qr.clear(); } catch (_) {}
                setErrorMsg('Không nhận ra mã trong ảnh. Hãy chụp rõ hơn và thử lại.');
                console.error('scanFile both failed:', err2);
            }
        }
    };

    if (!isOpen) return null;

    // ── Render helpers ──────────────────────────────────────────────────────
    const isDenied = status === 'denied';
    const isError  = status === 'error';
    const isLoading = status === 'requesting' || status === 'starting';

    return (
        <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-black/80 backdrop-blur-md p-4">
            <div className="w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl">

                {/* ── Header ── */}
                <div className="p-4 border-b flex items-center justify-between bg-gray-50">
                    <div>
                        <h3 className="font-black text-[#1192a8] uppercase text-sm tracking-wider">
                            Scan Barcode / QR
                        </h3>
                        {cameras.length > 1 && (
                            <select
                                value={selectedCam || ''}
                                onChange={handleCameraChange}
                                className="mt-1 text-xs text-gray-500 border border-gray-200 rounded-lg px-2 py-0.5 bg-white cursor-pointer"
                            >
                                {cameras.map(c => (
                                    <option key={c.id} value={c.id}>{c.label || c.id}</option>
                                ))}
                            </select>
                        )}
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 text-gray-600 hover:bg-gray-300 transition font-bold"
                    >
                        ×
                    </button>
                </div>

                {/* ── Camera View ── */}
                <div className="relative bg-black" style={{ minHeight: 240 }}>

                    {/* Loading overlay */}
                    {isLoading && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 z-10 gap-3">
                            <div className="w-10 h-10 border-4 border-[#1192a8] border-t-transparent rounded-full animate-spin" />
                            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">
                                {status === 'requesting' ? 'Đang xin quyền camera...' : 'Đang khởi động...'}
                            </p>
                        </div>
                    )}

                    {/* Permission denied overlay */}
                    {isDenied && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50 z-10 p-6 text-center gap-3">
                            <span className="text-5xl">🔒</span>
                            <p className="text-sm font-black text-gray-800">Chưa cấp quyền camera</p>
                            <p className="text-xs text-gray-500 leading-relaxed">
                                Trình duyệt đã từ chối quyền camera. Hãy nhấn vào biểu tượng khóa 🔒
                                trên thanh địa chỉ và chọn <strong>Cho phép Camera</strong>, sau đó thử lại.
                            </p>
                            <div className="flex gap-2 mt-1">
                                <button
                                    onClick={initCamera}
                                    className="px-5 py-2 bg-[#1192a8] text-white rounded-xl text-xs font-black uppercase"
                                >
                                    Thử lại
                                </button>
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="px-5 py-2 bg-gray-200 text-gray-700 rounded-xl text-xs font-black uppercase"
                                >
                                    Dùng ảnh
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Error overlay */}
                    {isError && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-50 z-10 p-6 text-center gap-3">
                            <span className="text-4xl">🚫</span>
                            <p className="text-sm text-red-600 font-bold">{errorMsg}</p>
                            <div className="flex gap-2">
                                <button
                                    onClick={initCamera}
                                    className="px-5 py-2 bg-red-600 text-white rounded-xl text-xs font-black uppercase"
                                >
                                    Thử lại
                                </button>
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="px-5 py-2 bg-gray-200 text-gray-700 rounded-xl text-xs font-black uppercase"
                                >
                                    Dùng ảnh
                                </button>
                            </div>
                            {errorMsg && <p className="text-xs text-gray-400">{errorMsg}</p>}
                        </div>
                    )}

                    {/* Camera element (luôn tồn tại trong DOM để Html5Qrcode attach vào) */}
                    <div
                        id="wms-scanner-reader"
                        className="w-full"
                        style={{ minHeight: 240 }}
                    />

                    {/* Scanning overlay UI */}
                    {status === 'scanning' && (
                        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                            <div className="w-[280px] h-[140px] relative">
                                {/* Dim corners */}
                                <div className="absolute inset-0 shadow-[0_0_0_9999px_rgba(0,0,0,0.45)]" />
                                {/* Border */}
                                <div className="absolute inset-0 border-2 border-teal-400/60" />
                                {/* Corner accents */}
                                <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-teal-400" />
                                <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-teal-400" />
                                <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-teal-400" />
                                <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-teal-400" />
                                {/* Laser */}
                                <div className="absolute top-1/2 left-0 w-full h-0.5 bg-red-500 shadow-[0_0_8px_rgba(255,0,0,0.9)] animate-scan-laser" />
                            </div>
                        </div>
                    )}
                </div>

                {/* ── Footer ── */}
                <div className="p-5 bg-gray-50 flex flex-col gap-3">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest text-center">
                        {status === 'scanning'
                            ? '📷 Đưa mã vạch vào khung hình'
                            : isDenied
                            ? '🔒 Cần cấp quyền camera'
                            : isError
                            ? '⚠️ Hoặc tải ảnh chứa mã lên'
                            : 'Đang khởi động camera...'}
                    </p>

                    {/* Upload ảnh — luôn hiển thị như option phụ khi scanning */}
                    {(status === 'scanning' || isDenied || isError) && (
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="w-full py-2.5 border-2 border-dashed border-gray-300 text-gray-500 rounded-2xl text-xs font-black uppercase tracking-widest hover:border-[#1192a8] hover:text-[#1192a8] transition-colors flex items-center justify-center gap-2"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            Tải ảnh barcode lên
                        </button>
                    )}

                    <button
                        onClick={onClose}
                        className="w-full py-3 bg-gray-800 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-700 active:scale-95 transition-all"
                    >
                        Đóng
                    </button>
                </div>
            </div>

            {/* Hidden file input */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
            />

            {/* Safe area bottom for mobile */}
            <div className="h-6 lg:hidden" />

            <style>{`
                @keyframes scan-laser {
                    0%   { transform: translateY(-60px); opacity: 0; }
                    15%  { opacity: 1; }
                    85%  { opacity: 1; }
                    100% { transform: translateY(60px); opacity: 0; }
                }
                .animate-scan-laser {
                    animation: scan-laser 1.8s ease-in-out infinite;
                }
            `}</style>
        </div>
    );
}
