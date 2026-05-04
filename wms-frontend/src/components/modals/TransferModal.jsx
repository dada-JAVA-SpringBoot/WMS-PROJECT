import React, { useState, useEffect } from 'react';
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
                    const resConv = await fetch(`http://localhost:8080/api/products/${product.id}/conversions`);
                    const convData = await resConv.json();
                    
                    const baseUnitObj = { unitName: product.baseUnit, conversionFactor: 1, isBase: true };
                    const allUnits = [baseUnitObj, ...convData];
                    setConversions(allUnits);
                    setSelectedUnit(baseUnitObj);

                    // 2. Lấy toàn bộ vị trí kho
                    const resAll = await fetch("http://localhost:8080/api/location-overview");
                    const allLocs = await resAll.json();

                    // 3. Lấy danh sách vị trí sản phẩm này đang hiện diện
                    const resInv = await fetch(`http://localhost:8080/api/inventory/product/${product.id}`);
                    const invDetails = await resInv.json();

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
            const response = await fetch("http://localhost:8080/api/inventory/transfer", {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    productId: product.id,
                    batchId: stockLine.batchId,
                    fromLocationId: stockLine.locationId,
                    toLocationId: Number(toLocationId),
                    quantity: totalBaseQty,
                    userId: 1
                })
            });

            if (response.ok) {
                onSuccess();
                showDialog("Thành công", "Di chuyển lô hàng thành công!", "success");
            } else {
                try {
                    const errorData = await response.json();
                    showDialog("Lỗi hệ thống", errorData.message || "Đã xảy ra lỗi không xác định.", "info");
                } catch (e) {
                    const errorText = await response.text();
                    showDialog("Lỗi hệ thống", errorText || "Không thể kết nối đến máy chủ.", "info");
                }
            }
        } catch (error) {
            console.error("Lỗi kết nối:", error);
            showDialog("Lỗi kết nối", "Không thể kết nối đến máy chủ.", "info");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Tính toán số lượng quy đổi để hiển thị preview
    const factor = selectedUnit ? selectedUnit.conversionFactor : 1;
    const previewBaseQty = (Number(quantity) * factor).toLocaleString();

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[100] p-4">
            <div className="bg-white w-full max-w-md rounded-xl shadow-2xl overflow-hidden">
                <div className="bg-[#1192a8] text-white px-6 py-4 flex justify-between items-center">
                    <h2 className="text-lg font-bold uppercase">Di chuyển lô hàng</h2>
                    <button onClick={onClose} className="text-2xl hover:text-red-200">&times;</button>
                </div>
                
                <div className="p-6 space-y-4">
                    <div className="bg-gray-50 p-3 rounded border text-sm space-y-1 shadow-sm">
                        <div className="flex justify-between border-b pb-1 mb-1">
                            <span className="text-gray-500">Mặt hàng:</span>
                            <span className="font-bold text-blue-700">{product.sku} - {product.name}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Số lô:</span>
                            <span className="font-mono bg-white px-1 border rounded text-[11px]">{stockLine.batchCode}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Vị trí hiện tại:</span>
                            <span className="font-bold text-orange-600">{stockLine.locCode}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Tồn khả dụng:</span>
                            <span className="font-black text-green-600">
                                {(Number(stockLine.onHand || 0) - Number(stockLine.allocated || 0)).toLocaleString()} {product.baseUnit}
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                        <div className="col-span-2">
                            <label className="block text-[11px] font-black text-gray-500 uppercase mb-1">Số lượng chuyển:</label>
                            <input 
                                type="number" 
                                className="w-full border-2 border-gray-100 rounded-lg px-3 py-2 text-sm focus:border-blue-500 outline-none font-bold"
                                value={quantity}
                                onChange={(e) => setQuantity(e.target.value)}
                                min="1"
                            />
                        </div>
                        <div>
                            <label className="block text-[11px] font-black text-gray-500 uppercase mb-1">Đơn vị:</label>
                                <select 
                                    className="w-full border-2 border-gray-100 rounded-lg px-2 py-2 text-sm focus:border-blue-500 outline-none bg-gray-50 font-bold"
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
                        <div className="flex justify-between items-center px-1">
                            <span className="text-[10px] text-gray-400 font-medium italic">
                                * Tỷ lệ: 1 {selectedUnit.unitName} = {selectedUnit.conversionFactor} {product.baseUnit}
                            </span>
                            <div className="text-[11px] text-blue-600 font-bold italic">
                                = {previewBaseQty} {product.baseUnit} thực tế
                            </div>
                        </div>
                    )}

                    <div>
                        <label className="block text-[11px] font-black text-gray-500 uppercase mb-1">Vị trí đích (Sắp xếp theo gợi ý):</label>
                        <select 
                            className="w-full border-2 border-gray-100 rounded-lg px-3 py-2 text-sm focus:border-blue-500 outline-none bg-white font-medium"
                            value={toLocationId}
                            onChange={(e) => handleLocationChange(e.target.value)}
                        >
                            <option value="">-- Chọn vị trí tốt nhất --</option>
                            {locations.map(loc => (
                                <option key={loc.id} value={loc.id}>
                                    {loc.suggestionLabel} {loc.binCode} [{loc.containerType || 'N/A'}] (Tồn: {loc.quantityOnHand || 0}/{loc.capacity || 0})
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="bg-gray-100 p-4 border-t flex justify-end gap-3">
                    <button 
                        onClick={onClose}
                        className="px-4 py-2 text-gray-500 font-bold text-sm hover:text-gray-700 transition"
                    >
                        HỦY BỎ
                    </button>
                    <button 
                        onClick={handleTransfer}
                        disabled={isSubmitting}
                        className={`px-8 py-2.5 bg-[#1192a8] text-white rounded-lg font-black text-sm shadow-lg hover:bg-teal-700 active:scale-95 transition-all ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {isSubmitting ? 'ĐANG XỬ LÝ...' : 'XÁC NHẬN CHUYỂN'}
                    </button>
                </div>
            </div>

            {/* SystemDialog để hiển thị thông báo lỗi/thành công */}
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
