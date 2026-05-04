import React, { useState, useEffect, useMemo } from 'react';
import Barcode from 'react-barcode';
import * as XLSX from 'xlsx';
import ProductModal from '../components/modals/ProductModal';
import ProductDetailModal from '../components/modals/ProductDetailModal';
import BulkEditModal from '../components/modals/BulkEditModal';
import InventoryFilterModal from '../components/modals/InventoryFilterModal';
import SystemDialog from '../components/modals/SystemDialog';
import RowContextMenu from '../components/modals/RowContextMenu';
import CopyFieldsModal from '../components/modals/CopyFieldsModal';
import ExportExcelModal from '../components/modals/ExportExcelModal';

// Import Icons
import addIcon from '../components/common/icons/add.png';
import fixIcon from '../components/common/icons/fix.png';
import deleteIcon from '../components/common/icons/delete.png';
import infoIcon from '../components/common/icons/info.png';
import excelIcon from '../components/common/icons/excel.png';
import inboundIcon from '../components/common/icons/inbound.png';
import outboundIcon from '../components/common/icons/outbound.png';

export default function Inventory({ onCreateInbound, onCreateOutbound }) {
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
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);
    const [exportFileName, setExportFileName] = useState(`inventory_${new Date().toISOString().slice(0, 10)}.xlsx`);
    const [exportSaveMode, setExportSaveMode] = useState('download');
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
        return map[value] || value;
    };

    const normalizeStorageTemp = (value) => {
        if (!value) return '';
        if (value.includes('Kho Mát')) return 'Kho Mát';
        if (value.includes('Kho Lạnh')) return 'Kho Lạnh';
        if (value.includes('Tránh ánh sáng')) return 'Tránh ánh sáng trực tiếp';
        return 'Bình thường';
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

    // Hàm gọi API lấy danh sách sản phẩm
    const fetchProducts = async () => {
        setIsLoading(true);
        try {
            const response = await fetch("http://localhost:8080/api/products/details");
            if (response.ok) {
                const data = await response.json();
                setProducts(data); // Đưa thẳng data thật vào state
            } else {
                throw new Error("Lỗi Server");
            }
        } catch (error) {
            console.warn("Không kết nối được Backend...", error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await fetch("http://localhost:8080/api/categories");
            if (response.ok) {
                setCategories(await response.json());
            }
        } catch (error) {
            console.warn("Không tải được danh mục...", error);
        }
    };

    const fetchSuppliers = async () => {
        try {
            const response = await fetch("http://localhost:8080/api/suppliers");
            if (response.ok) {
                setSuppliers(await response.json());
            }
        } catch (error) {
            console.warn("Không tải được nhà cung cấp...", error);
        }
    };

    const fetchUnits = async () => {
        try {
            const response = await fetch("http://localhost:8080/api/units");
            if (response.ok) {
                setUnits(await response.json());
            }
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
                        return item.name?.toLowerCase().includes(keyword);
                    case 'Theo SKU':
                        return item.sku?.toLowerCase().includes(keyword);
                    case 'Theo Mã vạch':
                        return item.barcode?.toLowerCase().includes(keyword);
                    case 'Theo phân loại': {
                        const category = categoryMap.get(String(item.categoryId));
                        return (
                            category?.name?.toLowerCase().includes(keyword) ||
                            category?.categoryCode?.toLowerCase().includes(keyword)
                        );
                    }
                    case 'Theo NCC':
                        return item.supplierCodes?.toLowerCase().includes(keyword);
                    default:
                        const category = categoryMap.get(String(item.categoryId));
                        return (
                            item.name?.toLowerCase().includes(keyword) ||
                            item.sku?.toLowerCase().includes(keyword) ||
                            item.barcode?.toLowerCase().includes(keyword) ||
                            item.supplierCodes?.toLowerCase().includes(keyword) ||
                            normalizeUnitName(item.baseUnit).toLowerCase().includes(keyword) ||
                            normalizeStorageTemp(item.storageTemp).toLowerCase().includes(keyword) ||
                            category?.name?.toLowerCase().includes(keyword) ||
                            category?.categoryCode?.toLowerCase().includes(keyword)
                        );
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
        const category = categoryMap.get(String(product?.categoryId));
        if (!category) {
            return { name: 'Chưa gán', code: '' };
        }

        return {
            name: category.name || 'Chưa gán',
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
                    name: category.name || 'Chưa gán',
                    code: category.categoryCode || ''
                }
                : { name: 'Chưa gán', code: '' };
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
    }, [filteredProducts, categoryMap]);

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
                className={`inline-flex items-center gap-1 w-full ${
                    alignClass === 'text-right'
                        ? 'justify-end'
                        : alignClass === 'text-center'
                            ? 'justify-center'
                            : 'justify-start'
                }`}
            >
                <span>{label}</span>
                <span className={`text-[10px] leading-none ${isActive ? 'text-[#1192a8]' : 'text-gray-400'}`}>{indicator}</span>
            </button>
        );
    };

    const activeProduct = selectedProducts[0] || null;

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

    const getContextTargetProducts = (product) => {
        if (selectedProductIds.includes(product.id) && selectedProducts.length > 0) {
            return selectedProducts;
        }
        if (selectedProducts.length > 0) {
            return selectedProducts;
        }
        return [product];
    };

    const handleRowClick = (product, index, event) => {
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
            showMessage("Không thể mở chi tiết", "Chi tiết chỉ khả dụng với 1 sản phẩm.");
            return;
        }
        setSelectedProduct(productsForAction[0]);
    };

    const handleOpenEdit = (productsForAction = selectedProducts) => {
        if (productsForAction.length === 0) {
            showMessage("Thiếu lựa chọn", "Vui lòng chọn ít nhất một sản phẩm trong bảng trước.");
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
            showMessage("Thiếu lựa chọn", "Vui lòng chọn ít nhất một sản phẩm trong bảng trước.");
            return;
        }

        const label = productsToDelete.length === 1
            ? `Xóa sản phẩm "${productsToDelete[0].name}" (${productsToDelete[0].sku})?`
            : `Xóa ${productsToDelete.length} sản phẩm đã chọn?`;

        showConfirm("Xác nhận xóa", label, async () => {
            try {
                for (const product of productsToDelete) {
                    const response = await fetch(`http://localhost:8080/api/products/${product.id}`, {
                        method: 'DELETE'
                    });

                    if (!response.ok) {
                        throw new Error(`Delete failed for ${product.id}`);
                    }
                }

                setSelectedProductIds([]);
                setSelectionAnchorIndex(null);
                setSelectedProduct(prev => (productsToDelete.some(item => item.id === prev?.id) ? null : prev));
                await fetchProducts();
                setSystemDialog(null);
            } catch (error) {
                console.warn("Không thể xóa sản phẩm", error);
                showMessage("Không thể xóa", "Không thể xóa sản phẩm này.");
            }
        });
    };

    const handleCopyClipboard = async (lines) => {
        const text = lines.join('\n');
        if (!text.trim()) {
            showMessage("Thiếu dữ liệu", "Vui lòng chọn ít nhất một trường để sao chép.");
            return;
        }

        try {
            await navigator.clipboard.writeText(text);
            setIsCopyModalOpen(false);
            setCopyTargetProducts([]);
            showMessage("Đã sao chép", "Dữ liệu đã được đưa vào clipboard.");
        } catch (error) {
            console.warn("Không thể sao chép vào clipboard", error);
            showMessage("Không thể sao chép", "Trình duyệt không cho phép ghi clipboard.");
        }
    };

    const normalizeExportFileName = (value) => {
        const trimmed = (value || '').trim();
        const safeName = trimmed.replace(/[<>:"/\\|?*\u0000-\u001F]/g, '_');
        const baseName = safeName || `inventory_${new Date().toISOString().slice(0, 10)}.xlsx`;
        return baseName.endsWith('.xlsx') ? baseName : `${baseName}.xlsx`;
    };

    const detectBestExportMode = () => {
        const canUseSavePicker = typeof window !== 'undefined'
            && window.isSecureContext
            && 'showSaveFilePicker' in window;
        return canUseSavePicker ? 'save-picker' : 'download';
    };

    const buildExcelWorkbook = (exportSource) => {
        const rows = exportSource.map((item, index) => {
            const stockState = getInventoryStockState(item);

            return {
                STT: index + 1,
                SKU: item.sku || '',
                'Tên sản phẩm': item.name || '',
                'Mã vạch': item.barcode || '',
                'Phân loại': resolveCategoryLabel(item),
                'Đơn vị tính': resolveUnitLabel(item),
                'Điều kiện lưu kho': normalizeStorageTemp(item.storageTemp),
                'Trạng thái': item.status === 'ACTIVE' ? 'Đang kinh doanh' : 'Ngừng kinh doanh',
                'Tổng tồn kho': stockState.totalStock,
                'Đã phân bổ': stockState.allocatedStock,
                'Tồn khả dụng': stockState.availableStock,
                'Đang về kho': stockState.incomingStock,
                'Tồn an toàn': item.safetyStock ?? '',
                'Cảnh báo tồn': stockState.isBelowSafety ? 'Dưới tồn an toàn' : '',
                'Nhà cung cấp': item.supplierCodes || '',
                'Trọng lượng (kg)': item.weight ?? '',
                'Dài (cm)': item.length ?? '',
                'Rộng (cm)': item.width ?? '',
                'Cao (cm)': item.height ?? '',
                'CBM': item.length && item.width && item.height
                    ? ((Number(item.length) * Number(item.width) * Number(item.height)) / 1000000).toFixed(6)
                    : ''
            };
        });

        const workbook = XLSX.utils.book_new();
        const dataSheet = XLSX.utils.json_to_sheet(rows);
        XLSX.utils.book_append_sheet(workbook, dataSheet, 'Danh sách tồn kho');

        const summaryRows = [
            { 'Chỉ tiêu': 'Tổng số sản phẩm', 'Giá trị': exportSource.length },
            { 'Chỉ tiêu': 'Đã chọn', 'Giá trị': selectedProducts.length },
            { 'Chỉ tiêu': 'Có barcode', 'Giá trị': exportSource.filter(item => !!item.barcode).length },
            { 'Chỉ tiêu': 'Không barcode', 'Giá trị': exportSource.filter(item => !item.barcode).length },
            { 'Chỉ tiêu': 'Tồn > 0', 'Giá trị': exportSource.filter(item => Number(item.totalStock || 0) > 0).length },
            { 'Chỉ tiêu': 'Tồn = 0', 'Giá trị': exportSource.filter(item => Number(item.totalStock || 0) === 0).length },
            { 'Chỉ tiêu': 'Dưới tồn an toàn', 'Giá trị': exportSource.filter(item => getInventoryStockState(item).isBelowSafety).length },
            { 'Chỉ tiêu': 'Tổng đang về kho', 'Giá trị': exportSource.reduce((sum, item) => sum + getInventoryStockState(item).incomingStock, 0) }
        ];
        const summarySheet = XLSX.utils.json_to_sheet(summaryRows);
        XLSX.utils.book_append_sheet(workbook, summarySheet, 'Tổng hợp');
        return workbook;
    };

    const handleExportExcel = async () => {
        const exportSource = selectedProducts.length > 0 ? selectedProducts : filteredProducts;

        if (!exportSource.length) {
            showMessage("Không có dữ liệu", "Không có sản phẩm nào để xuất Excel.");
            return;
        }

        const workbook = buildExcelWorkbook(exportSource);
        const normalizedFileName = normalizeExportFileName(exportFileName);
        const mode = detectBestExportMode();

        try {
            if (mode === 'save-picker') {
                const fileHandle = await window.showSaveFilePicker({
                    suggestedName: normalizedFileName,
                    types: [
                        {
                            description: 'Excel Workbook',
                            accept: {
                                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
                            }
                        }
                    ]
                });

                const writable = await fileHandle.createWritable();
                const workbookBuffer = XLSX.write(workbook, {
                    bookType: 'xlsx',
                    type: 'array'
                });

                await writable.write(new Blob([workbookBuffer], {
                    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                }));
                await writable.close();
            } else {
                XLSX.writeFile(workbook, normalizedFileName);
            }

            setIsExportModalOpen(false);
            setExportSaveMode(mode);
            showMessage("Đã xuất Excel", "File đã được lưu theo tên bạn chọn.");
        } catch (error) {
            if (error?.name === 'AbortError') {
                return;
            }

            console.warn("Không thể xuất Excel", error);
            showMessage("Không thể xuất Excel", "Trình duyệt không hỗ trợ luồng lưu này.");
        }
    };

    const openCopyModal = (productsForCopy) => {
        setCopyTargetProducts(productsForCopy);
        setIsCopyModalOpen(true);
        closeContextMenu();
    };

    const openExportModal = () => {
        setExportFileName(`inventory_${new Date().toISOString().slice(0, 10)}.xlsx`);
        setExportSaveMode(detectBestExportMode());
        setIsExportModalOpen(true);
    };

    const handleCreateReceiptFlow = (kind) => {
        if (!selectedProducts.length) {
            showMessage("Thiếu lựa chọn", "Vui lòng chọn ít nhất một sản phẩm trong bảng trước.");
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

    const handleExportFileNameChange = (nextValue) => {
        setExportFileName(nextValue);
    };

    return (
        <div className="p-6 h-full flex flex-col bg-gray-50">
            {/* Thanh công cụ (Action Buttons Bar) */}
            <div className="flex items-center justify-between bg-white p-4 mb-4 rounded-xl shadow-sm border border-gray-100">
                <div className="flex gap-6">
                    <div onClick={() => setIsAddModalOpen(true)}>
                        <ActionButton iconSrc={addIcon} label="THÊM MỚI" />
                    </div>
                    <div onClick={() => {
                        if (selectedProducts.length === 0) {
                            showMessage("Thiếu lựa chọn", "Vui lòng chọn một sản phẩm trong bảng trước.");
                            return;
                        }
                        if (selectedProducts.length === 1) {
                            handleOpenEdit(selectedProducts[0]);
                            return;
                        }
                        setIsBulkEditModalOpen(true);
                    }}>
                        <ActionButton iconSrc={fixIcon} label="SỬA" />
                    </div>
                    <div onClick={() => {
                        if (selectedProducts.length === 0) {
                            showMessage("Thiếu lựa chọn", "Vui lòng chọn ít nhất một sản phẩm trong bảng trước.");
                            return;
                        }
                        handleDeleteProduct(selectedProducts);
                    }}>
                        <ActionButton iconSrc={deleteIcon} label="XÓA" />
                    </div>
                    <div onClick={() => handleOpenDetail(selectedProducts)}>
                        <ActionButton iconSrc={infoIcon} label="CHI TIẾT" />
                    </div>
                    <div onClick={() => handleCreateReceiptFlow('inbound')}>
                        <ActionButton iconSrc={inboundIcon} label="NHẬP KHO" />
                    </div>
                    <div onClick={() => handleCreateReceiptFlow('outbound')}>
                        <ActionButton iconSrc={outboundIcon} label="XUẤT KHO" />
                    </div>
                    <div onClick={openExportModal}>
                        <ActionButton iconSrc={excelIcon} label="XUẤT EXCEL" />
                    </div>
                </div>
                <div className="text-xs text-gray-500 font-medium">
                    {selectedProducts.length > 0 ? `Đã chọn ${selectedProducts.length} sản phẩm` : 'Chưa chọn sản phẩm nào'}
                </div>

                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={() => setIsFilterModalOpen(true)}
                        className="bg-white border border-gray-300 text-gray-700 px-4 py-1.5 rounded text-sm font-medium hover:bg-gray-50 flex items-center gap-2 transition"
                    >
                        Bộ lọc
                    </button>
                    <select
                        value={searchType}
                        onChange={(e) => setSearchType(e.target.value)}
                        className="border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-blue-500 bg-white"
                    >
                        <option>Tất cả</option>
                        <option>Theo tên SP</option>
                        <option>Theo SKU</option>
                        <option>Theo Mã vạch</option>
                        <option>Theo phân loại</option>
                        <option>Theo NCC</option>
                    </select>
                    <input
                        type="text"
                        value={searchKeyword}
                        onChange={(e) => setSearchKeyword(e.target.value)}
                        className="border border-gray-300 rounded px-4 py-1.5 w-48 text-sm focus:outline-none focus:border-blue-500"
                        placeholder="Nhập từ khóa tìm kiếm..."
                    />
                    <button
                        onClick={fetchProducts}
                        className="bg-[#1192a8] text-white px-4 py-1.5 rounded text-sm font-medium hover:bg-teal-700 flex items-center gap-2 transition"
                    >
                        <span>↻</span> Làm mới
                    </button>
                </div>
            </div>

            {/* Khu vực Bảng dữ liệu (Table Area) */}
            <div className="bg-white flex-1 overflow-auto rounded-xl shadow-sm border border-gray-200">
                {isLoading ? (
                    <div className="flex justify-center items-center h-full text-gray-500 font-medium">
                        <span className="animate-pulse">Đang tải dữ liệu từ máy chủ...</span>
                    </div>
                ) : (
                    inventoryViewMode === 'list' ? (
                        <table className="w-full text-center text-sm">
                        <thead className="bg-gray-100 sticky top-0 shadow-sm z-10">
                        <tr className="text-gray-700 uppercase text-xs tracking-wider">
                            <th className="p-4 font-bold text-left">{renderSortableHeader('Mã SKU', 'SKU')}</th>
                            <th className="p-4 font-bold text-left">{renderSortableHeader('Tên sản phẩm', 'NAME')}</th>
                            <th className="p-4 font-bold text-right">{renderSortableHeader('Tồn khả dụng', 'AVAILABLE', 'text-right')}</th>
                            <th className="p-4 font-bold text-right">{renderSortableHeader('Tồn an toàn', 'SAFETY', 'text-right')}</th>
                            <th className="p-4 font-bold text-left">{renderSortableHeader('Đơn vị', 'UNIT', 'text-left')}</th>
                            <th className="p-4 font-bold">Mã vạch</th>
                            <th className="p-4 font-bold text-center">Trạng thái</th> {/* <-- CỘT MỚI THÊM --> */}
                        </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-200">
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
                                    <tr className="bg-slate-50">
                                                <td colSpan="7" className="px-4 py-2 text-left border-y border-slate-200">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm font-bold text-slate-800">
                                                            {categoryDisplay.name}
                                                        </span>
                                                {categoryDisplay.code ? (
                                                    <span className="text-[11px] font-semibold text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded">
                                                        {categoryDisplay.code}
                                                    </span>
                                                ) : null}
                                                <span className="text-[11px] text-slate-400">
                                                    {categoryProductCount} sản phẩm
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

                                        setHoverPreview({
                                            product: item,
                                            x: nextX,
                                            y: nextY
                                        });
                                    }}
                                    onMouseMove={(e) => {
                                        const rect = e.currentTarget.getBoundingClientRect();
                                        const previewWidth = 176;
                                        const previewHeight = 176;
                                        const nextX = Math.max(8, rect.left - previewWidth - 16);
                                        const centeredY = rect.top + (rect.height / 2) - (previewHeight / 2);
                                        const nextY = Math.max(8, Math.min(centeredY, window.innerHeight - previewHeight - 8));

                                        setHoverPreview(prev => ({
                                            product: item,
                                            x: nextX,
                                            y: nextY,
                                            prevId: prev?.product?.id
                                        }));
                                    }}
                                    onMouseLeave={() => setHoverPreview(prev => (prev?.product?.id === item.id ? null : prev))}
                                    onDoubleClick={() => {
                                        setSingleSelection(item, index);
                                        setSelectedProduct(item);
                                    }}
                                    className={`transition cursor-pointer text-gray-700 group ${
                                        selectedProductIds.includes(item.id) ? 'bg-blue-100' : 'hover:bg-blue-50'
                                    }`}
                                >
                                    <td
                                        className={`p-4 font-semibold text-left group-hover:underline ${
                                            stockState.isBelowSafety ? 'text-red-600' : 'text-blue-700'
                                        }`}
                                        title={stockState.isBelowSafety ? 'Tồn khả dụng thấp hơn tồn an toàn' : ''}
                                    >
                                        {item.sku}
                                    </td>
                                    <td className="p-4 font-medium text-gray-900 text-left">{item.name}</td>
                                    <td className={`p-4 font-bold text-right ${stockState.isBelowSafety ? 'text-red-600' : 'text-slate-800'}`}>
                                        {stockState.availableStock.toLocaleString()}
                                    </td>
                                    <td className="p-4 font-semibold text-right text-amber-700">
                                        {stockState.safetyStock ?? 'N/A'}
                                    </td>
                                    <td className="p-4 text-left">
                                        <span className="inline-flex items-center text-[11px] font-semibold text-slate-600 bg-slate-50 border border-slate-200 px-2 py-1 rounded">
                                            {resolveUnitLabel(item) || 'N/A'}
                                        </span>
                                    </td>
                                    <td className="p-4 text-gray-500 font-mono">
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
                                                    background="#ffffff"
                                                />
                                            </div>
                                        ) : (
                                            <span>N/A</span>
                                        )}
                                    </td>
                                    {/* <-- CỘT DỮ LIỆU MỚI THÊM --> */}
                                    <td className="p-4 text-center">
                                        {item.status === 'ACTIVE' ? (
                                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-green-700 bg-green-50 border border-green-200 px-2 py-1 rounded-full">
                                                <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> ACTIVE
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-gray-500 bg-gray-50 border border-gray-200 px-2 py-1 rounded-full">
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
                                <td colSpan="7" className="p-8 text-gray-500 text-center">
                                    Không tìm thấy sản phẩm nào phù hợp với "{searchKeyword}".
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
                                        <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                                            <span className="text-sm font-bold text-slate-800">{group.category.name}</span>
                                            {group.category.code ? (
                                                <span className="text-[11px] font-semibold text-slate-500 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded">
                                                    {group.category.code}
                                                </span>
                                            ) : null}
                                            <span className="text-[11px] text-slate-400">{group.products.length} sản phẩm</span>
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
                                                        className={`grid grid-cols-[96px_1fr] gap-3 p-3 border cursor-pointer transition ${
                                                            isSelected
                                                                ? 'border-blue-400 bg-blue-50'
                                                                : 'border-slate-200 bg-white hover:border-blue-200 hover:bg-blue-50/40'
                                                        }`}
                                                    >
                                                        <div className="w-24 h-24 bg-slate-50 border border-slate-200 overflow-hidden flex items-center justify-center">
                                                            {product.imageUrl ? (
                                                                <img
                                                                    src={product.imageUrl}
                                                                    alt={product.name}
                                                                    className="w-full h-full object-contain p-1.5"
                                                                    onError={(e) => {
                                                                        e.target.src = 'https://via.placeholder.com/160?text=No+Image';
                                                                    }}
                                                                />
                                                            ) : (
                                                                <span className="text-[10px] text-slate-400 font-medium text-center px-2">Chưa có ảnh</span>
                                                            )}
                                                        </div>

                                                        <div className="min-w-0 flex flex-col gap-2">
                                                            <div className="min-w-0">
                                                                <div
                                                                    className={`text-xs font-bold truncate ${
                                                                        stockState.isBelowSafety ? 'text-red-600' : 'text-blue-700'
                                                                    }`}
                                                                    title={stockState.isBelowSafety ? 'Tồn khả dụng thấp hơn tồn an toàn' : ''}
                                                                >
                                                                    {product.sku || 'Chưa có SKU'}
                                                                </div>
                                                                <div className="text-sm font-semibold text-slate-900 truncate" title={product.name}>
                                                                    {product.name}
                                                                </div>
                                                            </div>

                                                            <div className="grid grid-cols-2 gap-2 text-xs">
                                                                <div>
                                                                    <div className="text-slate-400">Khả dụng</div>
                                                                    <div className={`font-bold ${stockState.isBelowSafety ? 'text-red-600' : 'text-green-700'}`}>
                                                                        {stockState.availableStock.toLocaleString()} {unitLabel}
                                                                    </div>
                                                                </div>
                                                                <div>
                                                                    <div className="text-slate-400">Tồn an toàn</div>
                                                                    <div className="font-semibold text-amber-700">{stockState.safetyStock ?? 'N/A'}</div>
                                                                </div>
                                                                <div>
                                                                    <div className="text-slate-400">Tổng tồn</div>
                                                                    <div className="font-semibold text-slate-700">{stockState.totalStock.toLocaleString()}</div>
                                                                </div>
                                                                <div>
                                                                    <div className="text-slate-400">Đã phân bổ</div>
                                                                    <div className="font-semibold text-slate-700">{stockState.allocatedStock.toLocaleString()}</div>
                                                                </div>
                                                                <div className="col-span-2">
                                                                    <div
                                                                        className="text-slate-400"
                                                                        title="Chỉ cộng vào tồn khả dụng khi phiếu nhập hoàn tất"
                                                                    >
                                                                        Đang về kho
                                                                    </div>
                                                                    <div className="font-semibold text-cyan-700">{stockState.incomingStock.toLocaleString()} {unitLabel}</div>
                                                                </div>
                                                            </div>

                                                            <div className="flex items-center justify-between gap-2 text-[11px]">
                                                                <span className="text-slate-500 font-medium uppercase tracking-wide" title={product.barcode || ''}>
                                                                    Barcode: {product.barcode || 'N/A'}
                                                                </span>
                                                                {product.status === 'ACTIVE' ? (
                                                                    <span className="shrink-0 font-bold text-green-700">ACTIVE</span>
                                                                ) : (
                                                                    <span className="shrink-0 font-bold text-slate-500">INACTIVE</span>
                                                                )}
                                                            </div>

                                                            {product.supplierCodes ? (
                                                                <div className="text-[11px] text-slate-500 truncate" title={product.supplierCodes}>
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
                                <div className="p-8 text-gray-500 text-center">
                                    Không tìm thấy sản phẩm nào phù hợp với "{searchKeyword}".
                                </div>
                            )}
                        </div>
                    )
                )}
            </div>

            <button
                type="button"
                onClick={() => setInventoryViewMode(prev => (prev === 'list' ? 'grid' : 'list'))}
                className="fixed right-6 bottom-6 z-[90] w-14 h-14 rounded-full bg-[#1192a8] text-white shadow-lg border border-white/60 hover:bg-teal-700 transition flex items-center justify-center text-2xl font-bold"
                title={inventoryViewMode === 'list' ? 'Chuyển sang dạng ô' : 'Chuyển sang dạng list'}
                aria-label={inventoryViewMode === 'list' ? 'Chuyển sang dạng ô' : 'Chuyển sang dạng list'}
            >
                {inventoryViewMode === 'list' ? '▦' : '☰'}
            </button>

            {hoverPreview?.product && (
                <div
                    className="pointer-events-none fixed z-[95] hidden xl:block"
                    style={{
                        left: `${hoverPreview.x}px`,
                        top: `${hoverPreview.y}px`
                    }}
                >
                    <div className="w-44 h-44 bg-white border border-gray-200 shadow-lg overflow-hidden">
                        {hoverPreview.product.imageUrl ? (
                            <img
                                src={hoverPreview.product.imageUrl}
                                alt={hoverPreview.product.name}
                                className="w-full h-full object-contain p-2"
                                onError={(e) => {
                                    e.target.src = 'https://via.placeholder.com/240?text=No+Image';
                                }}
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-50 text-gray-400 text-xs font-medium text-center px-3">
                                Chưa có ảnh
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Nơi nhúng các Modal */}
            <ProductModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSuccess={fetchProducts}
            />

            <ProductModal
                isOpen={isEditModalOpen}
                onClose={() => {
                    setIsEditModalOpen(false);
                    setEditingProduct(null);
                }}
                onSuccess={fetchProducts}
                product={editingProduct}
                mode="edit"
            />

            <BulkEditModal
                isOpen={isBulkEditModalOpen}
                products={selectedProducts}
                onClose={() => setIsBulkEditModalOpen(false)}
                onEditOne={(product) => {
                    setEditingProduct(product);
                    setIsEditModalOpen(true);
                }}
            />

            <InventoryFilterModal
                isOpen={isFilterModalOpen}
                value={inventoryFilters}
                categories={categories}
                suppliers={suppliers}
                units={units}
                onClose={() => setIsFilterModalOpen(false)}
                onApply={(nextFilters) => {
                    setInventoryFilters(nextFilters);
                    setIsFilterModalOpen(false);
                }}
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
                    onDetail={() => {
                        closeContextMenu();
                        handleOpenDetail(contextMenu?.products || []);
                    }}
                    onEdit={() => {
                        closeContextMenu();
                        handleOpenEdit(contextMenu?.products || []);
                    }}
                    onDelete={() => {
                        closeContextMenu();
                        handleDeleteProduct(contextMenu?.products || []);
                    }}
                    onInbound={() => {
                        closeContextMenu();
                        handleCreateReceiptFlow('inbound');
                    }}
                    onOutbound={() => {
                        closeContextMenu();
                        handleCreateReceiptFlow('outbound');
                    }}
                    onCopy={() => {
                        openCopyModal(contextMenu?.products || []);
                    }}
                    onRefresh={() => {
                        closeContextMenu();
                        fetchProducts();
                }}
                onSelectAll={() => {
                    closeContextMenu();
                    setSelectedProductIds(filteredProducts.map(item => item.id));
                    setSelectionAnchorIndex(filteredProducts.length ? 0 : null);
                }}
                onClearSelection={() => {
                    closeContextMenu();
                    setSelectedProductIds([]);
                    setSelectionAnchorIndex(null);
                }}
            />

            <CopyFieldsModal
                isOpen={isCopyModalOpen}
                products={copyTargetProducts}
                resolveCategoryLabel={resolveCategoryLabel}
                resolveUnitLabel={resolveUnitLabel}
                onClose={() => {
                    setIsCopyModalOpen(false);
                    setCopyTargetProducts([]);
                }}
                onCopy={handleCopyClipboard}
            />

            <ExportExcelModal
                isOpen={isExportModalOpen}
                fileName={exportFileName}
                onFileNameChange={handleExportFileNameChange}
                onExport={handleExportExcel}
                onClose={() => setIsExportModalOpen(false)}
                saveMode={exportSaveMode}
            />

            <SystemDialog
                isOpen={!!systemDialog}
                variant={systemDialog?.variant || 'info'}
                title={systemDialog?.title || ''}
                message={systemDialog?.message || ''}
                onClose={() => setSystemDialog(null)}
                onConfirm={systemDialog?.onConfirm}
                confirmLabel="Xác nhận"
            />
        </div>
    );
}

// Nút Action Button dùng chung
function ActionButton({ iconSrc, label }) {
    return (
        <button className="flex flex-col items-center gap-1 group bg-transparent border-none cursor-pointer">
            <img
                src={iconSrc}
                alt={label}
                className="w-9 h-9 group-hover:scale-110 transition duration-200 drop-shadow-sm"
            />
            <span className="text-[10px] font-bold text-[#00529c] uppercase tracking-wide group-hover:text-blue-600 transition">
                {label}
            </span>
        </button>
    );
}
