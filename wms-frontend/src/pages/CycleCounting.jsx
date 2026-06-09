import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import axiosClient from '../api/axiosClient';
import { ActionButton } from '../components/common/SharedUI';
import SystemDialog from '../components/modals/SystemDialog';
import addIcon from '../components/common/icons/add.png';
import excel1Icon from '../components/common/icons/excel1.png';
import storageIcon from '../components/common/icons/storage-stacks.png';
import { useAuth } from '../context/AuthContext';
import { formatDateByLanguage, formatNumberByLanguage } from '../utils/formatters';

export default function CycleCounting() {
    const { t } = useTranslation();
    const { user } = useAuth();
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activePlan, setActivePlan] = useState(null);
    const [details, setDetails] = useState([]);
    const [isCreateModalOpen, setIsCreateOpen] = useState(false);

    const [newPlanZone, setNewPlanZone] = useState("ALL");
    const [assignedTo, setAssignedTo] = useState("");
    const [zones, setZones] = useState([]);
    const [staffs, setStaffs] = useState([]);

    const roles = user?.roles || [];
    const canCreate = roles.some(r => ['ADMIN', 'MANAGER', 'STOREKEEPER', 'WAREHOUSE_KEEPER'].includes(r));

    const [dialog, setDialog] = useState({ isOpen: false, title: '', message: '', variant: 'info' });
    const showMsg = (title, message, variant = 'info') => setDialog({ isOpen: true, title, message, variant });

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [plansRes, locsRes, staffRes] = await Promise.all([
                axiosClient.get('/api/cycle-counts'),
                axiosClient.get('/api/location-overview'),
                axiosClient.get('/api/staff/names')
            ]);
            // API trả về Page object { content: [...] } hoặc array thẳng
            const plansData = plansRes.data;
            setPlans(Array.isArray(plansData) ? plansData : (plansData?.content ?? []));
            setStaffs(staffRes.data || []);
            const uniqueZones = Array.from(new Set((locsRes.data || []).map(l => l.zone))).filter(Boolean);
            setZones(uniqueZones);
        } catch (error) {
            console.error("Lỗi tải dữ liệu kiểm kê:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleCreatePlan = async () => {
        if (!assignedTo) return showMsg(t('pages.CycleCounting.dialogRequire'), t('pages.CycleCounting.alertSelectStaff'), "info");
        try {
            await axiosClient.post('/api/cycle-counts', {
                zone: newPlanZone,
                assignedTo: parseInt(assignedTo),
                note: t('pages.CycleCounting.noteTemplate', { zone: newPlanZone === 'ALL' ? t('pages.CycleCounting.entireWarehouse') : newPlanZone })
            });
            showMsg(t('pages.CycleCounting.dialogSuccess'), t('pages.CycleCounting.alertPlanCreated'), "info");
            setIsCreateOpen(false);
            setAssignedTo("");
            fetchData();
        } catch (error) {
            showMsg(t('pages.CycleCounting.dialogError'), t('pages.CycleCounting.alertCreateFailed') + (error.response?.data?.message || error.message), "info");
        }
    };

    const viewPlanDetails = async (plan) => {
        try {
            const res = await axiosClient.get(`/api/cycle-counts/${plan.id}/details`);
            setDetails(res.data);
            setActivePlan(plan);
        } catch (error) {
            showMsg(t('pages.CycleCounting.dialogError'), t('pages.CycleCounting.alertLoadDetailsFailed'), "info");
        }
    };

    const handleUpdateCount = async (detailId, countedQty) => {
        try {
            await axiosClient.put(`/api/cycle-counts/details/${detailId}?countedQty=${countedQty}`);
            setDetails(prev => prev.map(d => d.id === detailId ? { ...d, countedQty, variance: countedQty - d.systemQty } : d));
        } catch (error) {
            console.error("Lỗi cập nhật số lượng:", error);
        }
    };

    const handleCompletePlan = async (planId) => {
        try {
            await axiosClient.post(`/api/cycle-counts/${planId}/complete`);
            showMsg(t('pages.CycleCounting.dialogSuccess'), t('pages.CycleCounting.alertPlanCompleted'), "info");
            setActivePlan(null);
            setDetails([]);
            fetchData();
        } catch (error) {
            showMsg(t('pages.CycleCounting.dialogError'), t('pages.CycleCounting.alertCompleteFailed') + (error.response?.data?.message || error.message));
        }
    };

    const getStaffFullName = (id) => staffs.find(s => s.id === id)?.fullName || `${t('pages.CycleCounting.staffShort')} #${id}`;

    return (
        <div className="p-4 md:p-6 bg-[#f8f9fa] dark:bg-gray-900 min-h-full flex flex-col text-left font-sans text-gray-800 dark:text-gray-100 no-scrollbar transition-colors duration-300">
            <SystemDialog isOpen={dialog.isOpen} title={dialog.title} message={dialog.message} variant={dialog.variant} onClose={() => setDialog({ ...dialog, isOpen: false })} />

            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 mb-6 md:mb-8 transition-all">
                <div>
                    <h1 className="text-xl md:text-2xl font-black text-gray-800 dark:text-gray-100 uppercase tracking-tight">Cycle Counting</h1>
                    <p className="text-gray-500 dark:text-gray-400 text-xs md:text-sm font-medium">{t('pages.CycleCounting.subtitle')}</p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-3 md:p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex gap-4 shrink-0 transition-colors duration-300">
                    {canCreate && <ActionButton label={t('pages.CycleCounting.btnCreatePlan')} iconSrc={addIcon} onClick={() => setIsCreateOpen(true)} />}
                    <ActionButton label={t('pages.CycleCounting.btnRefresh')} iconSrc={excel1Icon} onClick={fetchData} />
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 md:gap-8 flex-1">

                {/* 1. Danh sách các đợt kiểm kê */}
                <div className="xl:col-span-1 bg-white dark:bg-gray-800 rounded-2xl md:rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col h-[500px] md:h-[700px] transition-colors duration-300">
                    <div className="p-4 md:p-6 border-b border-gray-50 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-700/50 rounded-t-2xl md:rounded-t-3xl">
                        <h3 className="font-black text-gray-800 dark:text-gray-100 uppercase text-[10px] md:text-xs tracking-widest flex items-center gap-2">
                            <span>📋</span> {t('pages.CycleCounting.sidebarTitle')} ({plans.length})
                        </h3>
                    </div>
                    <div className="flex-1 overflow-y-auto no-scrollbar p-3 md:p-4 space-y-3">
                        {(Array.isArray(plans) ? plans : []).sort((a, b) => b.id - a.id).map(plan => (
                            <div
                                key={plan.id}
                                onClick={() => viewPlanDetails(plan)}
                                className={`p-3 md:p-4 rounded-xl md:rounded-2xl border-2 transition-all cursor-pointer
                                    ${activePlan?.id === plan.id
                                    ? 'border-[#1192a8] bg-cyan-50 dark:bg-[#1192a8]/15'
                                    : 'border-gray-50 dark:border-gray-700 hover:border-gray-200 dark:hover:border-gray-500'
                                }`}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <span className="font-black text-[#1192a8] dark:text-[#38bcd4] text-sm">{plan.planCode}</span>
                                    <span className={`px-2 py-0.5 rounded-full text-[8px] md:text-[9px] font-black uppercase border
                                        ${plan.status === 'COMPLETED'
                                        ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border-green-100 dark:border-green-800'
                                        : 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-800'
                                    }`}>
                                        {plan.status === 'COMPLETED' ? t('pages.CycleCounting.statusCompleted') : t('pages.CycleCounting.statusCounting')}
                                    </span>
                                </div>
                                <div className="text-[9px] md:text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase">{formatDateByLanguage(plan.createdAt)}</div>
                                <div className="mt-2 flex items-center gap-2">
                                    <span className="text-[9px] md:text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase">{t('pages.CycleCounting.assignedLabel')}</span>
                                    <span className="text-[10px] font-black text-gray-600 dark:text-gray-300 uppercase truncate">{getStaffFullName(plan.assignedTo)}</span>
                                </div>
                                <div className="text-[11px] md:text-xs text-gray-600 dark:text-gray-400 mt-2 italic truncate border-t border-gray-50 dark:border-gray-700 pt-2">"{plan.note}"</div>
                            </div>
                        ))}
                        {plans.length === 0 && <div className="py-20 text-center text-gray-300 dark:text-gray-600 italic px-4 text-sm">{t('pages.CycleCounting.noPlans')}</div>}
                    </div>
                </div>

                {/* 2. Giao diện đếm hàng (Worksheet) */}
                <div className="xl:col-span-2 bg-white dark:bg-gray-800 rounded-2xl md:rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col h-[500px] md:h-[700px] overflow-hidden transition-colors duration-300">
                    {!activePlan ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-gray-300 dark:text-gray-600 gap-4 p-8 text-center">
                            <div className="w-16 h-16 md:w-20 md:h-20 bg-gray-50 dark:bg-gray-700 rounded-full flex items-center justify-center">
                                <img src={storageIcon} className="w-8 h-8 md:w-10 md:h-10 opacity-20 dark:opacity-40 dark:invert dark:hue-rotate-180" alt="Select plan" />
                            </div>
                            <p className="italic font-medium text-sm md:text-base">{t('pages.CycleCounting.selectPlanInstruction')}</p>
                        </div>
                    ) : (
                        <>
                            <div className="p-4 md:p-6 border-b border-gray-50 dark:border-gray-700 bg-gradient-to-r from-cyan-50 to-white dark:from-[#1192a8]/10 dark:to-gray-800 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 shrink-0">
                                <div className="min-w-0">
                                    <h3 className="font-black text-gray-800 dark:text-gray-100 uppercase tracking-tight text-xs md:text-sm truncate">{t('pages.CycleCounting.worksheetTitle', { code: activePlan.planCode })}</h3>
                                    <p className="text-[9px] md:text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase">{t('pages.CycleCounting.worksheetSubtitle')}</p>
                                </div>
                                {activePlan.status !== 'COMPLETED' && roles.some(r => ['ADMIN', 'MANAGER'].includes(r)) && (
                                    <button
                                        onClick={() => handleCompletePlan(activePlan.id)}
                                        className="px-4 py-2 bg-[#1192a8] text-white rounded-xl text-[10px] md:text-xs font-black shadow-lg shadow-teal-100 dark:shadow-teal-900/20 hover:bg-teal-700 transition-all active:scale-95 uppercase tracking-tighter"
                                    >
                                        {t('pages.CycleCounting.btnFinalize')}
                                    </button>
                                )}
                            </div>
                            <div className="flex-1 overflow-x-auto no-scrollbar lg:scrollbar-thin">
                                <table className="w-full text-left min-w-[700px]">
                                    <thead className="bg-gray-50/80 dark:bg-gray-700/50 text-[9px] md:text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase sticky top-0 z-10 backdrop-blur-sm">
                                        <tr>
                                            <th className="p-4">{t('pages.CycleCounting.colBin')}</th>
                                            <th className="p-4">{t('pages.CycleCounting.colProduct')}</th>
                                            <th className="p-4">{t('pages.CycleCounting.colBatch')}</th>
                                            <th className="p-4 text-center">{t('pages.CycleCounting.colSystem')}</th>
                                            <th className="p-4 text-center w-28 md:w-32">{t('pages.CycleCounting.colActual')}</th>
                                            <th className="p-4 text-right">{t('pages.CycleCounting.colVariance')}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-xs md:text-sm divide-y divide-gray-50 dark:divide-gray-700/50">
                                        {details.map((d) => (
                                            <tr key={d.id} className={`transition-colors
                                                ${d.variance !== 0
                                            ? 'bg-orange-50/30 dark:bg-orange-900/10'
                                            : 'hover:bg-blue-50/50 dark:hover:bg-gray-700/30'
                                        }`}>
                                                <td className="p-4">
                                                    <span className="font-black text-[#1192a8] dark:text-[#38bcd4] uppercase">{d.binCode}</span>
                                                    <div className="text-[8px] md:text-[9px] text-gray-400 dark:text-gray-500 font-bold uppercase">{d.zone}</div>
                                                </td>
                                                <td className="p-4">
                                                    <div className="font-bold text-gray-800 dark:text-gray-100 uppercase truncate max-w-[150px]" title={d.productName}>{d.productName}</div>
                                                    <div className="text-[9px] md:text-[10px] font-mono text-gray-400 dark:text-gray-500">{d.productSku}</div>
                                                </td>
                                                <td className="p-4 font-mono font-bold text-gray-500 dark:text-gray-400">{d.batchCode}</td>
                                                <td className="p-4 text-center font-bold text-gray-400 dark:text-gray-500">{formatNumberByLanguage(d.systemQty)}</td>
                                                <td className="p-4">
                                                    <input 
                                                        type="number" 
                                                        value={d.countedQty} 
                                                        onChange={(e) => handleUpdateCount(d.id, parseFloat(e.target.value || 0))}
                                                        disabled={activePlan.status === 'COMPLETED'}
                                                        className={`w-full text-center py-2 px-1 rounded-xl border-2 font-black transition-all outline-none text-sm
                                                            ${d.variance === 0
                                                        ? 'border-gray-100 dark:border-gray-600 focus:border-[#1192a8] bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100'
                                                        : 'border-orange-200 dark:border-orange-700 text-orange-600 dark:text-orange-400 bg-white dark:bg-orange-900/20 shadow-sm focus:border-orange-400'
                                                    }`}
                                                    />
                                                </td>
                                                <td className="p-4 text-right">
                                                    {d.variance === 0 ? (
                                                        <span className="text-green-500 dark:text-green-400 font-bold text-[10px] md:text-xs">{t('pages.CycleCounting.statusMatch')}</span>
                                                    ) : (
                                                        <span className={`font-black text-sm md:text-base ${d.variance > 0 ? 'text-blue-600 dark:text-blue-400' : 'text-red-600 dark:text-red-400'}`}>
                                                            {d.variance > 0 ? `+${formatNumberByLanguage(d.variance)}` : formatNumberByLanguage(d.variance)}
                                                        </span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Create Plan Modal */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-md z-[100] flex justify-center items-center p-2 md:p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl md:rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in duration-200 flex flex-col max-h-[98vh] transition-colors duration-300">
                        <div className="p-5 md:p-6 bg-[#1192a8] text-white shrink-0 text-center">
                            <h2 className="text-base md:text-xl font-black uppercase tracking-tight">{t('pages.CycleCounting.modalTitle')}</h2>
                            <p className="text-[10px] md:text-xs opacity-80 uppercase font-bold mt-1">{t('pages.CycleCounting.modalSubtitle')}</p>
                        </div>
                        <div className="p-5 md:p-8 space-y-6 text-left overflow-y-auto flex-1">
                            <div className="space-y-4">
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase ml-1">{t('pages.CycleCounting.labelZone')}</label>
                                    <select 
                                        value={newPlanZone} 
                                        onChange={e => setNewPlanZone(e.target.value)}
                                        className="wms-select w-full !py-2.5 md:!py-3 !text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                                    >
                                        <option value="ALL">{t('pages.CycleCounting.optionAllZones')}</option>
                                        {zones.map(z => <option key={z} value={z}>{t('pages.CycleCounting.optionZone', { zone: z })}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase ml-1">{t('pages.CycleCounting.labelStaff')}</label>
                                    <select 
                                        value={assignedTo} 
                                        onChange={e => setAssignedTo(e.target.value)}
                                        className="wms-select w-full !py-2.5 md:!py-3 !text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                                    >
                                        <option value="">{t('pages.CycleCounting.selectStaffPlaceholder')}</option>
                                        {staffs.filter(s => s.roles?.some(r => ['STOREKEEPER', 'WAREHOUSE_KEEPER', 'CHECKER'].includes(r))).map(s => (
                                            <option key={s.id} value={s.id}>{s.fullName} ({s.username})</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-xl md:rounded-2xl border border-orange-100 dark:border-orange-800 shadow-sm">
                                <p className="text-[10px] md:text-[11px] text-orange-700 dark:text-orange-400 leading-relaxed italic font-medium">
                                    {t('pages.CycleCounting.modalWarning')}
                                </p>
                            </div>
                        </div>
                        <div className="p-4 md:p-6 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 flex justify-end gap-4 shrink-0">
                            <button onClick={() => setIsCreateOpen(false)} className="text-[10px] md:text-xs font-black text-gray-400 dark:text-gray-500 uppercase hover:text-gray-600 dark:hover:text-gray-300 transition-colors">{t('pages.CycleCounting.btnCancel')}</button>
                            <button onClick={handleCreatePlan} className="px-6 md:px-8 py-2.5 md:py-3 bg-[#1192a8] text-white rounded-xl text-[10px] md:text-xs font-black shadow-lg hover:bg-teal-700 transition-all active:scale-95 uppercase tracking-widest">{t('pages.CycleCounting.btnStart')}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
