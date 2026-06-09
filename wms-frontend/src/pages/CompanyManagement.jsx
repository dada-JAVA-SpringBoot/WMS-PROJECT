import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import axiosClient from '../api/axiosClient';
import companyIcon from '../components/common/icons/company.png';

const initialForm = {
    companyCode: '',
    companyName: '',
    taxCode: '',
    address: '',
    parentCompanyId: '',
    active: true,
};

export default function CompanyManagement() {
    const { t } = useTranslation();
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState(initialForm);
    const [message, setMessage] = useState({ type: '', text: '' });

    const fetchCompanies = useCallback(async () => {
        setLoading(true);
        try {
            const res = await axiosClient.get('/api/companies/manage');
            setCompanies(Array.isArray(res.data) ? res.data : []);
        } catch (error) {
            console.error('Error loading companies:', error);
            setMessage({
                type: 'error',
                text: error.response?.data?.message || t('pages.CompanyManagement.loadError'),
            });
            setCompanies([]);
        } finally {
            setLoading(false);
        }
    }, [t]);

    useEffect(() => {
        fetchCompanies();
    }, [fetchCompanies]);

    const companyById = useMemo(() => {
        return new Map(companies.map(company => [String(company.id), company]));
    }, [companies]);

    const clearWorkspaceIfHidden = (companyId, nextActive) => {
        const selectedWorkspaceId = sessionStorage.getItem('wms_workspace_company_id');
        if (!nextActive && selectedWorkspaceId === String(companyId)) {
            sessionStorage.removeItem('wms_workspace_company_id');
            window.dispatchEvent(new Event('wms:workspace-changed'));
        }
    };

    const handleChange = (field, value) => {
        setForm(prev => ({
            ...prev,
            [field]: value,
        }));
    };

    const resetForm = () => {
        setEditingId(null);
        setForm(initialForm);
    };

    const startEdit = (company) => {
        setEditingId(company.id);
        setForm({
            companyCode: company.companyCode || '',
            companyName: company.companyName || '',
            taxCode: company.taxCode || '',
            address: company.address || '',
            parentCompanyId: company.parentCompanyId ? String(company.parentCompanyId) : '',
            active: Boolean(company.active),
        });
        setMessage({ type: '', text: '' });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });
        setSaving(true);

        try {
            const payload = {
                companyCode: form.companyCode.trim(),
                companyName: form.companyName.trim(),
                taxCode: form.taxCode.trim() || null,
                address: form.address.trim() || null,
                parentCompanyId: form.parentCompanyId ? Number(form.parentCompanyId) : null,
                active: Boolean(form.active),
            };

            if (editingId) {
                await axiosClient.put(`/api/companies/${editingId}`, payload);
                setMessage({ type: 'success', text: t('pages.CompanyManagement.updateSuccess') });
                clearWorkspaceIfHidden(editingId, payload.active);
            } else {
                await axiosClient.post('/api/companies', payload);
                setMessage({ type: 'success', text: t('pages.CompanyManagement.createSuccess') });
            }
            resetForm();
            await fetchCompanies();
        } catch (error) {
            console.error('Error creating company:', error);
            setMessage({
                type: 'error',
                text: error.response?.data?.message || t('pages.CompanyManagement.saveError'),
            });
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (company) => {
        const confirmed = window.confirm(
            t('pages.CompanyManagement.confirmDelete', {
                company: `${company.companyName} (${company.companyCode})`,
            })
        );
        if (!confirmed) return;

        setSaving(true);
        setMessage({ type: '', text: '' });
        try {
            await axiosClient.delete(`/api/companies/${company.id}`);
            clearWorkspaceIfHidden(company.id, false);
            if (editingId === company.id) {
                resetForm();
            }
            setMessage({ type: 'success', text: t('pages.CompanyManagement.deleteSuccess') });
            await fetchCompanies();
        } catch (error) {
            console.error('Error deleting company:', error);
            setMessage({
                type: 'error',
                text: error.response?.data?.message || t('pages.CompanyManagement.deleteError'),
            });
        } finally {
            setSaving(false);
        }
    };

    const handleRestore = async (company) => {
        const confirmed = window.confirm(
            t('pages.CompanyManagement.confirmRestore', {
                company: `${company.companyName} (${company.companyCode})`,
            })
        );
        if (!confirmed) return;

        setSaving(true);
        setMessage({ type: '', text: '' });
        try {
            await axiosClient.put(`/api/companies/${company.id}`, {
                companyCode: company.companyCode,
                companyName: company.companyName,
                taxCode: company.taxCode,
                address: company.address,
                parentCompanyId: company.parentCompanyId,
                active: true,
            });
            setMessage({ type: 'success', text: t('pages.CompanyManagement.restoreSuccess') });
            await fetchCompanies();
        } catch (error) {
            console.error('Error restoring company:', error);
            setMessage({
                type: 'error',
                text: error.response?.data?.message || t('pages.CompanyManagement.restoreError'),
            });
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="p-4 lg:p-8 bg-gray-50 dark:bg-gray-900 min-h-full text-left transition-colors duration-300">
            {/* Beautiful Header Card */}
            <div className="mb-6 flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between bg-white dark:bg-gray-800 p-6 rounded-[24px] border border-gray-100 dark:border-gray-700 shadow-sm transition-colors duration-300">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-teal-50 dark:bg-teal-900/30 rounded-2xl flex items-center justify-center p-2 shadow-inner">
                        <img src={companyIcon} alt="Company" className="w-10 h-10 object-contain dark:invert dark:opacity-90" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#1192a8] dark:text-[#4db8c8]">
                            {t('pages.CompanyManagement.kicker')}
                        </p>
                        <h1 className="text-xl lg:text-2xl font-black text-gray-800 dark:text-gray-100 uppercase tracking-tight mt-0.5">
                            {t('pages.CompanyManagement.title')}
                        </h1>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            {t('pages.CompanyManagement.subtitle')}
                        </p>
                    </div>
                </div>
            </div>

            {message.text && (
                <div
                    className={`mb-5 rounded-2xl border px-4 py-3 text-sm font-semibold ${
                        message.type === 'success'
                            ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-900/20 dark:text-emerald-300'
                            : 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900/60 dark:bg-rose-900/20 dark:text-rose-300'
                    }`}
                >
                    {message.text}
                </div>
            )}

            <div className="flex flex-col gap-6">
                <section className="bg-white dark:bg-gray-800 rounded-[32px] shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors duration-300">
                    <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-700">
                        <h2 className="text-sm font-black uppercase tracking-[0.2em] text-gray-700 dark:text-gray-200">
                            {t('pages.CompanyManagement.formTitle')}
                        </h2>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 grid gap-4">
                        {editingId && (
                            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-700 dark:border-amber-900/60 dark:bg-amber-900/20 dark:text-amber-300">
                                {t('pages.CompanyManagement.editingHint')}
                            </div>
                        )}

                        <div className="grid gap-4 md:grid-cols-2">
                            <Field
                                label={t('pages.CompanyManagement.companyCode')}
                                value={form.companyCode}
                                onChange={(value) => handleChange('companyCode', value)}
                                placeholder={t('pages.CompanyManagement.companyCodePlaceholder')}
                                required
                            />
                            <Field
                                label={t('pages.CompanyManagement.companyName')}
                                value={form.companyName}
                                onChange={(value) => handleChange('companyName', value)}
                                placeholder={t('pages.CompanyManagement.companyNamePlaceholder')}
                                required
                            />
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <Field
                                label={t('pages.CompanyManagement.taxCode')}
                                value={form.taxCode}
                                onChange={(value) => handleChange('taxCode', value)}
                                placeholder={t('pages.CompanyManagement.taxCodePlaceholder')}
                            />
                            <div>
                                <label className="mb-1.5 block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500">
                                    {t('pages.CompanyManagement.parentCompany')}
                                </label>
                                <select
                                    value={form.parentCompanyId}
                                    onChange={(e) => handleChange('parentCompanyId', e.target.value)}
                                    className="w-full rounded-2xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-3 text-sm font-semibold text-gray-700 dark:text-gray-100 outline-none focus:border-[#1192a8] transition-colors"
                                >
                                    <option value="">{t('pages.CompanyManagement.noParent')}</option>
                                    {companies
                                        .filter(company => String(company.id) !== String(editingId))
                                        .map(company => (
                                        <option key={company.id} value={company.id}>
                                            {company.companyName} ({company.companyCode})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <Field
                            label={t('pages.CompanyManagement.address')}
                            value={form.address}
                            onChange={(value) => handleChange('address', value)}
                            placeholder={t('pages.CompanyManagement.addressPlaceholder')}
                        />

                        <label className="flex items-center gap-3 rounded-2xl border border-gray-200 dark:border-gray-600 px-4 py-3 cursor-pointer select-none">
                            <input
                                type="checkbox"
                                checked={form.active}
                                onChange={(e) => handleChange('active', e.target.checked)}
                                className="h-4 w-4 rounded border-gray-300 text-[#1192a8] focus:ring-[#1192a8]"
                            />
                            <div>
                                <p className="text-sm font-bold text-gray-800 dark:text-gray-100">
                                    {t('pages.CompanyManagement.active')}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {t('pages.CompanyManagement.activeHint')}
                                </p>
                            </div>
                        </label>

                        <div className="flex flex-wrap gap-3 pt-2">
                            <button
                                type="submit"
                                disabled={saving}
                                className="rounded-2xl bg-[#1192a8] px-5 py-3 text-xs font-black uppercase tracking-[0.2em] text-white shadow-lg shadow-teal-500/20 transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60 active:scale-95"
                            >
                                {saving ? t('pages.CompanyManagement.saving') : editingId ? t('pages.CompanyManagement.updateButton') : t('pages.CompanyManagement.createButton')}
                            </button>
                            <button
                                type="button"
                                onClick={resetForm}
                                className="rounded-2xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 px-5 py-3 text-xs font-black uppercase tracking-[0.2em] text-gray-600 dark:text-gray-200 transition hover:bg-gray-50 dark:hover:bg-gray-600 active:scale-95"
                            >
                                {t('pages.CompanyManagement.resetButton')}
                            </button>
                        </div>
                    </form>
                </section>

                <section className="bg-white dark:bg-gray-800 rounded-[32px] shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors duration-300">
                    <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between gap-3">
                        <h2 className="text-sm font-black uppercase tracking-[0.2em] text-gray-700 dark:text-gray-200">
                            {t('pages.CompanyManagement.listTitle')}
                        </h2>
                        <span className="rounded-full bg-gray-100 dark:bg-gray-700 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 dark:text-gray-300">
                            {companies.length} {t('pages.CompanyManagement.items')}
                        </span>
                    </div>

                    <div className="overflow-x-auto">
                        {loading ? (
                            <div className="flex h-64 items-center justify-center text-sm font-bold uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500 animate-pulse">
                                {t('pages.CompanyManagement.loading')}
                            </div>
                        ) : (
                            <table className="w-full min-w-[760px] text-left">
                                <thead className="bg-gray-50/70 dark:bg-gray-700/40">
                                    <tr className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500">
                                        <th className="px-6 py-4">{t('pages.CompanyManagement.colCode')}</th>
                                        <th className="px-6 py-4">{t('pages.CompanyManagement.colName')}</th>
                                        <th className="px-6 py-4">{t('pages.CompanyManagement.colParent')}</th>
                                        <th className="px-6 py-4">{t('pages.CompanyManagement.colStatus')}</th>
                                        <th className="px-6 py-4 text-right">{t('pages.CompanyManagement.colActions') || 'Thao tác'}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                    {companies.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-12 text-center text-sm font-semibold text-gray-400 dark:text-gray-500">
                                                {t('pages.CompanyManagement.empty')}
                                            </td>
                                        </tr>
                                    ) : (
                                        companies.map((company) => {
                                            const parent = company.parentCompanyId ? companyById.get(String(company.parentCompanyId)) : null;
                                            return (
                                                <tr key={company.id} className="hover:bg-gray-50/80 dark:hover:bg-gray-700/30 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <div className="font-black text-[#1192a8] dark:text-[#4db8c8]">
                                                            {company.companyCode}
                                                        </div>
                                                        <div className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">
                                                            ID: {company.id}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="font-bold text-gray-800 dark:text-gray-100">
                                                            {company.companyName}
                                                        </div>
                                                        <div className="text-xs text-gray-400 dark:text-gray-500 mt-1 truncate max-w-[240px]">
                                                            {company.address || '---'}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                                                            {parent ? `${parent.companyName} (${parent.companyCode})` : t('pages.CompanyManagement.noParent')}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`inline-flex rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] ${
                                                            company.active
                                                                ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-300'
                                                                : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-300'
                                                        }`}>
                                                            {company.active ? t('pages.CompanyManagement.active') : t('pages.CompanyManagement.inactive')}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <div className="flex justify-end gap-2">
                                                            <button
                                                                type="button"
                                                                onClick={() => startEdit(company)}
                                                                className="rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-gray-600 dark:text-gray-200 transition hover:bg-gray-50 dark:hover:bg-gray-600 active:scale-95"
                                                            >
                                                                {t('pages.CompanyManagement.editButton')}
                                                            </button>
                                                            {company.active ? (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleDelete(company)}
                                                                    disabled={saving}
                                                                    className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-rose-600 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-rose-900/50 dark:bg-rose-900/20 dark:text-rose-300 active:scale-95"
                                                                >
                                                                    {t('pages.CompanyManagement.deleteButton')}
                                                                </button>
                                                            ) : (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleRestore(company)}
                                                                    disabled={saving}
                                                                    className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-emerald-600 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-emerald-900/50 dark:bg-emerald-900/20 dark:text-emerald-300 active:scale-95"
                                                                >
                                                                    {t('pages.CompanyManagement.restoreButton')}
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
}

function Field({ label, value, onChange, placeholder, required = false }) {
    return (
        <div>
            <label className="mb-1.5 block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500">
                {label}
                {required ? <span className="ml-1 text-rose-500">*</span> : null}
            </label>
            <input
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full rounded-2xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-3 text-sm font-semibold text-gray-700 dark:text-gray-100 outline-none focus:border-[#1192a8] transition-colors placeholder:text-gray-300 dark:placeholder:text-gray-500"
                required={required}
            />
        </div>
    );
}
