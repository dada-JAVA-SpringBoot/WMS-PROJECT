// ================================================================
// 4. Inventory.jsx — thay fetch → axiosClient
// ================================================================
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import Barcode from 'react-barcode';
import * as XLSX from 'xlsx';
import axiosClient from '../api/axiosClient';

// Modals
import ProductModal from '../components/modals/ProductModal';
import ProductDetailModal from '../components/modals/ProductDetailModal';
import BulkEditModal from '../components/modals/BulkEditModal';
import InventoryFilterModal from '../components/modals/InventoryFilterModal';
import SystemDialog from '../components/modals/SystemDialog';
import RowContextMenu from '../components/modals/RowContextMenu';
import CopyFieldsModal from '../components/modals/CopyFieldsModal';
import ExportExcelModal from '../components/modals/ExportExcelModal';
import ScannerModal from '../components/modals/ScannerModal';

// Import Icons
import addIcon from '../components/common/icons/add.png';
import fixIcon from '../components/common/icons/fix.png';
import deleteIcon from '../components/common/icons/delete.png';
import infoIcon from '../components/common/icons/info.png';
import excelIcon from '../components/common/icons/excel.png';
import inboundIcon from '../components/common/icons/inbound.png';
import outboundIcon from '../components/common/icons/outbound.png';
import scanIcon from '../components/common/icons/scan.png';

import { useExcelExport } from '../hooks/useExcelExport';
import { useWorkspaceRefresh } from '../hooks/useWorkspaceRefresh';

