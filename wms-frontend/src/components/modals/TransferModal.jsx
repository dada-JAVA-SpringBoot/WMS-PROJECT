import React, { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';
import SystemDialog from './SystemDialog';

export default function TransferModal({ isOpen, onClose, product, stockLine, onSuccess }) {
    const [locations, setLocations] = useState([]);
    const [conversions, setConversions] = useState([]);
    const [selectedUnit, setSelectedUnit] = useState(null); // {unitName, factor}
    const [toLocationId, setToLocationId] = useState('');
    const [quantity, setQuantity] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // State cho SystemDialog
    const [dialogConfig, setDialogConfig] = useState({
        isOpen: false,
        title: '',
        message: '',
        variant: 'info'
    });

    const showDialog = (title, message, variant = 'info') => {
        setDialogConfig({ isOpen: true, title, message, variant });
    };

    const closeDialog = () => {
        setDialogConfig(prev => ({ ...prev, isOpen: false }));
        if (dialogConfig.variant === 'success') {
            onClose();
        }
    };

    useEffect(() => {
        if (isOpen) {
            const fetchData = async () => {
                try {
                    // 1. Tải danh sách quy đổi đơn vị
                    const resConv = await axiosClient.get(`/api/products/${product.id}/conversions`);
                    const convData = resConv.data;
                    
                    const baseUnitObj = { unitName: product.baseUnit, conversionFactor: 1, isBase: true };
                    const allUnits = [baseUnitObj, ...convData];
                    setConversions(allUnits);
                    setSelectedUnit(baseUnitObj);

                    // 2. Lấy toàn bộ vị trí kho
                    const resAll = await axiosClient.get("/api/location-overview");
                    const allLocs = resAll.data;

                    // 3. Lấy danh sách vị trí sản phẩm này đang hiện diện
                    const resInv = await axiosClient.get(`/api/inventory/product/${product.id}`);
                    const invDetails = resInv.data;

                    // 4. Chuẩn hóa các đơn vị khả dụng của sản phẩm
                    const productUnitsNormalized = allUnits.map(u => normalizeUnit(u.unitName));

                    // 5. Xây dựng danh sách vị trí kèm điểm gợi ý (Scoring Logic)
                    const processedLocs = allLocs
                        .filter(loc => loc.id !== stockLine.locationId)
                        .map(loc => {
                            let score = 0;
                            let suggestionLabel = "";
                            const lUnit = normalizeUnit(loc.containerType);
                            
                            const isUnitMatch = productUnitsNormalized.includes(lUnit);
                            const onHand = Number(loc.quantityOnHand || 0);
                            const capacity = Number(loc.capacity || 100);
                            const isFull = onHand >= capacity;
                            const isEmpty = onHand === 0;
                            const hasSameBatch = invDetails.some(d => d.locationId === loc.id && d.batchId === stockLine.batchId);

                            if (isUnitMatch) {
                                if (hasSameBatch && !isFull) {
                                    score = 300; // Tốt nhất: Gom hàng cùng lô
                                    suggestionLabel = "(Gợi ý tốt nhất: Cùng lô hàng)";
                                } else if (isEmpty) {
                                    score = 200; // Tốt: Vị trí trống
                                    suggestionLabel = "(Gợi ý: Vị trí trống & Khớp đơn vị)";
                                } else if (!isFull) {
                                    score = 100; // Trung bình: Cất chung với hàng khác cùng đơn vị
                                    suggestionLabel = "(Phù hợp: Khớp đơn vị)";
                                } else {
                                    score = 50; // Thấp: Khớp đơn vị nhưng đã đầy
                                    suggestionLabel = "(Đầy: Khớp đơn vị)";
                                }
                            } else {
                                score = -100; // Kém: Sai quy cách đóng gói
                                suggestionLabel = "(Không phù hợp: Sai quy cách)";
                            }

                            return { ...loc, score, suggestionLabel, isUnitMatch, isFull };
                        });

                    // 6. Sắp xếp theo thứ tự ưu tiên giảm dần
                    processedLocs.sort((a, b) => b.score - a.score);
                    setLocations(processedLocs);

                    // 7. TỰ ĐỘNG CHỌN VỊ TRÍ TỐT NHẤT (Auto-Slotting)
                    if (processedLocs.length > 0 && processedLocs[0].score >= 100) {
                        setToLocationId(processedLocs[0].id.toString());
                    } else {
                        setToLocationId('');
                    }

                } catch (err) {
                    console.error("Lỗi tải dữ liệu gợi ý:", err);
                }
            };
            
            fetchData();
            const availableBase = Number(stockLine.onHand || 0) - Number(stockLine.allocated || 0);
            setQuantity(availableBase);
            setToLocationId('');
        }
    }, [isOpen, stockLine, product]);

    // Xử lý khi người dùng thay đổi đơn vị
    const handleUnitChange = (unitName) => {
        const unit = conversions.find(u => u.unitName === unitName);
        if (!unit) return;
        setSelectedUnit(unit);
        
        const availableBase = Number(stockLine.onHand || 0) - Number(stockLine.allocated || 0);
        const factor = unit.conversionFactor;
        const newQty = factor >= 1 ? Math.floor(availableBase / factor) : (availableBase / factor);
        setQuantity(newQty);
    };

    // MỚI: Xử lý khi thay đổi vị trí đích -> Tự động chuyển đơn vị phù hợp
    const handleLocationChange = (locId) => {
        setToLocationId(locId);
        const loc = locations.find(l => l.id.toString() === locId.toString());
        if (loc) {
            const lUnitNormalized = normalizeUnit(loc.containerType);
            // Tìm đơn vị của sản phẩm khớp với loại vật chứa của kho
            const matchingUnit = conversions.find(u => normalizeUnit(u.unitName) === lUnitNormalized);
            if (matchingUnit) {
                handleUnitChange(matchingUnit.unitName);
            }
        }
    };

    const normalizeUnit = (unit) => {
        if (!unit) return "";
        let n = unit.toUpperCase().trim();
        if (n.startsWith("UNIT-")) n = n.substring(5);
        return n.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/Đ/g, "D").replace(/đ/g, "d");
    };

    if (!isOpen) return null;

    const handleTransfer = async () => {
        if (!toLocationId) {
            showDialog("Thông báo", "Vui lòng chọn vị trí đích.", "info");
            return;
        }

        const destLoc = locations.find(l => l.id.toString() === toLocationId.toString());
        const selectedUnitNormalized = normalizeUnit(selectedUnit?.unitName);
        const destUnitNormalized = normalizeUnit(destLoc?.containerType);

        // RÀNG BUỘC CỨNG: Đơn vị thao tác phải khớp với loại vật chứa của kho đích
        if (selectedUnitNormalized !== destUnitNormalized) {
            showDialog(
                "Sai quy cách đóng gói", 
                `Bạn đang thực hiện chuyển đơn vị [${selectedUnit?.unitName}], nhưng vị trí đích [${destLoc?.binCode}] yêu cầu vật chứa loại [${destLoc?.containerType}]. Vui lòng chọn lại đơn vị hoặc kho phù hợp.`, 
                "info"
            );
            return;
        }

        const qtyInput = Number(quantity);
        if (isNaN(qtyInput) || qtyInput <= 0) {
            showDialog("Lỗi nhập liệu", "Số lượng không hợp lệ.", "info");
            return;
        }

        // Ràng buộc số nguyên cho các đơn vị nguyên kiện (Thùng, Lốc, Cái...)
        const factor = selectedUnit ? selectedUnit.conversionFactor : 1;
        if (factor >= 1 && !Number.isInteger(qtyInput)) {
            showDialog("Quy cách đóng gói", `Đơn vị [${selectedUnit.unitName}] yêu cầu số lượng nguyên, không thể chuyển số lẻ.`, "info");
            return;
        }

        // Tính toán số lượng theo đơn vị cơ sở
        const totalBaseQty = qtyInput * factor;

        const availableBase = Number(stockLine.onHand || 0) - Number(stockLine.allocated || 0);

        if (totalBaseQty > availableBase) {
            showDialog("Lỗi tồn kho", `Số lượng chuyển (${totalBaseQty} ${product.baseUnit}) vượt quá tồn khả dụng (${availableBase} ${product.baseUnit}).`, "info");
            return;
        }

        setIsSubmitting(true);
        try {
            await axiosClient.post("/api/inventory/transfer", {
                productId: product.id,
                batchId: stockLine.batchId,
                fromLocationId: stockLine.locationId,
                toLocationId: Number(toLocationId),
                quantity: totalBaseQty,
                userId: 1
            });

            onSuccess();
            showDialog("Thành công", "Di chuyển lô hàng thành công!", "success");
        } catch (error) {
            console.error("Lỗi kết nối:", error);
            const errorMsg = error.response?.data?.message || "Không thể kết nối đến máy chủ.";
            showDialog("Lỗi hệ thống", errorMsg, "info");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Tính toán số lượng quy đổi để hiển thị preview
    const factor = selectedUnit ? selectedUnit.conversionFactor : 1;
    const previewBaseQty = (Number(quantity) * factor).toLocaleString();

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex justify-center items-center z-[100] p-2 md:p-4">
            <div className="bg-white w-full max-w-4xl rounded-2xl md:rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[98vh] md:max-h-none">
                <div className="bg-[#1192a8] text-white px-5 md:px-6 py-3 md:py-4 flex justify-between items-center shrink-0">
                    <h2 className="text-sm md:text-lg font-bold uppercase tracking-widest truncate">Di chuyển lô hàng</h2>
                    <button onClick={onClose} className="text-2xl md:text-3xl hover:text-red-200 leading-none">&times;</button>
                </div>
                
                <div className="p-4 md:p-6 space-y-4 md:space-y-6 overflow-y-auto flex-1">
                    {/* Thông tin nguồn - Rộng hơn */}
                    <div className="bg-gray-50 p-3 md:p-4 rounded-xl border border-gray-200 text-xs md:text-sm grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 shadow-sm">
                        <div className="flex justify-between border-b border-gray-100 pb-1 sm:col-span-2">
                            <span className="text-gray-400 font-bold uppercase text-[9px] md:text-[10px]">Mặt hàng:</span>
                            <span className="font-black text-blue-700 truncate ml-2 uppercase">{product.sku} - {product.name}</span>
                        </div>
                        <div className="flex justify-between border-b border-gray-100 pb-1">
                            <span className="text-gray-400 font-bold uppercase text-[9px] md:text-[10px]">Tồn khả dụng:</span>
                            <span className="font-black text-green-600 ml-2 text-sm">
                                {(Number(stockLine.onHand || 0) - Number(stockLine.allocated || 0)).toLocaleString()} {product.baseUnit}
                            </span>
                        </div>
                        <div className="flex justify-between border-b border-gray-100 pb-1 sm:border-b-0 sm:pb-0">
                            <span className="text-gray-400 font-bold uppercase text-[9px] md:text-[10px]">Số lô:</span>
                            <span className="font-mono bg-white px-1.5 border rounded text-[11px] font-bold text-[#1192a8]">{stockLine.batchCode}</span>
                        </div>
                        <div className="flex justify-between sm:col-span-2 sm:pt-2 sm:border-t sm:border-gray-100">
                            <span className="text-gray-400 font-bold uppercase text-[9px] md:text-[10px]">Vị trí hiện tại:</span>
                            <span className="font-black text-orange-600 uppercase text-sm">{stockLine.locCode}</span>
                        </div>
                    </div>

                    {/* Thao tác chuyển - Grid 2 cột */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                        <div className="space-y-4">
                            <div className="grid grid-cols-3 gap-3">
                                <div className="col-span-2">
                                    <label className="block text-[10px] md:text-[11px] font-black text-gray-500 uppercase mb-1">Số lượng chuyển:</label>
                                    <input 
                                        type="number" 
                                        className="w-full border-2 border-gray-100 rounded-xl px-3 py-2.5 text-sm focus:border-blue-500 outline-none font-black text-blue-700"
                                        value={quantity}
                                        onChange={(e) => setQuantity(e.target.value)}
                                        min="1"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] md:text-[11px] font-black text-gray-500 uppercase mb-1">Đơn vị:</label>
                                        <select 
                                            className="wms-select w-full !py-2.5 !px-2 !text-xs"
                                            value={selectedUnit ? selectedUnit.unitName : ''}
                                            onChange={(e) => handleUnitChange(e.target.value)}
                                        >
                                            {conversions.map(u => (
                                                <option key={u.unitName} value={u.unitName}>{u.unitName}</option>
                                            ))}
                                        </select>
                                </div>
                            </div>

                            {selectedUnit && !selectedUnit.isBase && (
                                <div className="bg-blue-50 p-2 md:p-3 rounded-xl border border-blue-100 flex justify-between items-center">
                                    <span className="text-[10px] text-blue-400 font-bold italic">
                                        1 {selectedUnit.unitName} = {selectedUnit.conversionFactor} {product.baseUnit}
                                    </span>
                                    <div className="text-xs md:text-sm text-blue-700 font-black italic">
                                        = {previewBaseQty} {product.baseUnit}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-[10px] md:text-[11px] font-black text-gray-500 uppercase mb-1">Vị trí đích (Gợi ý):</label>
                                <select 
                                    className="wms-select w-full !py-2.5 !px-2 !text-[11px] font-bold"
                                    value={toLocationId}
                                    onChange={(e) => handleLocationChange(e.target.value)}
                                >
                                    <option value="">-- Chọn vị trí --</option>
                                    {locations.map(loc => (
                                        <option key={loc.id} value={loc.id}>
                                            {loc.binCode} | {loc.containerType} | {loc.suggestionLabel.split(':')[0].replace('(', '').replace(')', '')}
                                        </option>
                                    ))}
                                </select>
                                <p className="text-[9px] text-gray-400 mt-2 italic font-medium leading-tight">* Ưu tiên vị trí cùng lô hàng hoặc vị trí trống khớp đơn vị.</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-gray-50 p-4 border-t flex flex-col sm:flex-row justify-end gap-3 shrink-0">
                    <button 
                        onClick={onClose}
                        className="order-2 sm:order-1 px-6 py-2.5 text-gray-400 font-black text-xs uppercase tracking-widest"
                    >
                        Hủy bỏ
                    </button>
                    <button 
                        onClick={handleTransfer}
                        disabled={isSubmitting}
                        className={`order-1 sm:order-2 px-8 py-3 bg-[#1192a8] text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-xl shadow-teal-500/20 active:scale-95 transition-all ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {isSubmitting ? 'Đang xử lý...' : 'Xác nhận chuyển'}
                    </button>
                </div>
            </div>

            <SystemDialog 
                isOpen={dialogConfig.isOpen}
                title={dialogConfig.title}
                message={dialogConfig.message}
                variant={dialogConfig.variant}
                onClose={closeDialog}
                onConfirm={closeDialog}
            />
        </div>
    );
}
