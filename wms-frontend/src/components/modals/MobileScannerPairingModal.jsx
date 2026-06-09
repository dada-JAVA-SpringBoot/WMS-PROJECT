import React, { useState, useEffect, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Client } from '@stomp/stompjs';
import { v4 as uuidv4 } from 'uuid';
import axiosClient from '../../api/axiosClient';
import { useTranslation } from 'react-i18next';

export default function MobileScannerPairingModal({ isOpen, onClose, onScanSuccess }) {
    const { t } = useTranslation();
    
    // Khởi tạo các state mang tính bền vững (không reset khi đóng/mở modal)
    const [sessionId] = useState(() => uuidv4());
    const [pairingCode, setPairingCode] = useState('');
    const [localIps, setLocalIps] = useState([]);
    const [isConnected, setIsConnected] = useState(false);
    const [isMobileDeviceLinked, setIsMobileDeviceLinked] = useState(false);
    const [qrUrl, setQrUrl] = useState('');
    const [pendingAutoClose, setPendingAutoClose] = useState(false);

    // Ref để dùng trong callback STOMP và Interval
    const codeRef = useRef(pairingCode);
    const isLinkedRef = useRef(isMobileDeviceLinked);
    const onScanSuccessRef = useRef(onScanSuccess);

    useEffect(() => {
        codeRef.current = pairingCode;
    }, [pairingCode]);

    useEffect(() => {
        isLinkedRef.current = isMobileDeviceLinked;
    }, [isMobileDeviceLinked]);

    useEffect(() => {
        onScanSuccessRef.current = onScanSuccess;
    }, [onScanSuccess]);

    // 1. Duy trì kết nối STOMP suốt vòng đời Sidebar
    useEffect(() => {
        const wsProtocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
        const wsUrl = import.meta.env.VITE_API_BASE_URL 
            ? import.meta.env.VITE_API_BASE_URL.replace('http', 'ws') + '/ws'
            : `${wsProtocol}://${window.location.host}/ws`;

        const client = new Client({
            brokerURL: wsUrl,
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
        });

        client.onConnect = () => {
            setIsConnected(true);
            client.subscribe(`/topic/scanner/${sessionId}`, (message) => {
                if (message.body) {
                    try {
                        const data = JSON.parse(message.body);
                        
                        // Xử lý sự kiện kết nối thiết bị
                        if (data.scannedData === '__CONNECTED__') {
                            setIsMobileDeviceLinked(true);
                            setPendingAutoClose(true); // Đánh dấu để tự đóng modal LẦN ĐẦU
                            window.dispatchEvent(new Event('wms:mobile-connected'));
                            window.dispatchEvent(new CustomEvent('wms:show-toast', { 
                                detail: { title: 'Thành công', message: 'Thiết bị di động đã kết nối!', type: 'success' } 
                            }));
                            return;
                        }

                        // Xử lý dữ liệu quét (chỉ khi mã pairing khớp)
                        if (data.scannedData && data.pairingCode === codeRef.current) {
                            if (onScanSuccessRef.current) {
                                onScanSuccessRef.current(data.scannedData);
                            }
                        }
                    } catch (e) {
                        console.error("STOMP parse error", e);
                    }
                }
            });
        };

        client.onDisconnect = () => setIsConnected(false);
        client.activate();

        return () => {
            // Chỉ deactivate nếu client tồn tại
            if (client) {
                client.deactivate();
            }
        };
    }, [sessionId]);

    // 2. Cập nhật QR Code và Pairing Code (chỉ khi Modal mở và chưa link)
    useEffect(() => {
        if (!isOpen) return;
        if (isMobileDeviceLinked) return;

        const generateQR = (currentIps = localIps) => {
            if (isLinkedRef.current) return;

            const newCode = Math.floor(1000 + Math.random() * 9000).toString();
            setPairingCode(newCode);

            const host = currentIps.length > 0 ? currentIps[0] : window.location.hostname;
            const port = window.location.port ? `:${window.location.port}` : '';
            const scheme = window.location.protocol;
            const url = `${scheme}//${host}${port}/mobile-scanner?session=${sessionId}&code=${newCode}`;
            setQrUrl(url);
        };

        // Lấy IP nếu chưa có
        if (localIps.length === 0) {
            axiosClient.get('/api/network/local-ips')
                .then(res => {
                    setLocalIps(res.data);
                    generateQR(res.data);
                })
                .catch(() => generateQR([]));
        } else {
            generateQR();
        }

        const interval = setInterval(() => generateQR(), 120000);
        return () => clearInterval(interval);
    }, [isOpen, sessionId, isMobileDeviceLinked, localIps]);

    // 3. Tự động đóng modal CHỈ KHI VỪA MỚI KẾT NỐI XONG
    useEffect(() => {
        if (pendingAutoClose && isOpen) {
            const timer = setTimeout(() => {
                onClose();
                setPendingAutoClose(false); // Reset trạng thái sau khi đã đóng
            }, 1500);
            return () => clearTimeout(timer);
        }
    }, [pendingAutoClose, isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden relative">
                {/* Header */}
                <div className="p-4 border-b flex items-center justify-between bg-gray-50">
                    <h3 className="font-bold text-gray-800 text-lg">{t('sidebar.mobileScannerModal.title')}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="p-6 flex flex-col items-center text-center">
                    <p className="text-sm text-gray-600 mb-4">
                        {t('sidebar.mobileScannerModal.instruction')}
                    </p>

                    {qrUrl ? (
                        <div className={`p-2 bg-white border-4 rounded-xl shadow-md mb-4 transition-colors duration-500 ${isMobileDeviceLinked ? 'border-green-500' : 'border-[#1192a8]'}`}>
                            <QRCodeSVG value={qrUrl} size={200} level={"H"} />
                        </div>
                    ) : (
                        <div className="w-[200px] h-[200px] flex items-center justify-center border-2 border-dashed border-gray-300 rounded-xl mb-4">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-500"></div>
                        </div>
                    )}

                    <div className={`px-6 py-3 rounded-lg w-full mb-4 transition-colors duration-500 ${isMobileDeviceLinked ? 'bg-green-50 text-green-800' : 'bg-blue-50 text-blue-800'}`}>
                        <p className="text-xs font-semibold uppercase tracking-wider mb-1 opacity-80">{t('sidebar.mobileScannerModal.pairingCode')}</p>
                        <p className="text-3xl font-black tracking-widest">{pairingCode || '----'}</p>
                    </div>

                    <div className="w-full bg-gray-50 p-3 rounded-lg text-left text-xs text-gray-500 mb-4 h-24 overflow-y-auto">
                        <div className="flex items-center justify-between mb-2">
                            <span className="font-semibold">{t('sidebar.mobileScannerModal.statusLabel')}:</span>
                            <span className={`px-2 py-1 rounded-full text-white font-medium transition-all duration-500 ${isMobileDeviceLinked ? 'bg-green-500' : 'bg-red-500 animate-pulse'}`}>
                                {isMobileDeviceLinked ? t('sidebar.mobileScannerModal.statusConnectedDevice') : t('sidebar.mobileScannerModal.statusConnecting')}
                            </span>
                        </div>
                        <p className="font-semibold mt-2">{t('sidebar.mobileScannerModal.availableNetworks')}</p>
                        <ul className="list-disc list-inside mt-1">
                            {localIps.map((ip, idx) => (
                                <li key={idx}>{ip}</li>
                            ))}
                        </ul>
                    </div>
                </div>
                
                <div className="p-4 bg-gray-50 border-t flex justify-end">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300 transition">
                        {t('sidebar.mobileScannerModal.cancel')}
                    </button>
                </div>
            </div>
        </div>
    );
}
