import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export default function QCInspectionModal({ isOpen, onClose, items, products, onConfirm }) {
    const { i18n } = useTranslation();
    const isEnglish = String(i18n.language || '').startsWith('en');
    const copy = isEnglish ? {
        title: 'QC Review & Quality Assessment',
        subtitle: 'Please confirm the actual intact and damaged quantities',
        productSpec: 'Product & spec',
        received: 'Received',
        intact: 'Intact',
        damaged: 'Damaged',
        rating: 'Rating',
        notes: 'Inspection notes',
        approved: 'Approved',
        gradeB: 'Grade B (Dented)',
        partiallyDamaged: 'Partially damaged',
        rejected: 'Rejected',
        notesPlaceholder: 'Damage reason, condition details...',
        intactGoods: 'Intact goods',
        damagedGoods: 'Damaged goods',
        back: 'Back',
        confirm: 'CONFIRM & RECEIVE'
    } : {
        title: 'Kiểm tra QC & đánh giá chất lượng',
        subtitle: 'Vui lòng xác nhận số lượng nguyên vẹn và hư hỏng thực tế',
        productSpec: 'Sản phẩm & thông số',
        received: 'Đã nhận',
        intact: 'Nguyên vẹn',
        damaged: 'Hư hỏng',
        rating: 'Đánh giá',
        notes: 'Ghi chú kiểm tra',
        approved: 'Đạt',
        gradeB: 'Hạng B (Móp)',
        partiallyDamaged: 'Hư hỏng một phần',
        rejected: 'Từ chối',
        notesPlaceholder: 'Lý do hư hỏng, chi tiết tình trạng...',
        intactGoods: 'Hàng nguyên vẹn',
        damagedGoods: 'Hàng hư hỏng',
        back: 'Quay lại',
        confirm: 'XÁC NHẬN & NHẬP HÀNG'
    };
    const [inspectionData, setInspectionData] = useState([]);

    useEffect(() => {
        if (isOpen && items) {
            setInspectionData(items.map(item => ({
                ...item,
                quantityIntact: item.quantityReceived,
                quantityDamaged: 0,
                qualityRating: 'Approved',
                qcNotes: ''
            })));
        }
    }, [isOpen, items]);

    if (!isOpen) return null;

    const handleQtyChange = (idx, field, val) => {
        const next = [...inspectionData];
        const num = parseFloat(val) || 0;
        const total = next[idx].quantityReceived;

        if (field === 'quantityIntact') {
            next[idx].quantityIntact = Math.min(num, total);
            next[idx].quantityDamaged = total - next[idx].quantityIntact;
        } else {
            next[idx].quantityDamaged = Math.min(num, total);
            next[idx].quantityIntact = total - next[idx].quantityDamaged;
        }
        setInspectionData(next);
    };

    const handleTextChange = (idx, field, val) => {
        const next = [...inspectionData];
        next[idx][field] = val;
        setInspectionData(next);
    };

    const handleSubmit = () => {
        onConfirm(inspectionData);
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200] flex justify-center items-center p-4">
            <div className="bg-white rounded-[32px] w-full max-w-6xl overflow-hidden shadow-2xl flex flex-col max-h-[95vh] animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="bg-gradient-to-r from-rose-500 to-rose-600 p-6 text-white flex justify-between items-center">
                    <div>
                        <h2 className="text-lg font-black uppercase tracking-widest">{copy.title}</h2>
                        <p className="text-xs font-bold opacity-80 mt-1 italic">{copy.subtitle}</p>
                    </div>
                    <button onClick={onClose} className="text-3xl hover:rotate-90 transition-transform">&times;</button>
                </div>

                {/* Body */}
                <div className="p-8 overflow-y-auto flex-1 bg-gray-50/50">
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 border-b text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                <tr>
                                    <th className="p-4">{copy.productSpec}</th>
                                    <th className="p-4 text-center w-28">{copy.received}</th>
                                    <th className="p-4 text-center w-32">{copy.intact}</th>
                                    <th className="p-4 text-center w-32 text-rose-500">{copy.damaged}</th>
                                    <th className="p-4 w-40">{copy.rating}</th>
                                    <th className="p-4">{copy.notes}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {inspectionData.map((item, idx) => {
                                    const p = products.find(prod => prod.id === item.productId);
                                    return (
                                        <tr key={idx} className="hover:bg-rose-50/20 transition-colors">
                                            <td className="p-4">
                                                <p className="font-bold text-gray-800">{p?.name || `SP #${item.productId}`}</p>
                                                <p className="text-[10px] text-gray-400 font-mono mt-0.5">{p?.sku || '---'}</p>
                                            </td>
                                            <td className="p-4 text-center font-black text-gray-400 bg-gray-50/50">
                                                {item.quantityReceived.toLocaleString()}
                                            </td>
                                            <td className="p-4">
                                                <input 
                                                    type="number" 
                                                    value={item.quantityIntact} 
                                                    onChange={e => handleQtyChange(idx, 'quantityIntact', e.target.value)}
                                                    className="w-full border-2 border-teal-100 rounded-xl px-3 py-2 text-center font-black text-teal-600 focus:border-teal-400 outline-none transition-all"
                                                />
                                            </td>
                                            <td className="p-4">
                                                <input 
                                                    type="number" 
                                                    value={item.quantityDamaged} 
                                                    onChange={e => handleQtyChange(idx, 'quantityDamaged', e.target.value)}
                                                    className="w-full border-2 border-rose-100 rounded-xl px-3 py-2 text-center font-black text-rose-600 focus:border-rose-400 outline-none transition-all"
                                                />
                                            </td>
                                            <td className="p-4">
                                                    <select 
                                                        value={item.qualityRating}
                                                        onChange={e => handleTextChange(idx, 'qualityRating', e.target.value)}
                                                        className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold bg-white outline-none focus:ring-2 focus:ring-rose-500/20"
                                                    >
                                                    <option value="Approved">{copy.approved}</option>
                                                    <option value="Grade B (Dented)">{copy.gradeB}</option>
                                                    <option value="Partially damaged">{copy.partiallyDamaged}</option>
                                                    <option value="Rejected - Pending action">{copy.rejected}</option>
                                                    </select>
                                            </td>
                                            <td className="p-4">
                                                <input 
                                                    type="text" 
                                                    value={item.qcNotes}
                                                    onChange={e => handleTextChange(idx, 'qcNotes', e.target.value)}
                                                    placeholder={copy.notesPlaceholder}
                                                    className="w-full border-b border-gray-200 px-2 py-1 text-xs focus:border-rose-500 outline-none transition-all"
                                                />
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t bg-white flex justify-between items-center">
                    <div className="flex gap-8">
                        <div className="text-left">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{copy.intactGoods}</p>
                            <p className="text-2xl font-black text-teal-600">
                                {inspectionData.reduce((s, i) => s + i.quantityIntact, 0).toLocaleString()}
                            </p>
                        </div>
                        <div className="text-left border-l pl-8">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest text-rose-500">{copy.damagedGoods}</p>
                            <p className="text-2xl font-black text-rose-600">
                                {inspectionData.reduce((s, i) => s + i.quantityDamaged, 0).toLocaleString()}
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <button onClick={onClose} className="px-8 py-3 rounded-2xl text-sm font-bold text-gray-400 hover:text-gray-600 transition-colors">{copy.back}</button>
                        <button 
                            onClick={handleSubmit}
                            className="px-10 py-3 bg-rose-500 text-white rounded-2xl font-black uppercase text-xs shadow-xl shadow-rose-500/20 hover:bg-rose-600 hover:scale-105 active:scale-95 transition-all"
                        >
                            {copy.confirm}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
