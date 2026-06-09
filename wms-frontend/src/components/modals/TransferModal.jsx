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
                    // 1. Load unit conversion list
                    const resConv = await axiosClient.get(`/api/products/${product.id}/conversions`);
                    const convData = resConv.data;
                    
                    const baseUnitObj = { unitName: product.baseUnit, conversionFactor: 1, isBase: true };
                    const allUnits = [baseUnitObj, ...convData];
                    setConversions(allUnits);
                    setSelectedUnit(baseUnitObj);

                    // 2. Load all warehouse locations
                    const resAll = await axiosClient.get("/api/location-overview");
                    const allLocs = resAll.data;

                    // 3. Load all locations where this product exists
                    const resInv = await axiosClient.get(`/api/inventory/product/${product.id}`);
                    const invDetails = resInv.data;

                    // 4. Normalize the product units
                    const productUnitsNormalized = allUnits.map(u => normalizeUnit(u.unitName));

                    // 5. Build location suggestions with scoring logic
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
                                    score = 300; // Best: keep the same batch together
                                    suggestionLabel = "(Best match: same batch)";
                                } else if (isEmpty) {
                                    score = 200; // Good: empty location
                                    suggestionLabel = "(Suggested: empty location & matching unit)";
                                } else if (!isFull) {
                                    score = 100; // Medium: same unit, mixed stock
                                    suggestionLabel = "(Match: unit aligned)";
                                } else {
                                    score = 50; // Low: unit matches but the location is full
                                    suggestionLabel = "(Full: unit aligned)";
                                }
                            } else {
                                score = -100; // Poor: packaging mismatch
                                suggestionLabel = "(Not suitable: packaging mismatch)";
                            }

                            return { ...loc, score, suggestionLabel, isUnitMatch, isFull };
                        });

                    // 6. Sort by descending priority
                    processedLocs.sort((a, b) => b.score - a.score);
                    setLocations(processedLocs);

                    // 7. Auto-select the best location
                    if (processedLocs.length > 0 && processedLocs[0].score >= 100) {
                        setToLocationId(processedLocs[0].id.toString());
                    } else {
                        setToLocationId('');
                    }

                } catch (err) {
                    console.error("Failed to load suggestion data:", err);
                }
            };
            
            fetchData();
            const availableBase = Number(stockLine.onHand || 0) - Number(stockLine.allocated || 0);
            setQuantity(availableBase);
            setToLocationId('');
        }
    }, [isOpen, stockLine, product]);

    // Handle unit changes
    const handleUnitChange = (unitName) => {
        const unit = conversions.find(u => u.unitName === unitName);
        if (!unit) return;
        setSelectedUnit(unit);
        
        const availableBase = Number(stockLine.onHand || 0) - Number(stockLine.allocated || 0);
        const factor = unit.conversionFactor;
        const newQty = factor >= 1 ? Math.floor(availableBase / factor) : (availableBase / factor);
        setQuantity(newQty);
    };

    // When destination changes, auto-switch to the matching unit
    const handleLocationChange = (locId) => {
        setToLocationId(locId);
        const loc = locations.find(l => l.id.toString() === locId.toString());
        if (loc) {
            const lUnitNormalized = normalizeUnit(loc.containerType);
            // Find the product unit that matches the destination container type
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
            showDialog("Notice", "Please select a destination location.", "info");
            return;
        }

        const destLoc = locations.find(l => l.id.toString() === toLocationId.toString());
        const selectedUnitNormalized = normalizeUnit(selectedUnit?.unitName);
        const destUnitNormalized = normalizeUnit(destLoc?.containerType);

        // Hard constraint: the working unit must match the destination container type
        if (selectedUnitNormalized !== destUnitNormalized) {
            showDialog(
                "Packaging mismatch", 
                `You are transferring unit [${selectedUnit?.unitName}], but destination [${destLoc?.binCode}] requires container type [${destLoc?.containerType}]. Please choose a matching unit or warehouse location.`, 
                "info"
            );
            return;
        }

        const qtyInput = Number(quantity);
        if (isNaN(qtyInput) || qtyInput <= 0) {
            showDialog("Input error", "Invalid quantity.", "info");
            return;
        }

        // Require whole numbers for pack-based units
        const factor = selectedUnit ? selectedUnit.conversionFactor : 1;
        if (factor >= 1 && !Number.isInteger(qtyInput)) {
            showDialog("Packaging rule", `Unit [${selectedUnit.unitName}] requires a whole quantity; decimal values are not allowed.`, "info");
            return;
        }

        // Calculate the quantity in base units
        const totalBaseQty = qtyInput * factor;

        const availableBase = Number(stockLine.onHand || 0) - Number(stockLine.allocated || 0);

        if (totalBaseQty > availableBase) {
            showDialog("Stock error", `Transfer quantity (${totalBaseQty} ${product.baseUnit}) exceeds available stock (${availableBase} ${product.baseUnit}).`, "info");
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
            showDialog("Success", "Batch transfer completed successfully!", "success");
        } catch (error) {
            console.error("Connection error:", error);
            const errorMsg = error.response?.data?.message || "Cannot connect to the server.";
            showDialog("System error", errorMsg, "info");
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
                    <h2 className="text-sm md:text-lg font-bold uppercase tracking-widest truncate">Transfer Batch</h2>
                    <button onClick={onClose} className="text-2xl md:text-3xl hover:text-red-200 leading-none">&times;</button>
                </div>
                
                <div className="p-4 md:p-6 space-y-4 md:space-y-6 overflow-y-auto flex-1">
                    {/* Source information */}
                    <div className="bg-gray-50 p-3 md:p-4 rounded-xl border border-gray-200 text-xs md:text-sm grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 shadow-sm">
                        <div className="flex justify-between border-b border-gray-100 pb-1 sm:col-span-2">
                            <span className="text-gray-400 font-bold uppercase text-[9px] md:text-[10px]">Item:</span>
                            <span className="font-black text-blue-700 truncate ml-2 uppercase">{product.sku} - {product.name}</span>
                        </div>
                        <div className="flex justify-between border-b border-gray-100 pb-1">
                            <span className="text-gray-400 font-bold uppercase text-[9px] md:text-[10px]">Available stock:</span>
                            <span className="font-black text-green-600 ml-2 text-sm">
                                {(Number(stockLine.onHand || 0) - Number(stockLine.allocated || 0)).toLocaleString()} {product.baseUnit}
                            </span>
                        </div>
                        <div className="flex justify-between border-b border-gray-100 pb-1 sm:border-b-0 sm:pb-0">
                            <span className="text-gray-400 font-bold uppercase text-[9px] md:text-[10px]">Batch no.:</span>
                            <span className="font-mono bg-white px-1.5 border rounded text-[11px] font-bold text-[#1192a8]">{stockLine.batchCode}</span>
                        </div>
                        <div className="flex justify-between sm:col-span-2 sm:pt-2 sm:border-t sm:border-gray-100">
                            <span className="text-gray-400 font-bold uppercase text-[9px] md:text-[10px]">Current location:</span>
                            <span className="font-black text-orange-600 uppercase text-sm">{stockLine.locCode}</span>
                        </div>
                    </div>

                    {/* Transfer controls */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                        <div className="space-y-4">
                            <div className="grid grid-cols-3 gap-3">
                                <div className="col-span-2">
                                    <label className="block text-[10px] md:text-[11px] font-black text-gray-500 uppercase mb-1">Transfer quantity:</label>
                                    <input 
                                        type="number" 
                                        className="w-full border-2 border-gray-100 rounded-xl px-3 py-2.5 text-sm focus:border-blue-500 outline-none font-black text-blue-700"
                                        value={quantity}
                                        onChange={(e) => setQuantity(e.target.value)}
                                        min="1"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] md:text-[11px] font-black text-gray-500 uppercase mb-1">Unit:</label>
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
                                <label className="block text-[10px] md:text-[11px] font-black text-gray-500 uppercase mb-1">Destination location (suggested):</label>
                                <select 
                                    className="wms-select w-full !py-2.5 !px-2 !text-[11px] font-bold"
                                    value={toLocationId}
                                    onChange={(e) => handleLocationChange(e.target.value)}
                                >
                                    <option value="">-- Select location --</option>
                                    {locations.map(loc => (
                                        <option key={loc.id} value={loc.id}>
                                            {loc.binCode} | {loc.containerType} | {loc.suggestionLabel.split(':')[0].replace('(', '').replace(')', '')}
                                        </option>
                                    ))}
                                </select>
                                <p className="text-[9px] text-gray-400 mt-2 italic font-medium leading-tight">* Priority goes to the same batch or an empty location that matches the unit.</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-gray-50 p-4 border-t flex flex-col sm:flex-row justify-end gap-3 shrink-0">
                    <button 
                        onClick={onClose}
                        className="order-2 sm:order-1 px-6 py-2.5 text-gray-400 font-black text-xs uppercase tracking-widest"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleTransfer}
                        disabled={isSubmitting}
                        className={`order-1 sm:order-2 px-8 py-3 bg-[#1192a8] text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-xl shadow-teal-500/20 active:scale-95 transition-all ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {isSubmitting ? 'Processing...' : 'Confirm transfer'}
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