export default function Inventory({ onCreateInbound, onCreateOutbound }) {
    const { t } = useTranslation();
    // 1. Quản lý State Modal
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isBulkEditModalOpen, setIsBulkEditModalOpen] = useState(false);
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [editingProduct, setEditingProduct] = useState(null);
    const [selectedProductIds, setSelectedProductIds] = useState([]);
    const [selectionAnchorIndex, setSelectionAnchorIndex] = useState(null);
    const [hoverPreview, setHoverPreview] = useState(null);
    const [systemDialog, setSystemDialog] = useState(null);
    const [contextMenu, setContextMenu] = useState(null);
    const [isCopyModalOpen, setIsCopyModalOpen] = useState(false);
    const [copyTargetProducts, setCopyTargetProducts] = useState([]);
    const [isScannerOpen, setIsScannerOpen] = useState(false);
    const [inventoryViewMode, setInventoryViewMode] = useState('list');
    const [inventoryFilters, setInventoryFilters] = useState({
        status: 'ALL',
        stock: 'ALL',
        categoryId: 'ALL',
        supplierCode: 'ALL',
        baseUnit: 'ALL',
        storageTemp: 'ALL',
        sortBy: 'DEFAULT'
    });

    const {
        isExportModalOpen,
        exportFileName,
        setExportFileName,
        openExportModal,
        closeExportModal,
        performExport,
        detectBestExportMode
    } = useExcelExport(`inventory_${new Date().toISOString().slice(0, 10)}.xlsx`);

    // 2. Quản lý State Dữ liệu
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [units, setUnits] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const normalizeUnitName = (value) => {
        if (!value) return '';
        const map = {
            'H?p': 'Hộp',
            'L?c': 'Lốc',
            'V?i': 'Vỉ',
            'Pallet': 'Pallet'
        };
        const resolved = map[value] || value;
        return t(`pages.Inventory.units.${resolved}`, { defaultValue: resolved });
    };

    const normalizeStorageTemp = (value) => {
        if (!value) return '';
        let resolved = 'Bình thường';
        if (value.includes('Kho Mát')) resolved = 'Kho Mát';
        else if (value.includes('Kho Lạnh')) resolved = 'Kho Lạnh';
        else if (value.includes('Tránh ánh sáng')) resolved = 'Tránh ánh sáng trực tiếp';
        return t(`pages.Inventory.storageTemps.${resolved}`, { defaultValue: resolved });
    };

    const parseDateValue = (value) => {
        if (!value) return null;
        const timestamp = new Date(value).getTime();
        return Number.isNaN(timestamp) ? null : timestamp;
    };

    const compareNullableNumbers = (a, b, direction = 'asc') => {
        const aMissing = a === null || a === undefined || Number.isNaN(a);
        const bMissing = b === null || b === undefined || Number.isNaN(b);
        if (aMissing && bMissing) return 0;
        if (aMissing) return 1;
        if (bMissing) return -1;
        return direction === 'asc' ? a - b : b - a;
    };

    const compareNullableStrings = (a, b, direction = 'asc') => {
        const aValue = String(a || '');
        const bValue = String(b || '');
        return direction === 'asc'
            ? aValue.localeCompare(bValue, 'vi', { sensitivity: 'base', numeric: true })
            : bValue.localeCompare(aValue, 'vi', { sensitivity: 'base', numeric: true });
    };

    const getSortDirection = (sortBy) => (String(sortBy).endsWith('_DESC') ? 'desc' : 'asc');
    const getSortField = (sortBy) => String(sortBy || 'DEFAULT').replace(/_(ASC|DESC)$/, '');

    const toggleColumnSort = (field) => {
        setInventoryFilters(prev => {
            const currentField = getSortField(prev.sortBy);
            const currentDirection = getSortDirection(prev.sortBy);
            const nextDirection = currentField === field
                ? (currentDirection === 'asc' ? 'desc' : 'asc')
                : 'asc';
            return {
                ...prev,
                sortBy: `${field}_${nextDirection.toUpperCase()}`
            };
        });
    };

    // 3. Quản lý State Tìm kiếm
    const [searchKeyword, setSearchKeyword] = useState('');
    const [searchType, setSearchType] = useState('Tất cả');

    // --- CÁC HÀM GỌI API ĐƯỢC CẬP NHẬT SANG AXIOSCLIENT ---
    const fetchProducts = async () => {
        setIsLoading(true);
        try {
            const res = await axiosClient.get('/api/products/details');
            setProducts(res.data);
        } catch (error) {
            console.warn('Không kết nối được Backend lấy sản phẩm...', error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const res = await axiosClient.get('/api/categories');
            setCategories(res.data);
        } catch (error) {
            console.warn("Không tải được danh mục...", error);
        }
    };

    const fetchSuppliers = async () => {
        try {
            const res = await axiosClient.get('/api/suppliers');
            setSuppliers(res.data);
        } catch (error) {
            console.warn("Không tải được nhà cung cấp...", error);
        }
    };

    const fetchUnits = async () => {
        try {
            const res = await axiosClient.get('/api/units');
            setUnits(res.data);
        } catch (error) {
            console.warn("Không tải được đơn vị tính...", error);
        }
    };

    // Tự động load dữ liệu lần đầu
    useEffect(() => {
        fetchProducts();
        fetchCategories();
        fetchSuppliers();
        fetchUnits();
    }, []);

    useWorkspaceRefresh(() => {
        fetchProducts();
        fetchCategories();
        fetchSuppliers();
        fetchUnits();
    });

    // 4. Logic Lọc Dữ liệu (Search Filter)
    const categoryMap = useMemo(() => {
        return new Map(categories.map(category => [String(category.id), category]));
    }, [categories]);

    const filteredProducts = useMemo(() => {
        const keyword = searchKeyword.trim().toLowerCase();
        const filtered = products.filter(item => {
            const matchesKeyword = !keyword || (() => {
                switch (searchType) {
                    case 'Theo tên SP':
                        return (item.name || '').toLowerCase().includes(keyword);
                    case 'Theo SKU':
                        return (item.sku || '').toLowerCase().includes(keyword);
                    case 'Theo Mã vạch':
                        return (item.barcode || '').toLowerCase().includes(keyword);
                    case 'Theo phân loại': {
                        const category = categoryMap.get(String(item.categoryId));
                        return (
                            (category?.name || '').toLowerCase().includes(keyword) ||
                            (category?.categoryCode || '').toLowerCase().includes(keyword)
                        );
                    }
                    case 'Theo NCC':
                        return (item.supplierCodes || '').toLowerCase().includes(keyword);
                    default: {
                        const category = categoryMap.get(String(item.categoryId));
                        return (
                            (item.name || '').toLowerCase().includes(keyword) ||
                            (item.sku || '').toLowerCase().includes(keyword) ||
                            (item.barcode || '').toLowerCase().includes(keyword) ||
                            (item.supplierCodes || '').toLowerCase().includes(keyword) ||
                            normalizeUnitName(item.baseUnit).toLowerCase().includes(keyword) ||
                            normalizeStorageTemp(item.storageTemp).toLowerCase().includes(keyword) ||
                            (category?.name || '').toLowerCase().includes(keyword) ||
                            (category?.categoryCode || '').toLowerCase().includes(keyword)
                        );
                    }
                }
            })();

            const totalStock = Number(item.totalStock || 0);
            const allocatedStock = Number(item.allocatedStock ?? item.quantityAllocated ?? item.allocated ?? 0);
            const availableStock = item.availableStock !== undefined && item.availableStock !== null
                ? Number(item.availableStock)
                : totalStock - allocatedStock;
            const incomingStock = Number(item.incomingStock ?? item.inboundStock ?? item.onOrderStock ?? 0);
            const safetyStock = item.safetyStock !== undefined && item.safetyStock !== null
                ? Number(item.safetyStock)
                : null;

            const matchesStatus =
                inventoryFilters.status === 'ALL' ||
                item.status === inventoryFilters.status;
            const matchesCategory =
                inventoryFilters.categoryId === 'ALL' ||
                String(item.categoryId ?? '') === String(inventoryFilters.categoryId);
            const supplierCodeList = (item.supplierCodes || '')
                .split(',')
                .map(code => code.trim().toUpperCase())
                .filter(Boolean);
            const matchesSupplier =
                inventoryFilters.supplierCode === 'ALL' ||
                supplierCodeList.includes(String(inventoryFilters.supplierCode).toUpperCase());
            const matchesUnit =
                inventoryFilters.baseUnit === 'ALL' ||
                normalizeUnitName(item.baseUnit) === inventoryFilters.baseUnit;
            const matchesStorage =
                inventoryFilters.storageTemp === 'ALL' ||
                normalizeStorageTemp(item.storageTemp) === inventoryFilters.storageTemp;
            const matchesStock =
                inventoryFilters.stock === 'ALL' ||
                (inventoryFilters.stock === 'HAS' && availableStock > 0) ||
                (inventoryFilters.stock === 'LOW' && safetyStock !== null && availableStock < safetyStock) ||
                (inventoryFilters.stock === 'ZERO' && availableStock === 0) ||
                (inventoryFilters.stock === 'ALLOCATED' && allocatedStock > 0) ||
                (inventoryFilters.stock === 'INCOMING' && incomingStock > 0) ||
                (inventoryFilters.stock === 'NO_INCOMING' && incomingStock === 0);

            return matchesKeyword && matchesStatus && matchesCategory && matchesSupplier && matchesUnit && matchesStorage && matchesStock;
        });

        const sorted = [...filtered];
        const getCategorySortKey = (item) => {
            const category = categoryMap.get(String(item.categoryId));
            return (
                category?.name?.trim() ||
                category?.categoryCode?.trim() ||
                'ZZZ'
            ).toLowerCase();
        };
        const compareByCategory = (a, b) => getCategorySortKey(a).localeCompare(getCategorySortKey(b), 'vi', { sensitivity: 'base', numeric: true });

        const getAvailableStockSortKey = (item) => {
            const totalStock = Number(item.totalStock || 0);
            const allocatedStock = Number(item.allocatedStock ?? item.quantityAllocated ?? item.allocated ?? 0);
            return item.availableStock !== undefined && item.availableStock !== null
                ? Number(item.availableStock)
                : totalStock - allocatedStock;
        };
        const getAllocatedStockSortKey = (item) => Number(item.allocatedStock ?? item.quantityAllocated ?? item.allocated ?? 0);
        const getIncomingStockSortKey = (item) => Number(item.incomingStock ?? item.inboundStock ?? item.onOrderStock ?? 0);
        const getTotalStockSortKey = (item) => Number(item.totalStock || 0);
        const getSafetyStockSortKey = (item) => Number(item.safetyStock ?? Number.MAX_SAFE_INTEGER);
        const getUnitSortKey = (item) => normalizeUnitName(item.baseUnit);
        const getCreatedAtSortKey = (item) => parseDateValue(item.createdAt);
        const getNearestBatchExpirySortKey = (item) => parseDateValue(item.nearestBatchExpiryDate);

        const sorters = {
            DEFAULT: (a, b) => compareByCategory(a, b) || compareNullableStrings(a.name, b.name, 'asc'),
            NAME_ASC: (a, b) => compareByCategory(a, b) || compareNullableStrings(a.name, b.name, 'asc'),
            NAME_DESC: (a, b) => compareByCategory(a, b) || compareNullableStrings(a.name, b.name, 'desc'),
            SKU_ASC: (a, b) => compareByCategory(a, b) || compareNullableStrings(a.sku, b.sku, 'asc'),
            SKU_DESC: (a, b) => compareByCategory(a, b) || compareNullableStrings(a.sku, b.sku, 'desc'),
            UNIT_ASC: (a, b) => compareByCategory(a, b) || compareNullableStrings(getUnitSortKey(a), getUnitSortKey(b), 'asc'),
            UNIT_DESC: (a, b) => compareByCategory(a, b) || compareNullableStrings(getUnitSortKey(a), getUnitSortKey(b), 'desc'),
            AVAILABLE_ASC: (a, b) => compareByCategory(a, b) || compareNullableNumbers(getAvailableStockSortKey(a), getAvailableStockSortKey(b), 'asc'),
            AVAILABLE_DESC: (a, b) => compareByCategory(a, b) || compareNullableNumbers(getAvailableStockSortKey(a), getAvailableStockSortKey(b), 'desc'),
            TOTAL_ASC: (a, b) => compareByCategory(a, b) || compareNullableNumbers(getTotalStockSortKey(a), getTotalStockSortKey(b), 'asc'),
            TOTAL_DESC: (a, b) => compareByCategory(a, b) || compareNullableNumbers(getTotalStockSortKey(a), getTotalStockSortKey(b), 'desc'),
            ALLOCATED_ASC: (a, b) => compareByCategory(a, b) || compareNullableNumbers(getAllocatedStockSortKey(a), getAllocatedStockSortKey(b), 'asc'),
            ALLOCATED_DESC: (a, b) => compareByCategory(a, b) || compareNullableNumbers(getAllocatedStockSortKey(a), getAllocatedStockSortKey(b), 'desc'),
            INCOMING_ASC: (a, b) => compareByCategory(a, b) || compareNullableNumbers(getIncomingStockSortKey(a), getIncomingStockSortKey(b), 'asc'),
            INCOMING_DESC: (a, b) => compareByCategory(a, b) || compareNullableNumbers(getIncomingStockSortKey(a), getIncomingStockSortKey(b), 'desc'),
            SAFETY_ASC: (a, b) => compareByCategory(a, b) || compareNullableNumbers(getSafetyStockSortKey(a), getSafetyStockSortKey(b), 'asc'),
            SAFETY_DESC: (a, b) => compareByCategory(a, b) || compareNullableNumbers(getSafetyStockSortKey(a), getSafetyStockSortKey(b), 'desc'),
            CREATED_ASC: (a, b) => compareByCategory(a, b) || compareNullableNumbers(getCreatedAtSortKey(a), getCreatedAtSortKey(b), 'asc'),
            CREATED_DESC: (a, b) => compareByCategory(a, b) || compareNullableNumbers(getCreatedAtSortKey(a), getCreatedAtSortKey(b), 'desc'),
            BATCH_EXPIRY_ASC: (a, b) => compareByCategory(a, b) || compareNullableNumbers(getNearestBatchExpirySortKey(a), getNearestBatchExpirySortKey(b), 'asc'),
            BATCH_EXPIRY_DESC: (a, b) => compareByCategory(a, b) || compareNullableNumbers(getNearestBatchExpirySortKey(a), getNearestBatchExpirySortKey(b), 'desc')
        };

        const sorter = sorters[inventoryFilters.sortBy] || sorters.DEFAULT;
        sorted.sort(sorter);

        return sorted;
    }, [products, searchKeyword, searchType, inventoryFilters, categoryMap]);

    const selectedProducts = useMemo(() => {
        return products.filter(item => selectedProductIds.includes(item.id));
    }, [products, selectedProductIds]);

    const unitMap = useMemo(() => {
        return new Map(units.map(unit => [unit.name, unit]));
    }, [units]);

    const getCategoryDisplay = (product) => {
        if (product?.categoryName) {
            return {
                name: product.categoryName,
                code: product.categoryCode || ''
            };
        }
        const category = categoryMap.get(String(product?.categoryId));
        if (!category) {
            return { name: t('pages.Inventory.category.unassigned'), code: '' };
        }
        return {
            name: category.name || t('pages.Inventory.category.unassigned'),
            code: category.categoryCode || ''
        };
    };

    const groupedInventoryProducts = useMemo(() => {
        const groups = [];
        const groupIndexMap = new Map();

        filteredProducts.forEach((product, index) => {
            const category = categoryMap.get(String(product?.categoryId));
            const categoryDisplay = category
                ? {
                    name: category.name || t('pages.Inventory.category.unassigned'),
                    code: category.categoryCode || ''
                }
                : { name: t('pages.Inventory.category.unassigned'), code: '' };
            const categoryKey = `${categoryDisplay.code || ''}|${categoryDisplay.name || ''}`;

            if (!groupIndexMap.has(categoryKey)) {
                groupIndexMap.set(categoryKey, groups.length);
                groups.push({
                    key: categoryKey,
                    category: categoryDisplay,
                    products: []
                });
            }

            groups[groupIndexMap.get(categoryKey)].products.push({
                product,
                index
            });
        });

        return groups;
    }, [filteredProducts, categoryMap, t]);

    const resolveCategoryLabel = (product) => {
        if (!product) return '';
        const category = categoryMap.get(String(product.categoryId));
        if (!category) return '';
        return `${category.categoryCode} - ${category.name}`;
    };

    const resolveUnitLabel = (product) => {
        if (!product) return '';
        return unitMap.get(normalizeUnitName(product.baseUnit))?.name || normalizeUnitName(product.baseUnit);
    };

    const getInventoryStockState = (product) => {
        const totalStock = Number(product?.totalStock || 0);
        const allocatedStock = Number(product?.allocatedStock ?? product?.quantityAllocated ?? product?.allocated ?? 0);
        const availableStock = product?.availableStock !== undefined && product?.availableStock !== null
            ? Number(product.availableStock)
            : totalStock - allocatedStock;
        const incomingStock = Number(product?.incomingStock ?? product?.inboundStock ?? product?.onOrderStock ?? 0);
        const safetyStock = product?.safetyStock !== undefined && product?.safetyStock !== null
            ? Number(product.safetyStock)
            : null;

        return {
            totalStock,
            allocatedStock,
            availableStock,
            incomingStock,
            safetyStock,
            isBelowSafety: safetyStock !== null && availableStock < safetyStock
        };
    };

    const currentSortField = getSortField(inventoryFilters.sortBy);
    const currentSortDirection = getSortDirection(inventoryFilters.sortBy);

    const renderSortableHeader = (label, field, alignClass = 'text-left') => {
        const isActive = currentSortField === field;
        const indicator = isActive
            ? (currentSortDirection === 'asc' ? '↑' : '↓')
            : '↕';

        return (
            <button
                type="button"
                onClick={() => toggleColumnSort(field)}
                className={`inline-flex items-center gap-1 w-full cursor-pointer hover:text-[#1192a8] transition-colors ${
                    alignClass === 'text-right'
                        ? 'justify-end'
                        : alignClass === 'text-center'
                            ? 'justify-center'
                            : 'justify-start'
                }`}
            >
                <span>{label}</span>
                <span className={`text-[10px] leading-none ${isActive ? 'text-[#1192a8]' : 'text-gray-400 dark:text-gray-500'}`}>{indicator}</span>
            </button>
        );
    };

    const showMessage = (title, message) => {
        setSystemDialog({
            variant: 'info',
            title,
            message
        });
    };

    const showConfirm = (title, message, onConfirm) => {
        setSystemDialog({
            variant: 'confirm',
            title,
            message,
            onConfirm: async () => {
                setSystemDialog(null);
                await onConfirm();
            }
        });
    };

    const closeContextMenu = () => setContextMenu(null);

    useEffect(() => {
        const handleWindowClick = () => setContextMenu(null);
        const handleEscape = (event) => {
            if (event.key === 'Escape') {
                setContextMenu(null);
                setIsCopyModalOpen(false);
            }
        };

        window.addEventListener('click', handleWindowClick);
        window.addEventListener('scroll', handleWindowClick, true);
        window.addEventListener('keydown', handleEscape);

        return () => {
            window.removeEventListener('click', handleWindowClick);
            window.removeEventListener('scroll', handleWindowClick, true);
            window.removeEventListener('keydown', handleEscape);
        };
    }, []);

    const setSingleSelection = (product, index) => {
        setSelectedProductIds([product.id]);
        setSelectionAnchorIndex(index);
    };

    const lastClickRef = useRef({ id: null, time: 0 });

    const handleRowClick = (product, index, event) => {
        const now = Date.now();
        const isDoubleTap = lastClickRef.current.id === product.id && (now - lastClickRef.current.time < 300);

        if (isDoubleTap) {
            setSingleSelection(product, index);
            setSelectedProduct(product);
            lastClickRef.current = { id: null, time: 0 };
            return;
        }
        lastClickRef.current = { id: product.id, time: now };

        const isToggle = event.ctrlKey || event.metaKey;
        const isRange = event.shiftKey && selectionAnchorIndex !== null;

        if (isRange) {
            const start = Math.min(selectionAnchorIndex, index);
            const end = Math.max(selectionAnchorIndex, index);
            const rangeIds = filteredProducts.slice(start, end + 1).map(item => item.id);
            setSelectedProductIds(rangeIds);
            return;
        }

        if (isToggle) {
            setSelectedProductIds(prev => {
                const exists = prev.includes(product.id);
                return exists ? prev.filter(id => id !== product.id) : [...prev, product.id];
            });
            setSelectionAnchorIndex(index);
            return;
        }

        setSingleSelection(product, index);
    };

    const handleRowContextMenu = (event, product, index) => {
        event.preventDefault();
        event.stopPropagation();

        const isAlreadySelected = selectedProductIds.includes(product.id);
        const targetProducts = isAlreadySelected && selectedProducts.length > 0
            ? selectedProducts
            : [product];

        if (!isAlreadySelected) {
            setSingleSelection(product, index);
        }

        const menuWidth = 260;
        const menuHeight = 320;
        const x = Math.min(event.clientX, window.innerWidth - menuWidth - 12);
        const openAbove = event.clientY + menuHeight > window.innerHeight;
        const rawY = openAbove
            ? event.clientY - menuHeight - 12
            : event.clientY;
        const y = Math.max(12, Math.min(rawY, window.innerHeight - menuHeight - 12));
        setContextMenu({
            products: targetProducts,
            anchorProduct: product,
            index,
            x: Math.max(12, x),
            y: Math.max(12, y)
        });
    };

    const handleOpenDetail = (productsForAction = selectedProducts) => {
        if (productsForAction.length !== 1) {
            showMessage(t('pages.Inventory.dialog.cannotOpenDetailTitle'), t('pages.Inventory.dialog.cannotOpenDetailMessage'));
            return;
        }
        setSelectedProduct(productsForAction[0]);
    };

    const handleOpenEdit = (productsForAction = selectedProducts) => {
        if (productsForAction.length === 0) {
            showMessage(t('pages.Inventory.dialog.missingSelectionTitle'), t('pages.Inventory.dialog.missingSelectionMessage'));
            return;
        }

        if (productsForAction.length === 1) {
            setEditingProduct(productsForAction[0]);
            setIsEditModalOpen(true);
            return;
        }

        setIsBulkEditModalOpen(true);
    };

    const handleDeleteProduct = async (productsToDelete = selectedProducts) => {
        if (!productsToDelete.length) {
            showMessage(t('pages.Inventory.dialog.missingSelectionTitle'), t('pages.Inventory.dialog.missingSelectionMessage'));
            return;
        }

        const label = productsToDelete.length === 1
            ? t('pages.Inventory.dialog.confirmDeleteSingle', { name: productsToDelete[0].name, sku: productsToDelete[0].sku })
            : t('pages.Inventory.dialog.confirmDeletePlural', { count: productsToDelete.length });

        showConfirm(t('pages.Inventory.dialog.confirmTitle'), label, async () => {
            try {
                for (const product of productsToDelete) {
                    await axiosClient.delete(`/api/products/${product.id}`);
                }

                setSelectedProductIds([]);
                setSelectionAnchorIndex(null);
                setSelectedProduct(prev => (productsToDelete.some(item => item.id === prev?.id) ? null : prev));
                await fetchProducts();
                setSystemDialog(null);
            } catch (error) {
                console.warn("Không thể xóa sản phẩm", error);
                showMessage(t('pages.Inventory.dialog.cannotDeleteTitle'), t('pages.Inventory.dialog.cannotDeleteMessage'));
            }
        });
    };

    const handleCopyClipboard = async (lines) => {
        const text = lines.join('\n');
        if (!text.trim()) {
            showMessage(t('pages.Inventory.dialog.missingDataTitle'), t('pages.Inventory.dialog.missingDataCopyMessage'));
            return;
        }

        try {
            await navigator.clipboard.writeText(text);
            setIsCopyModalOpen(false);
            setCopyTargetProducts([]);
            showMessage(t('pages.Inventory.dialog.copiedTitle'), t('pages.Inventory.dialog.copiedMessage'));
        } catch (error) {
            console.warn("Không thể sao chép vào clipboard", error);
            showMessage(t('pages.Inventory.dialog.cannotCopyTitle'), t('pages.Inventory.dialog.cannotCopyMessage'));
        }
    };

    const buildExcelWorkbook = (exportSource) => {
        const rows = exportSource.map((item, index) => {
            const stockState = getInventoryStockState(item);

            return {
                [t('pages.Inventory.excel.stt')]: index + 1,
                [t('pages.Inventory.excel.sku')]: item.sku || '',
                [t('pages.Inventory.excel.name')]: item.name || '',
                [t('pages.Inventory.excel.barcode')]: item.barcode || '',
                [t('pages.Inventory.excel.category')]: resolveCategoryLabel(item),
                [t('pages.Inventory.excel.unit')]: resolveUnitLabel(item),
                [t('pages.Inventory.excel.storageCondition')]: normalizeStorageTemp(item.storageTemp),
                [t('pages.Inventory.excel.status')]: item.status === 'ACTIVE' ? t('pages.Inventory.excel.statusActive') : t('pages.Inventory.excel.statusInactive'),
                [t('pages.Inventory.excel.totalStock')]: stockState.totalStock,
                [t('pages.Inventory.excel.allocatedStock')]: stockState.allocatedStock,
                [t('pages.Inventory.excel.availableStock')]: stockState.availableStock,
                [t('pages.Inventory.excel.incomingStock')]: stockState.incomingStock,
                [t('pages.Inventory.excel.safetyStock')]: item.safetyStock ?? '',
                [t('pages.Inventory.excel.stockWarning')]: stockState.isBelowSafety ? t('pages.Inventory.excel.belowSafety') : '',
                [t('pages.Inventory.excel.supplier')]: item.supplierCodes || '',
                [t('pages.Inventory.excel.weight')]: item.weight ?? '',
                [t('pages.Inventory.excel.length')]: item.length ?? '',
                [t('pages.Inventory.excel.width')]: item.width ?? '',
                [t('pages.Inventory.excel.height')]: item.height ?? '',
            };
        });

        const workbook = XLSX.utils.book_new();
        const dataSheet = XLSX.utils.json_to_sheet(rows);
        XLSX.utils.book_append_sheet(workbook, dataSheet, t('pages.Inventory.excel.sheetNameInventory'));

        const summaryRows = [
            { [t('pages.Inventory.excel.metric')]: t('pages.Inventory.excel.totalProducts'), [t('pages.Inventory.excel.value')]: exportSource.length },
            { [t('pages.Inventory.excel.metric')]: t('pages.Inventory.excel.selected'), [t('pages.Inventory.excel.value')]: selectedProducts.length },
            { [t('pages.Inventory.excel.metric')]: t('pages.Inventory.excel.hasBarcode'), [t('pages.Inventory.excel.value')]: exportSource.filter(item => !!item.barcode).length },
            { [t('pages.Inventory.excel.metric')]: t('pages.Inventory.excel.noBarcode'), [t('pages.Inventory.excel.value')]: exportSource.filter(item => !item.barcode).length },
            { [t('pages.Inventory.excel.metric')]: t('pages.Inventory.excel.stockGreaterThanZero'), [t('pages.Inventory.excel.value')]: exportSource.filter(item => Number(item.totalStock || 0) > 0).length },
            { [t('pages.Inventory.excel.metric')]: t('pages.Inventory.excel.stockEqualToZero'), [t('pages.Inventory.excel.value')]: exportSource.filter(item => Number(item.totalStock || 0) === 0).length },
            { [t('pages.Inventory.excel.metric')]: t('pages.Inventory.excel.belowSafetyCount'), [t('pages.Inventory.excel.value')]: exportSource.filter(item => getInventoryStockState(item).isBelowSafety).length },
            { [t('pages.Inventory.excel.metric')]: t('pages.Inventory.excel.totalIncoming'), [t('pages.Inventory.excel.value')]: exportSource.reduce((sum, item) => sum + getInventoryStockState(item).incomingStock, 0) }
        ];
        const summarySheet = XLSX.utils.json_to_sheet(summaryRows);
        XLSX.utils.book_append_sheet(workbook, summarySheet, t('pages.Inventory.excel.sheetNameSummary'));
        return { workbook, rows };
    };

    const handleExportExcel = async () => {
        const exportSource = selectedProducts.length > 0 ? selectedProducts : filteredProducts;

        if (!exportSource.length) {
            showMessage(t('pages.Inventory.dialog.noDataTitle'), t('pages.Inventory.dialog.noDataExcelMessage'));
            return;
        }

        const { workbook, rows } = buildExcelWorkbook(exportSource);

        const success = await performExport(workbook, null, rows);
        if (success) {
            closeExportModal();
            showMessage(t('pages.Inventory.dialog.exportedTitle'), t('pages.Inventory.dialog.exportedMessage'));
        }
    };

    const openCopyModal = (productsForCopy) => {
        setCopyTargetProducts(productsForCopy);
        setIsCopyModalOpen(true);
        closeContextMenu();
    };

    const openExportModalLocal = () => {
        setExportFileName(`inventory_${new Date().toISOString().slice(0, 10)}.xlsx`);
        openExportModal();
    };

    const handleCreateReceiptFlow = (kind) => {
        if (!selectedProducts.length) {
            showMessage(t('pages.Inventory.dialog.missingSelectionTitle'), t('pages.Inventory.dialog.missingSelectionMessage'));
            return;
        }

        if (kind === 'inbound') {
            onCreateInbound?.({
                kind: 'inbound',
                source: 'inventory',
                products: selectedProducts
            });
            return;
        }

        onCreateOutbound?.({
            kind: 'outbound',
            source: 'inventory',
            products: selectedProducts
        });
    };

    const handleScanSuccess = (decodedText) => {
        setSearchKeyword(decodedText);
        setSearchType('Tất cả');
        setIsScannerOpen(false);
    };

    return (
        <div className="p-6 bg-[#f8f9fa] dark:bg-gray-900 min-h-full flex flex-col text-left no-scrollbar transition-colors duration-300">
            {/* ── Toolbar: Action Buttons (Sticky) ── */}
            <div className="sticky top-0 z-20 flex items-center justify-between bg-white dark:bg-gray-800 p-4 md:p-5 rounded-2xl md:rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 mb-4 md:mb-6 transition-colors duration-300">
                <div className="flex gap-4 md:gap-8 overflow-x-auto no-scrollbar pb-1 w-full lg:w-auto">
                    <div onClick={() => setIsAddModalOpen(true)} className="shrink-0"><ActionButton iconSrc={addIcon} label={t('pages.Inventory.toolbar.addNew')} /></div>
                    <div onClick={() => {
                        if (selectedProducts.length === 0) {
                            showMessage(t('pages.Inventory.dialog.missingSelectionTitle'), t('pages.Inventory.dialog.missingSelectionSingleMessage'));
                            return;
                        }
                        if (selectedProducts.length === 1) {
                            handleOpenEdit(selectedProducts[0]);
                            return;
                        }
                        setIsBulkEditModalOpen(true);
                    }} className="shrink-0"><ActionButton iconSrc={fixIcon} label={t('pages.Inventory.toolbar.edit')} /></div>
                    <div onClick={() => {
                        if (selectedProducts.length === 0) {
                            showMessage(t('pages.Inventory.dialog.missingSelectionTitle'), t('pages.Inventory.dialog.missingSelectionMessage'));
                            return;
                        }
                        handleDeleteProduct(selectedProducts);
                    }} className="shrink-0"><ActionButton iconSrc={deleteIcon} label={t('pages.Inventory.toolbar.delete')} /></div>
                    <div onClick={() => handleOpenDetail(selectedProducts)} className="shrink-0"><ActionButton iconSrc={infoIcon} label={t('pages.Inventory.toolbar.detail')} /></div>
                    <div onClick={() => handleCreateReceiptFlow('inbound')} className="shrink-0"><ActionButton iconSrc={inboundIcon} label={t('pages.Inventory.toolbar.inbound')} /></div>
                    <div onClick={() => handleCreateReceiptFlow('outbound')} className="shrink-0"><ActionButton iconSrc={outboundIcon} label={t('pages.Inventory.toolbar.outbound')} /></div>
                    <div onClick={openExportModalLocal} className="shrink-0"><ActionButton iconSrc={excelIcon} label={t('pages.Inventory.toolbar.excel')} /></div>
                    <div onClick={() => setIsScannerOpen(true)} className="shrink-0"><ActionButton iconSrc={scanIcon} label={t('pages.Inventory.toolbar.scan')} /></div>
                </div>
                <div className="text-xs font-black text-gray-300 dark:text-gray-600 uppercase tracking-widest hidden lg:block">{t('pages.Inventory.title')}</div>
            </div>

            {/* ── Filter Bar: Search & Selects ── */}
            <div className="bg-white dark:bg-gray-800 p-4 md:p-5 rounded-2xl md:rounded-3xl border border-gray-100 dark:border-gray-700 mb-4 md:mb-6 flex flex-col gap-4 shadow-sm transition-colors duration-300">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 md:gap-4">
                    <select
                        value={searchType}
                        onChange={(e) => setSearchType(e.target.value)}
                        className="wms-select w-full sm:w-48 !text-sm !py-2.5 md:!py-3 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                    >
                        <option value="Tất cả">{t('pages.Inventory.search.types.all')}</option>
                        <option value="Theo tên SP">{t('pages.Inventory.search.types.name')}</option>
                        <option value="Theo SKU">{t('pages.Inventory.search.types.sku')}</option>
                        <option value="Theo Mã vạch">{t('pages.Inventory.search.types.barcode')}</option>
                        <option value="Theo phân loại">{t('pages.Inventory.search.types.category')}</option>
                        <option value="Theo NCC">{t('pages.Inventory.search.types.supplier')}</option>
                    </select>
                    <div className="flex flex-1 gap-2">
                        <input
                            type="text"
                            value={searchKeyword}
                            onChange={(e) => setSearchKeyword(e.target.value)}
                            className="flex-1 border-2 border-gray-100 dark:border-gray-600 rounded-xl px-4 md:px-5 py-2.5 md:py-3 text-sm outline-none focus:border-[#1192a8] transition-all bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 min-w-0"
                            placeholder={t('pages.Inventory.search.placeholder')}
                        />
                        <button
                            onClick={fetchProducts}
                            className="bg-[#1192a8] text-white px-4 md:px-6 py-2.5 md:py-3 rounded-xl font-bold text-sm hover:bg-teal-700 transition flex items-center gap-2 whitespace-nowrap cursor-pointer shadow-lg shadow-teal-500/20 active:scale-95"
                        >
                            <span className="hidden sm:inline">↻</span> {t('pages.Inventory.filters.refresh')}
                        </button>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-x-6 gap-y-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-2">
                        <span className="text-[9px] md:text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase">{t('pages.Inventory.filters.category')}</span>
                        <select
                            value={inventoryFilters.categoryId}
                            onChange={(e) => setInventoryFilters(prev => ({ ...prev, categoryId: e.target.value }))}
                            className="wms-select !text-[10px] md:!text-[11px] !py-1 md:!py-1.5 !px-2 md:!px-3 min-w-[120px] md:min-w-[140px] bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                        >
                            <option value="ALL">{t('pages.Inventory.filters.all')}</option>
                            {categories.map(cat => <option key={cat.id} value={String(cat.id)}>{cat.name}</option>)}
                        </select>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-[9px] md:text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase">{t('pages.Inventory.filters.supplier')}</span>
                        <select
                            value={inventoryFilters.supplierCode}
                            onChange={(e) => setInventoryFilters(prev => ({ ...prev, supplierCode: e.target.value }))}
                            className="wms-select !text-[10px] md:!text-[11px] !py-1 md:!py-1.5 !px-2 md:!px-3 min-w-[100px] md:min-w-[140px] bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                        >
                            <option value="ALL">{t('pages.Inventory.filters.all')}</option>
                            {suppliers.map(sup => <option key={sup.id} value={sup.supplierCode}>{sup.name}</option>)}
                        </select>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-[9px] md:text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase">{t('pages.Inventory.filters.status')}</span>
                        <select
                            value={inventoryFilters.status}
                            onChange={(e) => setInventoryFilters(prev => ({ ...prev, status: e.target.value }))}
                            className="wms-select !text-[10px] md:!text-[11px] !py-1 md:!py-1.5 !px-2 md:!px-3 min-w-[80px] md:min-w-[120px] bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                        >
                            <option value="ALL">{t('pages.Inventory.filters.all')}</option>
                            <option value="ACTIVE">{t('pages.Inventory.filters.statusActive')}</option>
                            <option value="INACTIVE">{t('pages.Inventory.filters.statusInactive')}</option>
                        </select>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-[9px] md:text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase">{t('pages.Inventory.filters.stock')}</span>
                        <select
                            value={inventoryFilters.stock}
                            onChange={(e) => setInventoryFilters(prev => ({ ...prev, stock: e.target.value }))}
                            className="wms-select !text-[10px] md:!text-[11px] !py-1 md:!py-1.5 !px-2 md:!px-3 min-w-[80px] md:min-w-[120px] bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                        >
                            <option value="ALL">{t('pages.Inventory.filters.all')}</option>
                            <option value="HAS">{t('pages.Inventory.filters.stockAvailable')}</option>
                            <option value="LOW">{t('pages.Inventory.filters.stockLow')}</option>
                            <option value="ZERO">{t('pages.Inventory.filters.stockZero')}</option>
                        </select>
                    </div>
                    <button
                        onClick={() => {
                            setInventoryFilters({
                                status: 'ALL',
                                stock: 'ALL',
                                categoryId: 'ALL',
                                supplierCode: 'ALL',
                                baseUnit: 'ALL',
                                storageTemp: 'ALL',
                                sortBy: 'DEFAULT'
                            });
                            setSearchKeyword('');
                            setSearchType('Tất cả');
                        }}
                        className="ml-auto text-[9px] md:text-[10px] font-black text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 uppercase tracking-tighter cursor-pointer transition-colors"
                    >
                        {t('pages.Inventory.filters.clear')}
                    </button>
                </div>
            </div>

            {/* ── Content Card (Table or Grid) ── */}
            <div className="flex-1 bg-white dark:bg-gray-800 rounded-2xl md:rounded-3xl border border-gray-100 dark:border-gray-700 overflow-hidden shadow-sm flex flex-col transition-colors duration-300">
                <div className="flex-1 overflow-x-auto no-scrollbar lg:scrollbar-thin">
                    {isLoading ? (
                        <div className="flex justify-center items-center h-full text-[#1192a8] font-bold animate-pulse uppercase text-xs tracking-widest">
                            <span className="animate-pulse">{t('pages.Inventory.loading')}</span>
                        </div>
                    ) : (
                        inventoryViewMode === 'list' ? (
                            <table className="w-full text-center text-sm min-w-[800px] md:min-w-[1000px]">
                            <thead className="bg-gray-50/80 dark:bg-gray-700/50 sticky top-0 shadow-sm z-10 backdrop-blur-sm">
                        <tr className="text-gray-400 dark:text-gray-500 uppercase text-[10px] md:text-xs tracking-widest font-black">
                            <th className="p-3 md:p-4 font-black text-left">{renderSortableHeader(t('pages.Inventory.table.sku'), 'SKU')}</th>
                            <th className="p-3 md:p-4 font-black text-left">{renderSortableHeader(t('pages.Inventory.table.name'), 'NAME')}</th>
                            <th className="p-3 md:p-4 font-black text-right">{renderSortableHeader(t('pages.Inventory.table.available'), 'AVAILABLE', 'text-right')}</th>
                            <th className="p-3 md:p-4 font-black text-right hidden sm:table-cell">{renderSortableHeader(t('pages.Inventory.table.safety'), 'SAFETY', 'text-right')}</th>
                            <th className="p-3 md:p-4 font-black text-left hidden md:table-cell">{renderSortableHeader(t('pages.Inventory.table.unit'), 'UNIT', 'text-left')}</th>
                            <th className="p-3 md:p-4 font-black hidden lg:table-cell">{t('pages.Inventory.table.barcode')}</th>
                            <th className="p-3 md:p-4 font-black text-center">{t('pages.Inventory.table.status')}</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50">
                        {filteredProducts.length > 0 ? (
                            filteredProducts.map((item, index) => {
                                const categoryDisplay = getCategoryDisplay(item);
                                const stockState = getInventoryStockState(item);
                                const previousCategoryDisplay = index > 0
                                    ? getCategoryDisplay(filteredProducts[index - 1])
                                    : null;
                                const categoryKey = `${categoryDisplay.code || ''}|${categoryDisplay.name || ''}`;
                                const previousCategoryKey = previousCategoryDisplay
                                    ? `${previousCategoryDisplay.code || ''}|${previousCategoryDisplay.name || ''}`
                                    : '';
                                const isFirstCategoryProduct = index === 0 || categoryKey !== previousCategoryKey;
                                const categoryProductCount = groupedInventoryProducts.find(group => group.key === categoryKey)?.products.length || 0;

                                        return (
                                            <React.Fragment key={item.id}>
                                                {isFirstCategoryProduct ? (
                                                    <tr className="bg-slate-50 dark:bg-gray-700/30">
                                                        <td colSpan="7" className="px-4 py-2 text-left border-y border-slate-200 dark:border-gray-700">
                                                            <div className="flex items-center gap-2">
                                                                    <span className="text-sm font-bold text-slate-800 dark:text-gray-100">
                                                                        {categoryDisplay.name}
                                                                    </span>
                                                                {categoryDisplay.code ? (
                                                                    <span className="text-[11px] font-semibold text-slate-500 dark:text-gray-400 bg-white dark:bg-gray-700 border border-slate-200 dark:border-gray-600 px-2 py-0.5 rounded">
                                                                            {categoryDisplay.code}
                                                                        </span>
                                                                ) : null}
                                                                <span className="text-[11px] text-slate-400 dark:text-gray-500">
                                                                        {t('pages.Inventory.table.productCount', { count: categoryProductCount })}
                                                                    </span>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ) : null}
                                <tr
                                    onClick={(e) => handleRowClick(item, index, e)}
                                    onContextMenu={(e) => handleRowContextMenu(e, item, index)}
                                    onMouseEnter={(e) => {
                                        const rect = e.currentTarget.getBoundingClientRect();
                                        const previewWidth = 176;
                                        const previewHeight = 176;
                                        const nextX = Math.max(8, rect.left - previewWidth - 16);
                                        const centeredY = rect.top + (rect.height / 2) - (previewHeight / 2);
                                        const nextY = Math.max(8, Math.min(centeredY, window.innerHeight - previewHeight - 8));
                                        setHoverPreview({ product: item, x: nextX, y: nextY });
                                    }}
                                    onMouseMove={(e) => {
                                        const rect = e.currentTarget.getBoundingClientRect();
                                        const previewWidth = 176;
                                        const previewHeight = 176;
                                        const nextX = Math.max(8, rect.left - previewWidth - 16);
                                        const centeredY = rect.top + (rect.height / 2) - (previewHeight / 2);
                                        const nextY = Math.max(8, Math.min(centeredY, window.innerHeight - previewHeight - 8));
                                        setHoverPreview(prev => ({ product: item, x: nextX, y: nextY, prevId: prev?.product?.id }));
                                    }}
                                    onMouseLeave={() => setHoverPreview(prev => (prev?.product?.id === item.id ? null : prev))}
                                    onDoubleClick={() => {
                                        setSingleSelection(item, index);
                                        setSelectedProduct(item);
                                    }}
                                    className={`transition cursor-pointer group ${
                                        selectedProductIds.includes(item.id)
                                            ? 'bg-teal-50 dark:bg-[#1192a8]/15 border-l-4 border-l-[#1192a8]'
                                            : 'hover:bg-blue-50/50 dark:hover:bg-gray-700/30 border-l-4 border-l-transparent'
                                    }`}
                                >
                                    <td
                                        className={`p-4 font-semibold text-left group-hover:underline ${
                                            stockState.isBelowSafety ? 'text-red-600 dark:text-red-400' : 'text-[#1192a8]'
                                        }`}
                                        title={stockState.isBelowSafety ? t('pages.Inventory.table.belowSafetyTooltip') : ''}
                                    >
                                        {item.sku}
                                    </td>
                                    <td className="p-4 font-medium text-gray-900 dark:text-gray-100 text-left group-hover:text-[#1192a8] dark:group-hover:text-[#38bcd4] transition-colors">{item.name}</td>
                                    <td className={`p-4 font-bold text-right ${stockState.isBelowSafety ? 'text-red-600 dark:text-red-400' : 'text-slate-800 dark:text-gray-100'}`}>
                                        {stockState.availableStock.toLocaleString()}
                                    </td>
                                    <td className="p-4 font-semibold text-right text-amber-700 dark:text-amber-400 hidden sm:table-cell">
                                        {stockState.safetyStock ?? 'N/A'}
                                    </td>
                                    <td className="p-4 text-left hidden md:table-cell">
                                            <span className="inline-flex items-center text-[11px] font-semibold text-slate-600 dark:text-gray-300 bg-slate-50 dark:bg-gray-700 border border-slate-200 dark:border-gray-600 px-2 py-1 rounded">
                                                {resolveUnitLabel(item) || 'N/A'}
                                            </span>
                                    </td>
                                    <td className="p-4 text-gray-500 dark:text-gray-400 font-mono hidden lg:table-cell">
                                        {item.barcode ? (
                                            <div className="flex flex-col items-center gap-1">
                                                <Barcode
                                                    value={item.barcode}
                                                    format="CODE128"
                                                    width={1.2}
                                                    height={26}
                                                    fontSize={0}
                                                    margin={0}
                                                    displayValue={false}
                                                    background="transparent"
                                                />
                                            </div>
                                        ) : (
                                            <span>N/A</span>
                                        )}
                                    </td>
                                    <td className="p-4 text-center">
                                        {item.status === 'ACTIVE' ? (
                                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700/50 px-2 py-1 rounded-full">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> ACTIVE
                                                </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 px-2 py-1 rounded-full">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span> INACTIVE
                                                </span>
                                        )}
                                    </td>
                                </tr>
                            </React.Fragment>
                        );
                    })
                ) : (
                    <tr>
                        <td colSpan="7" className="p-8 text-center text-gray-400 dark:text-gray-600 italic font-medium">
                            {t('pages.Inventory.table.noProducts', { keyword: searchKeyword })}
                        </td>
                    </tr>
                )}
                </tbody>
            </table>
        ) : (
            <div className="p-4 space-y-5">
                {groupedInventoryProducts.length > 0 ? (
                    groupedInventoryProducts.map(group => (
                        <section key={group.key} className="space-y-3">
                                            <div className="flex items-center gap-2 border-b border-slate-200 dark:border-gray-700 pb-2">
                                                <span className="text-sm font-bold text-slate-800 dark:text-gray-100">{group.category.name}</span>
                                                {group.category.code ? (
                                                    <span className="text-[11px] font-semibold text-slate-500 dark:text-gray-400 bg-slate-50 dark:bg-gray-700 border border-slate-200 dark:border-gray-600 px-2 py-0.5 rounded">
                                                        {group.category.code}
                                                    </span>
                                                ) : null}
                                                <span className="text-[11px] text-slate-400 dark:text-gray-500">{t('pages.Inventory.table.productCount', { count: group.products.length })}</span>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                                                {group.products.map(({ product, index }) => {
                                                    const unitLabel = unitMap.get(normalizeUnitName(product.baseUnit))?.name || normalizeUnitName(product.baseUnit);
                                                    const stockState = getInventoryStockState(product);
                                                    const isSelected = selectedProductIds.includes(product.id);

                                                    return (
                                                        <article
                                                            key={product.id}
                                                            onClick={(e) => handleRowClick(product, index, e)}
                                                            onContextMenu={(e) => handleRowContextMenu(e, product, index)}
                                                            onDoubleClick={() => {
                                                                setSingleSelection(product, index);
                                                                setSelectedProduct(product);
                                                            }}
                                                            className={`grid grid-cols-[96px_1fr] gap-3 p-3 border rounded-xl cursor-pointer transition-colors duration-200 ${
                                                                isSelected
                                                                    ? 'border-[#1192a8] bg-teal-50 dark:bg-[#1192a8]/15'
                                                                    : 'border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-[#1192a8]/40 dark:hover:border-[#1192a8]/40 hover:bg-blue-50/40 dark:hover:bg-gray-700/30'
                                                            }`}
                                                        >
                                                            <div className="w-24 h-24 bg-slate-50 dark:bg-gray-700 border border-slate-200 dark:border-gray-600 overflow-hidden flex items-center justify-center rounded-lg">
                                                                {product.imageUrl ? (
                                                                    <img
                                                                        src={product.imageUrl}
                                                                        alt={product.name}
                                                                        className="w-full h-full object-contain p-1.5"
                                                                        onError={(e) => {
                                                                            e.target.src = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22200%22%20height%3D%22200%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20200%20200%22%3E%3Crect%20width%3D%22200%22%20height%3D%22200%22%20fill%3D%22%23eee%22%2F%3E%3Ctext%20x%3D%2250%25%22%20y%3D%2250%25%22%20font-size%3D%2218%22%20text-anchor%3D%22middle%22%20alignment-baseline%3D%22middle%22%20font-family%3D%22sans-serif%22%20fill%3D%22%23999%22%3ENo+Image%3C%2Ftext%3E%3C%2Fsvg%3E';
                                                                        }}
                                                                    />
                                                                ) : (
                                                                    <span className="text-[10px] text-slate-400 dark:text-gray-500 font-medium text-center px-2">
                                                                        {t('pages.Inventory.grid.noImage')}
                                                                    </span>
                                                                )}
                                                            </div>

                                                            <div className="min-w-0 flex flex-col gap-2">
                                                                <div className="min-w-0">
                                                                    <div
                                                                        className={`text-xs font-bold truncate ${
                                                                            stockState.isBelowSafety ? 'text-red-600 dark:text-red-400' : 'text-[#1192a8]'
                                                                        }`}
                                                                        title={stockState.isBelowSafety ? t('pages.Inventory.table.belowSafetyTooltip') : ''}
                                                                    >
                                                                        {product.sku || t('pages.Inventory.grid.noSku')}
                                                                    </div>
                                                                    <div className="text-sm font-semibold text-slate-900 dark:text-gray-100 truncate" title={product.name}>
                                                                        {product.name}
                                                                    </div>
                                                                </div>

                                                                <div className="grid grid-cols-2 gap-2 text-xs">
                                                                    <div>
                                                                        <div className="text-slate-400 dark:text-gray-500">{t('pages.Inventory.grid.available')}</div>
                                                                        <div className={`font-bold ${stockState.isBelowSafety ? 'text-red-600 dark:text-red-400' : 'text-green-700 dark:text-green-400'}`}>
                                                                            {stockState.availableStock.toLocaleString()} {unitLabel}
                                                                        </div>
                                                                    </div>
                                                                    <div>
                                                                        <div className="text-slate-400 dark:text-gray-500">{t('pages.Inventory.grid.safety')}</div>
                                                                        <div className="font-semibold text-amber-700 dark:text-amber-400">{stockState.safetyStock ?? 'N/A'}</div>
                                                                    </div>
                                                                    <div>
                                                                        <div className="text-slate-400 dark:text-gray-500">{t('pages.Inventory.grid.total')}</div>
                                                                        <div className="font-semibold text-slate-700 dark:text-gray-300">{stockState.totalStock.toLocaleString()}</div>
                                                                    </div>
                                                                    <div>
                                                                        <div className="text-slate-400 dark:text-gray-500">Đã phân bổ</div>
                                                                        <div className="font-semibold text-slate-700 dark:text-gray-300">{stockState.allocatedStock.toLocaleString()}</div>
                                                                    </div>
                                                                    <div className="col-span-2">
                                                                        <div className="text-slate-400 dark:text-gray-500" title="Chỉ cộng vào tồn khả dụng khi phiếu nhập hoàn tất">
                                                                            Đang về kho
                                                                        </div>
                                                                        <div className="font-semibold text-cyan-700 dark:text-[#38bcd4]">{stockState.incomingStock.toLocaleString()} {unitLabel}</div>
                                                                    </div>
                                                                </div>

                                                                <div className="flex items-center justify-between gap-2 text-[11px]">
                                                                    <span className="text-slate-500 dark:text-gray-400 font-medium uppercase tracking-wide" title={product.barcode || ''}>
                                                                        Barcode: {product.barcode || 'N/A'}
                                                                    </span>
                                                                    {product.status === 'ACTIVE' ? (
                                                                        <span className="shrink-0 font-bold text-green-700 dark:text-green-400">ACTIVE</span>
                                                                    ) : (
                                                                        <span className="shrink-0 font-bold text-slate-500 dark:text-gray-500">INACTIVE</span>
                                                                    )}
                                                                </div>

                                                                {product.supplierCodes ? (
                                                                    <div className="text-[11px] text-slate-500 dark:text-gray-400 truncate" title={product.supplierCodes}>
                                                                        NCC: {product.supplierCodes}
                                                                    </div>
                                                                ) : null}
                                                            </div>
                                                        </article>
                                                    );
                                                })}
                                            </div>
                                        </section>
                                    ))
                                ) : (
                                    <div className="p-8 text-gray-400 dark:text-gray-600 text-center italic font-medium">
                                        Không tìm thấy sản phẩm nào phù hợp với "{searchKeyword}".
                                    </div>
                                )}
                            </div>
                        )
                    )}
                </div>
            </div>

            {/* FAB toggle view mode */}
            <button
                type="button"
                onClick={() => setInventoryViewMode(prev => (prev === 'list' ? 'grid' : 'list'))}
                className="fixed right-6 bottom-6 z-[90] w-14 h-14 rounded-full bg-[#1192a8] text-white shadow-lg border border-white/20 dark:border-white/10 hover:bg-teal-700 transition flex items-center justify-center text-2xl font-bold"
                title={inventoryViewMode === 'list' ? t('pages.Inventory.viewMode.grid') : t('pages.Inventory.viewMode.list')}
                aria-label={inventoryViewMode === 'list' ? t('pages.Inventory.viewMode.grid') : t('pages.Inventory.viewMode.list')}
            >
                {inventoryViewMode === 'list' ? '▦' : '☰'}
            </button>

            {/* Hover image preview */}
            {hoverPreview?.product && (
                <div
                    className="pointer-events-none fixed z-[95] hidden xl:block"
                    style={{ left: `${hoverPreview.x}px`, top: `${hoverPreview.y}px` }}
                >
                    <div className="w-44 h-44 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 shadow-lg overflow-hidden rounded-xl">
                        {hoverPreview.product.imageUrl ? (
                            <img
                                src={hoverPreview.product.imageUrl}
                                alt={hoverPreview.product.name}
                                className="w-full h-full object-contain p-2"
                                onError={(e) => {
                                    e.target.src = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22200%22%20height%3D%22200%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20200%20200%22%3E%3Crect%20width%3D%22200%22%20height%3D%22200%22%20fill%3D%22%23eee%22%2F%3E%3Ctext%20x%3D%2250%25%22%20y%3D%2250%25%22%20font-size%3D%2218%22%20text-anchor%3D%22middle%22%20alignment-baseline%3D%22middle%22%20font-family%3D%22sans-serif%22%20fill%3D%22%23999%22%3ENo+Image%3C%2Ftext%3E%3C%2Fsvg%3E';
                                }}
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-50 dark:bg-gray-700 text-gray-400 dark:text-gray-500 text-xs font-medium text-center px-3">
                                {t('pages.Inventory.grid.noImage')}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Modals */}
            <ProductModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSuccess={fetchProducts}
            />

            <ProductModal
                isOpen={isEditModalOpen}
                onClose={() => { setIsEditModalOpen(false); setEditingProduct(null); }}
                onSuccess={fetchProducts}
                product={editingProduct}
                mode="edit"
            />

            <BulkEditModal
                isOpen={isBulkEditModalOpen}
                products={selectedProducts}
                onClose={() => setIsBulkEditModalOpen(false)}
                onEditOne={(product) => { setEditingProduct(product); setIsEditModalOpen(true); }}
            />

            <InventoryFilterModal
                isOpen={isFilterModalOpen}
                value={inventoryFilters}
                categories={categories}
                suppliers={suppliers}
                units={units}
                onClose={() => setIsFilterModalOpen(false)}
                onApply={(nextFilters) => { setInventoryFilters(nextFilters); setIsFilterModalOpen(false); }}
            />

            <ProductDetailModal
                product={selectedProduct}
                onClose={() => setSelectedProduct(null)}
            />

            <RowContextMenu
                isOpen={!!contextMenu}
                x={contextMenu?.x || 0}
                y={contextMenu?.y || 0}
                products={contextMenu?.products || []}
                onClose={closeContextMenu}
                onDetail={() => { closeContextMenu(); handleOpenDetail(contextMenu?.products || []); }}
                onEdit={() => { closeContextMenu(); handleOpenEdit(contextMenu?.products || []); }}
                onDelete={() => { closeContextMenu(); handleDeleteProduct(contextMenu?.products || []); }}
                onInbound={() => { closeContextMenu(); handleCreateReceiptFlow('inbound'); }}
                onOutbound={() => { closeContextMenu(); handleCreateReceiptFlow('outbound'); }}
                onCopy={() => { openCopyModal(contextMenu?.products || []); }}
                onRefresh={() => { closeContextMenu(); fetchProducts(); }}
                onSelectAll={() => {
                    closeContextMenu();
                    setSelectedProductIds(filteredProducts.map(item => item.id));
                    setSelectionAnchorIndex(filteredProducts.length ? 0 : null);
                }}
                onClearSelection={() => { closeContextMenu(); setSelectedProductIds([]); setSelectionAnchorIndex(null); }}
            />

            <CopyFieldsModal
                isOpen={isCopyModalOpen}
                products={copyTargetProducts}
                resolveCategoryLabel={resolveCategoryLabel}
                resolveUnitLabel={resolveUnitLabel}
                onClose={() => { setIsCopyModalOpen(false); setCopyTargetProducts([]); }}
                onCopy={handleCopyClipboard}
            />

            <ExportExcelModal
                isOpen={isExportModalOpen}
                fileName={exportFileName}
                onFileNameChange={setExportFileName}
                onExport={handleExportExcel}
                onClose={closeExportModal}
                saveMode={detectBestExportMode()}
            />

            <SystemDialog
                isOpen={!!systemDialog}
                variant={systemDialog?.variant || 'info'}
                title={systemDialog?.title || ''}
                message={systemDialog?.message || ''}
                onClose={() => setSystemDialog(null)}
                onConfirm={systemDialog?.onConfirm}
                confirmLabel={t('pages.Inventory.dialog.confirmLabel')}
            />

            <ScannerModal
                isOpen={isScannerOpen}
                onClose={() => setIsScannerOpen(false)}
                onScanSuccess={handleScanSuccess}
            />
        </div>
    );
}

function ActionButton({ iconSrc, label }) {
    return (
        <button className="flex flex-col items-center gap-1 group bg-transparent border-none cursor-pointer transition-transform active:scale-90">
            <div className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-xl group-hover:bg-gray-100 dark:group-hover:bg-gray-700 transition duration-200">
                <img src={iconSrc} alt={label} className="w-7 h-7 md:w-9 md:h-9 object-contain dark:invert dark:hue-rotate-180 dark:opacity-90" />
            </div>
            <span className="text-[8px] md:text-[10px] font-bold text-[#00529c] dark:text-[#1192a8] uppercase tracking-tighter group-hover:text-[#1192a8] dark:group-hover:text-[#38bcd4] transition text-center whitespace-nowrap">
                {label}
            </span>
        </button>
    );
}