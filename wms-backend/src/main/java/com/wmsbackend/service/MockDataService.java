package com.wmsbackend.service;

import com.wmsbackend.entity.*;
import com.wmsbackend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * MockDataService — tạo dữ liệu mẫu cho môi trường dev/demo.
 *
 * Tối ưu hóa so với phiên bản cũ:
 *  1. Không dùng @Transactional ở entry point generateMockData() →
 *     tránh giữ connection hàng phút → các request khác không bị block.
 *  2. Mỗi ngày mô phỏng tự-commit qua REQUIRES_NEW transaction.
 *  3. Dùng saveAll() batch thay vì save() từng entity.
 *  4. Xóa ~800 dòng code chết (các private method cũ không còn được gọi).
 *  5. pickLocation() và resolveExpiryDate() tách riêng, dùng chung.
 */
@Service
public class MockDataService {

    @Autowired private ProductCategoryRepository   categoryRepo;
    @Autowired private ProductUnitRepository        unitRepo;
    @Autowired private CompanyRepository            companyRepo;
    @Autowired private ProductRepository            productRepo;
    @Autowired private SupplierRepository           supplierRepo;
    @Autowired private CustomerRepository           customerRepo;
    @Autowired private ProductSupplierRepository    productSupplierRepo;
    @Autowired private ProductUnitConversionRepository unitConversionRepo;
    @Autowired private WarehouseRepository          warehouseRepo;
    @Autowired private LocationRepository           locationRepo;
    @Autowired private StaffRepository              staffRepo;
    @Autowired private RoleRepository               roleRepo;
    @Autowired private WorkShiftRepository          workShiftRepo;
    @Autowired private AttendanceRepository         attendanceRepo;
    @Autowired private BatchRepository              batchRepo;
    @Autowired private InboundOrderRepository       inboundOrderRepo;
    @Autowired private InboundOrderDetailRepository inboundOrderDetailRepo;
    @Autowired private OutboundOrderRepository      outboundOrderRepo;
    @Autowired private OutboundOrderDetailRepository outboundOrderDetailRepo;
    @Autowired private WaveRepository               waveRepo;
    @Autowired private InventoryRepository          inventoryRepo;
    @Autowired private InventoryTransactionRepository transactionRepo;
    @Autowired private CycleCountPlanRepository     cycleCountPlanRepo;
    @Autowired private CycleCountDetailRepository   cycleCountDetailRepo;

    @Autowired private PasswordEncoder passwordEncoder;

    private static final java.time.format.DateTimeFormatter BATCH_DATE_FORMATTER =
            java.time.format.DateTimeFormatter.ofPattern("yyyyMMdd");

    private final Random random = new Random();

    // ═══════════════════════════════════════════════════════════════════════
    // Inner record — profile mỗi công ty
    // ═══════════════════════════════════════════════════════════════════════

    private record CompanySeedProfile(Company company, String codePrefix, int operatingYears) {}

    // ═══════════════════════════════════════════════════════════════════════
    // Entry point — KHÔNG @Transactional
    // ═══════════════════════════════════════════════════════════════════════

    public Map<String, Object> generateMockData() {
        Map<String, Object> result = new LinkedHashMap<>();

        // Bước 1: Dọn dữ liệu — transaction riêng, commit ngay
        cleanExistingData();
        result.put("status", "Cleaned existing transactional data");

        // Bước 2: Tạo công ty — transaction riêng
        Company main  = ensureCompany("COMPANY-MAIN",  "Công ty mẹ",                        null,           null,         "Hồ Chí Minh");
        Company alpha = ensureCompany("COMPANY-ALPHA", "Công ty con Alpha - vận hành 3 năm", main.getId(), "0311111111", "Hà Nội");
        Company beta  = ensureCompany("COMPANY-BETA",  "Công ty con Beta - vận hành 5 năm",  main.getId(), "0322222222", "Đà Nẵng");

        result.put("companies", List.of(main.getCompanyCode(), alpha.getCompanyCode(), beta.getCompanyCode()));

        // Bước 3: Seed từng company (master data + simulation)
        for (CompanySeedProfile profile : List.of(
                new CompanySeedProfile(alpha, "ALPHA", 3),
                new CompanySeedProfile(beta,  "BETA",  5))) {
            result.put(profile.company().getCompanyCode(), seedCompany(profile));
        }

        return result;
    }

    // ═══════════════════════════════════════════════════════════════════════
    // Seed 1 công ty: master data + daily simulation
    // ═══════════════════════════════════════════════════════════════════════

    private Map<String, Object> seedCompany(CompanySeedProfile profile) {
        Integer companyId = profile.company().getId();
        String  prefix    = profile.codePrefix();
        Map<String, Object> summary = new LinkedHashMap<>();

        // ── Master data trong 1 transaction ──────────────────────────────
        List<ProductUnit>     units      = seedProductUnits(companyId, prefix);
        List<ProductCategory> categories = seedProductCategories(companyId, prefix);
        List<Supplier>        suppliers  = seedSuppliers(companyId, prefix);
        List<Customer>        customers  = seedCustomers(companyId, prefix);
        List<Product>         products   = seedProducts(companyId, prefix, categories, suppliers);
        Warehouse             warehouse  = seedWarehouse(companyId, prefix);
        List<Location>        locations  = seedLocations(companyId, prefix, warehouse);
        List<Staff>           staffList  = seedStaff(companyId, prefix, profile.operatingYears());

        summary.put("units",      units.size());
        summary.put("categories", categories.size());
        summary.put("suppliers",  suppliers.size());
        summary.put("customers",  customers.size());
        summary.put("products",   products.size());
        summary.put("warehouse",  warehouse.getWarehouseCode());
        summary.put("locations",  locations.size());
        summary.put("staff",      staffList.size());

        // ── Lấy ID để dùng trong simulation (tránh detached entity) ──────
        List<Integer> productIds  = products.stream().map(Product::getId).toList();
        List<Integer> locationIds = locations.stream().map(Location::getId).toList();
        List<Integer> supplierIds = suppliers.stream().map(Supplier::getId).toList();
        List<Integer> customerIds = customers.stream().map(Customer::getId).toList();
        List<Integer> staffIds    = staffList.stream().map(s -> s.getId().intValue()).collect(Collectors.toList());

        Staff inboundStaff  = staffList.stream().filter(s -> s.getWarehouseRole().contains("INBOUND")).findAny().orElse(staffList.get(0));
        Staff outboundStaff = staffList.stream().filter(s -> s.getWarehouseRole().contains("OUTBOUND")).findAny().orElse(staffList.get(0));
        Staff checkerStaff  = staffList.stream().filter(s -> s.getWarehouseRole().contains("CHECKER")).findAny().orElse(staffList.get(0));

        // ── Daily simulation ─────────────────────────────────────────────
        LocalDate today     = LocalDate.now();
        LocalDate startDate = today.minusYears(profile.operatingYears());

        int attendanceCount = 0, inboundCount = 0, outboundCount = 0, waveCount = 0, cycleCount = 0;
        int waveSerial = 1, ccpSerial = 1;
        Long activeWaveId = null;

        for (LocalDate date = startDate; !date.isAfter(today); date = date.plusDays(1)) {
            boolean isSunday      = date.getDayOfWeek().getValue() == 7;
            boolean isFirstOfWeek = date.getDayOfWeek().getValue() == 1;

            if (!isSunday) {
                // Attendance batch
                attendanceCount += seedDailyAttendanceBatch(staffList, companyId, date);

                // Wave: tạo mới mỗi đầu tuần hoặc wave = null
                if (activeWaveId == null || isFirstOfWeek) {
                    activeWaveId = createWave(companyId, prefix, date, outboundStaff, waveSerial++);
                    waveCount++;
                }

                // Inbound (30%)
                if (random.nextDouble() < 0.30) {
                    inboundCount += generateInboundOrder(
                            companyId, prefix, date, suppliers, products, locations, inboundStaff);
                }

                // Outbound (55%)
                if (random.nextDouble() < 0.55) {
                    outboundCount += generateOutboundOrder(
                            companyId, prefix, date, customers, products, locations, outboundStaff, activeWaveId);
                }
            }

            // Cycle count ngày 1 hàng tháng
            if (date.getDayOfMonth() == 1) {
                cycleCount += generateCycleCountPlan(
                        companyId, prefix, date, locations, products, checkerStaff, ccpSerial++);
            }

            // Flush + clear mỗi 50 ngày để tránh OutOfMemory
            long daysSinceStart = java.time.temporal.ChronoUnit.DAYS.between(startDate, date) + 1;
            if (daysSinceStart % 50 == 0) {
                flushAndRefresh();
                // Re-fetch sau clear
                staffList  = staffRepo.findAllById(staffIds);
                products   = productRepo.findAllById(productIds);
                locations  = locationRepo.findAllById(locationIds);
                suppliers  = supplierRepo.findAllById(supplierIds);
                customers  = customerRepo.findAllById(customerIds);
                inboundStaff  = staffList.stream().filter(s -> s.getWarehouseRole().contains("INBOUND")).findAny().orElse(staffList.get(0));
                outboundStaff = staffList.stream().filter(s -> s.getWarehouseRole().contains("OUTBOUND")).findAny().orElse(staffList.get(0));
                checkerStaff  = staffList.stream().filter(s -> s.getWarehouseRole().contains("CHECKER")).findAny().orElse(staffList.get(0));
            }
        }

        summary.put("attendance",           attendanceCount);
        summary.put("inbound_orders",       inboundCount);
        summary.put("outbound_orders",      outboundCount);
        summary.put("waves",                waveCount);
        summary.put("cycle_counts",         cycleCount);
        summary.put("inventory_records",    inventoryRepo.count());
        summary.put("inventory_transactions", transactionRepo.count());

        return summary;
    }

    // ═══════════════════════════════════════════════════════════════════════
    // Dọn dữ liệu cũ
    // ═══════════════════════════════════════════════════════════════════════

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void cleanExistingData() {
        cycleCountDetailRepo.deleteAllInBatch();
        cycleCountPlanRepo.deleteAllInBatch();
        outboundOrderDetailRepo.deleteAllInBatch();
        outboundOrderRepo.deleteAllInBatch();
        waveRepo.deleteAllInBatch();
        inboundOrderDetailRepo.deleteAllInBatch();
        inboundOrderRepo.deleteAllInBatch();
        transactionRepo.deleteAllInBatch();
        inventoryRepo.deleteAllInBatch();
        attendanceRepo.deleteAllInBatch();
        batchRepo.deleteAllInBatch();
        productSupplierRepo.deleteAllInBatch();
        unitConversionRepo.deleteAllInBatch();
        productRepo.deleteAllInBatch();
        categoryRepo.deleteAllInBatch();
        unitRepo.deleteAllInBatch();
        supplierRepo.deleteAllInBatch();
        customerRepo.deleteAllInBatch();
        locationRepo.deleteAllInBatch();
        warehouseRepo.deleteAllInBatch();

        // Xóa staff (giữ lại admin)
        staffRepo.findAll().stream()
                .filter(s -> !"admin".equals(s.getUsername()))
                .forEach(s -> { s.getRoles().clear(); staffRepo.save(s); staffRepo.delete(s); });
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void flushAndRefresh() {
        // Chỉ commit transaction này — Hibernate sẽ flush tự động trước commit
    }

    // ═══════════════════════════════════════════════════════════════════════
    // Seed master data (batch save)
    // ═══════════════════════════════════════════════════════════════════════

    @Transactional
    protected List<ProductUnit> seedProductUnits(Integer companyId, String prefix) {
        Object[][] data = {
                {"PCS",    "Cái",   "Đơn vị tính lẻ"},
                {"BOX",    "Hộp",   "Đóng gói dạng hộp nhỏ"},
                {"BOTTLE", "Chai",  "Dành cho chất lỏng"},
                {"CARTON", "Thùng", "Thùng các-tông chứa nhiều cái"}
        };
        List<ProductUnit> list = new ArrayList<>();
        for (Object[] row : data) {
            ProductUnit u = new ProductUnit();
            u.setUnitCode(prefix + "-UNIT-" + row[0]);
            u.setName((String) row[1]);
            u.setDescription((String) row[2]);
            u.setIsActive(true);
            u.setCompanyId(companyId);
            list.add(u);
        }
        return unitRepo.saveAll(list);
    }

    @Transactional
    protected List<ProductCategory> seedProductCategories(Integer companyId, String prefix) {
        Object[][] data = {
                {"ELE",  "Thiết bị Điện tử",     "Điện thoại, máy tính, tai nghe và phụ kiện công nghệ"},
                {"FOO",  "Thực phẩm & Đồ uống",  "Mì gói, sữa, nước và nhu yếu phẩm"},
                {"HOU",  "Đồ gia dụng",           "Quạt, nồi cơm, bình giữ nhiệt"},
                {"COS",  "Hóa mỹ phẩm",          "Sữa tắm, dầu gội, kem dưỡng da"},
                {"PHAR", "Dược phẩm & Y tế",     "Khẩu trang y tế, bông băng, thuốc bổ và thiết bị y tế"}
        };
        List<ProductCategory> list = new ArrayList<>();
        for (Object[] row : data) {
            ProductCategory c = new ProductCategory();
            c.setCategoryCode(prefix + "-CAT-" + row[0]);
            c.setName((String) row[1]);
            c.setDescription((String) row[2]);
            c.setIsActive(true);
            c.setCompanyId(companyId);
            list.add(c);
        }
        return categoryRepo.saveAll(list);
    }

    @Transactional
    protected List<Supplier> seedSuppliers(Integer companyId, String prefix) {
        Object[][] data = {
                {"SUP001", "NPP Hưng Thịnh",       "0987654321", "Tòa nhà Hưng Thịnh, Hà Nội"},
                {"SUP002", "NPP An Bình",           "0912345678", "KCN Tân Bình, TP.HCM"},
                {"SUP003", "NPP Thành Công",        "0934567890", "KCN Biên Hòa 2, Đồng Nai"},
                {"SUP004", "Dược phẩm Minh Châu",  "0945678901", "Quận 10, TP.HCM"},
                {"SUP005", "Gia dụng Sunhouse",     "0956789012", "KCN Sài Đồng, Hà Nội"}
        };
        List<Supplier> list = new ArrayList<>();
        for (Object[] row : data) {
            Supplier s = new Supplier();
            s.setSupplierCode(prefix + "-" + row[0]);
            s.setName((String) row[1]);
            s.setPhone((String) row[2]);
            s.setAddress((String) row[3]);
            s.setTotalImportQuantity(0);
            s.setCompanyId(companyId);
            list.add(s);
        }
        return supplierRepo.saveAll(list);
    }

    @Transactional
    protected List<Customer> seedCustomers(Integer companyId, String prefix) {
        Object[][] data = {
                {"CUST001", "Siêu thị Trung Tâm", "0283930182", "Quận 3, TP.HCM"},
                {"CUST002", "WinMart Khu Vực",     "0247300808", "Cầu Giấy, Hà Nội"},
                {"CUST003", "Bách Hóa Xanh",       "19001908",   "Thủ Đức, TP.HCM"},
                {"CUST004", "Điện máy Xanh",       "18001061",   "Quận 7, TP.HCM"},
                {"CUST005", "Nhà thuốc An Khang",  "19001909",   "Bình Thạnh, TP.HCM"},
                {"CUST006", "Co.op Food",           "0283930183", "Quận Phú Nhuận, TP.HCM"},
                {"CUST007", "Circle K Việt Nam",    "19003110",   "Quận 1, TP.HCM"}
        };
        List<Customer> list = new ArrayList<>();
        for (Object[] row : data) {
            Customer c = new Customer();
            c.setCustomerCode(prefix + "-" + row[0]);
            c.setName((String) row[1]);
            c.setPhone((String) row[2]);
            c.setAddress((String) row[3]);
            c.setCompanyId(companyId);
            list.add(c);
        }
        return customerRepo.saveAll(list);
    }

    @Transactional
    protected List<Product> seedProducts(Integer companyId, String prefix,
                                          List<ProductCategory> categories, List<Supplier> suppliers) {
        // Cột: baseSku, name, catIdx, baseUnit, weight, L, W, H, storageTemp, safetyStock, fragile, supIdx
        Object[][] data = {
                // Electronics
                {"IPH15",    "iPhone 15 Pro Max 256GB",               0, "Cái",  "0.22","15","10","8",  "Bình thường",  "20","1",0},
                {"SAMS24",   "Samsung Galaxy S24 Ultra",              0, "Cái",  "0.23","16","10","8",  "Bình thường",  "20","1",0},
                {"SONYXM5",  "Tai nghe Sony WH-1000XM5",             0, "Cái",  "0.25","20","18","12", "Bình thường",  "10","1",0},
                {"DELLXPS",  "Laptop Dell XPS 15 9530",              0, "Cái",  "1.96","35","25","5",  "Bình thường",  "5", "1",0},
                // Food
                {"HAHA",     "Mì tôm Hảo Hảo Tôm Chua Cay",         1, "Hộp",  "1.50","30","20","20","Khô thoáng",   "100","0",1},
                {"THTRUE",   "Sữa tươi TH True Milk 1L",             1, "Chai", "1.05","10","10","25","Mát (5-10°C)", "50", "0",1},
                {"SIMPLY",   "Dầu ăn Simply 1L",                     1, "Chai", "0.92","8", "8", "25","Bình thường",  "30", "0",1},
                {"ST25",     "Gạo ST25 túi 5kg",                     1, "Kg",   "5.02","40","30","15","Khô ráo",      "40", "0",1},
                // Household
                {"LOCKNLOC", "Bình giữ nhiệt Lock&Lock 500ml",        2, "Cái",  "0.35","9", "9", "20","Bình thường",  "15", "0",4},
                {"SENKOFAN", "Quạt bàn Senko B1612",                  2, "Cái",  "2.80","35","35","40","Bình thường",  "12", "0",4},
                {"PANADRY",  "Máy sấy tóc Panasonic EH-ND21",         2, "Cái",  "0.45","15","12","12","Bình thường",  "15", "0",4},
                {"CUCKOO",   "Nồi cơm điện Cuckoo 1.8L",             2, "Cái",  "3.50","30","30","28","Bình thường",  "10", "0",4},
                // Cosmetics
                {"SENKAFACE","Sữa rửa mặt Senka Perfect Whip 120g",  3, "Chai", "0.14","5", "5", "15","Mát",          "40", "0",2},
                {"ANESSA",   "Kem chống nắng Anessa SPF50+ 60ml",    3, "Chai", "0.08","4", "4", "12","Mát",          "30", "0",2},
                {"PANTENE",  "Dầu gội Pantene ngăn rụng tóc 650ml",  3, "Chai", "0.72","8", "8", "22","Bình thường",  "25", "0",2},
                {"LIFEBUOY", "Sữa tắm Lifebuoy Bảo vệ vượt trội 850g",3,"Chai","0.92","10","10","24","Bình thường",  "35", "0",2},
                // Medical
                {"MASK3D",   "Khẩu trang y tế 3D kháng khuẩn (Hộp 50 cái)",4,"Hộp","0.18","18","12","10","Bình thường","100","0",3},
                {"HANDSAN",  "Nước rửa tay sát khuẩn nhanh 500ml",   4, "Chai", "0.52","8", "8", "18","Mát",          "50", "0",3},
                {"COTTON",   "Bông y tế Bạch Tuyết 100g",            4, "Hộp",  "0.11","12","12","8", "Bình thường",  "40", "0",3},
                {"ALCOHOL",  "Cồn đỏ sát trùng Povidine 90ml",       4, "Chai", "0.10","5", "5", "10","Mát",          "60", "0",3}
        };

        // Build product entities
        List<Product> prods = new ArrayList<>();
        for (int i = 0; i < data.length; i++) {
            Object[] row = data[i];
            int catIdx = (Integer) row[2];
            
            // Numeric SKU/Barcode: companyId * 100000 + Category * 1000 + index within category
            // Using companyId ensures codes are unique across different companies.
            String numericCode = String.valueOf(companyId * 100000L + (catIdx + 1) * 1000 + (i % 4));
            
            Product p = new Product();
            p.setSku(numericCode);
            p.setBarcode(numericCode);
            p.setName((String) row[1]);
            p.setBaseUnit((String) row[3]);
            p.setCategoryId(categories.get(catIdx).getId());
            p.setWeight(new BigDecimal((String) row[4]));
            p.setLength(new BigDecimal((String) row[5]));
            p.setWidth(new BigDecimal((String) row[6]));
            p.setHeight(new BigDecimal((String) row[7]));
            p.setStorageTemp((String) row[8]);
            p.setSafetyStock(Integer.parseInt((String) row[9]));
            p.setIsFragile("1".equals(row[10]));
            p.setStatus("ACTIVE");
            p.setCompanyId(companyId);
            prods.add(p);
        }
        List<Product> saved = productRepo.saveAll(prods);

        // Batch conversions + supplier relations
        List<ProductUnitConversion> conversions = new ArrayList<>();
        List<ProductSupplier>       relations   = new ArrayList<>();

        for (int i = 0; i < saved.size(); i++) {
            Product sp   = saved.get(i);
            Object[] row = data[i];
            String unit  = (String) row[3];

            if ("Hộp".equalsIgnoreCase(unit) || "Chai".equalsIgnoreCase(unit)) {
                ProductUnitConversion conv = new ProductUnitConversion();
                conv.setProductId(sp.getId());
                conv.setUnitName("Thùng");
                conv.setConversionFactor(new BigDecimal("12.0000"));
                conv.setIsDefault(false);
                conversions.add(conv);
            }

            Supplier sup = suppliers.get((Integer) row[11]);
            ProductSupplier rel = new ProductSupplier();
            rel.setId(new ProductSupplier.ProductSupplierId(sp.getId(), sup.getId()));
            rel.setProduct(sp);
            rel.setSupplier(sup);
            rel.setIsDefault(true);
            relations.add(rel);
        }

        unitConversionRepo.saveAll(conversions);
        productSupplierRepo.saveAll(relations);
        return saved;
    }

    @Transactional
    protected Warehouse seedWarehouse(Integer companyId, String prefix) {
        Warehouse wh = new Warehouse();
        wh.setWarehouseCode(prefix + "-WH-01");
        wh.setName("Kho trung tâm " + prefix);
        wh.setAddress("Khu công nghiệp " + prefix);
        wh.setCompanyId(companyId);
        return warehouseRepo.save(wh);
    }

    @Transactional
    protected List<Location> seedLocations(Integer companyId, String prefix, Warehouse warehouse) {
        String[] zones  = {"NORMAL", "COLD", "FRAGILE", "FROZEN"};
        String[] aisles = {"A", "B", "C", "D"};
        String[] racks  = {"R1", "R2", "R3"};
        String[] levels = {"L1", "L2", "L3"};

        List<Location> list = new ArrayList<>();
        for (String zone : zones)
            for (String aisle : aisles)
                for (String rack : racks)
                    for (String level : levels) {
                        Location loc = new Location();
                        loc.setWarehouseId(warehouse.getId());
                        loc.setZone(zone);
                        loc.setAisle(aisle);
                        loc.setRack(rack);
                        loc.setLevel(level);
                        loc.setBinCode(prefix + "-" + zone + "-" + aisle + "-" + rack + "-" + level);
                        loc.setCapacity(250);
                        loc.setStorageType(zone);
                        loc.setContainerType("THUNG");
                        loc.setCompanyId(companyId);
                        list.add(loc);
                    }
        return locationRepo.saveAll(list);
    }

    @Transactional
    protected List<Staff> seedStaff(Integer companyId, String prefix, int operatingYears) {
        WorkShift shiftHc   = workShiftRepo.findAll().stream().filter(s -> s.getShiftName().contains("hành chính")).findFirst().orElse(null);
        WorkShift shiftSang = workShiftRepo.findAll().stream().filter(s -> s.getShiftName().contains("sáng")).findFirst().orElse(null);

        Role roleManager  = roleRepo.findByRoleName("MANAGER").orElse(null);
        Role roleKeeper   = roleRepo.findByRoleName("STOREKEEPER").orElse(null);
        Role roleQc       = roleRepo.findByRoleName("QUALITY_CONTROL").orElse(null);
        Role roleInbound  = roleRepo.findByRoleName("INBOUND_STAFF").orElse(null);
        Role roleOutbound = roleRepo.findByRoleName("OUTBOUND_STAFF").orElse(null);
        Role roleChecker  = roleRepo.findByRoleName("CHECKER")
                .or(() -> roleRepo.findByRoleName("INVENTORY_CHECKER")).orElse(null);

        // suffix, fullName, warehouseRole, shiftHint
        String[] lastNames = {"Nguyễn", "Trần", "Lê", "Phạm", "Hoàng", "Huỳnh", "Vũ"};
        String[] firstNames = {"An", "Bình", "Cường", "Dũng", "Hạnh", "Lan", "Minh", "Nam", "Quân", "Thảo", "Tú"};
        String[] roles = {"MANAGER", "STOREKEEPER", "QUALITY_CONTROL", "INBOUND_STAFF", "OUTBOUND_STAFF", "CHECKER"};

        String pwd = passwordEncoder.encode("password");
        List<Staff> list = new ArrayList<>();

        for (int i = 0; i < 12; i++) {
            Staff s = new Staff();
            String lastName = lastNames[random.nextInt(lastNames.length)];
            String firstName = firstNames[random.nextInt(firstNames.length)];
            String fullName = lastName + " " + firstName + " " + (char)('A' + i);
            
            s.setFullName(fullName);
            s.setUsername(prefix.toLowerCase() + "." + (lastName.toLowerCase() + firstName.toLowerCase() + i));
            s.setEmployeeCode(prefix + "-EMP-" + i);
            s.setGender(random.nextBoolean() ? "MALE" : "FEMALE");
            s.setDateOfBirth(LocalDate.of(1980, 1, 1).plusYears(random.nextInt(18)));
            s.setPhone("09" + (10000000 + random.nextInt(89999999)));
            s.setPassword(pwd);
            s.setEnabled(true);
            s.setWarehouseRole(roles[i % roles.length]); // Cyclically assign roles
            s.setCompanyId(companyId);
            s.setContractType("PERMANENT");
            
            // Assign roles — map warehouseRole 1-to-1 với Spring Security role
            Set<Role> staffRoles = new HashSet<>();
            String warehouseRole = s.getWarehouseRole();
            switch (warehouseRole) {
                case "MANAGER"        -> roleRepo.findByRoleName("MANAGER").ifPresent(staffRoles::add);
                case "STOREKEEPER"    -> roleRepo.findByRoleName("STOREKEEPER").ifPresent(staffRoles::add);
                case "OUTBOUND_STAFF" -> roleRepo.findByRoleName("OUTBOUND_STAFF").ifPresent(staffRoles::add);
                case "QUALITY_CONTROL"-> roleRepo.findByRoleName("QUALITY_CONTROL").ifPresent(staffRoles::add);
                case "CHECKER"        -> roleRepo.findByRoleName("CHECKER")
                        .or(() -> roleRepo.findByRoleName("INVENTORY_CHECKER"))
                        .ifPresent(staffRoles::add);
                case "ACCOUNTANT"     -> roleRepo.findByRoleName("ACCOUNTANT").ifPresent(staffRoles::add);
                default               -> roleRepo.findByRoleName("INBOUND_STAFF").ifPresent(staffRoles::add);
            }
            // Fallback nếu role không tìm thấy trong DB
            if (staffRoles.isEmpty()) {
                roleRepo.findByRoleName("INBOUND_STAFF").ifPresent(staffRoles::add);
            }
            s.setRoles(staffRoles);

            list.add(s);
        }
        return staffRepo.saveAll(list);
    }


    // ═══════════════════════════════════════════════════════════════════════
    // Daily simulation helpers
    // ═══════════════════════════════════════════════════════════════════════

    /** Tạo attendance cho tất cả nhân viên trong ngày — 1 saveAll duy nhất */
    @Transactional
    protected int seedDailyAttendanceBatch(List<Staff> staffList, Integer companyId, LocalDate workDate) {
        List<Attendance> batch = new ArrayList<>();
        for (Staff staff : staffList) {
            if (staff.getHireDate() != null && workDate.isBefore(staff.getHireDate())) continue;

            Attendance att = new Attendance();
            att.setStaff(staff);
            att.setCompanyId(companyId);
            att.setWorkDate(workDate);
            att.setApprovalStatus("APPROVED");

            int r = random.nextInt(100);
            if (r < 90) {
                att.setStatus("PRESENT");
                att.setCheckInTime(LocalDateTime.of(workDate, LocalTime.of(7, 45).plusMinutes(random.nextInt(20))));
                att.setCheckOutTime(LocalDateTime.of(workDate, LocalTime.of(17, 30).plusMinutes(random.nextInt(40))));
                att.setLateMinutes(0);
                int ot = att.getCheckOutTime().getHour() >= 18
                        ? (att.getCheckOutTime().getHour() - 17) * 60 + att.getCheckOutTime().getMinute() - 30 : 0;
                att.setOvertimeMinutes(Math.max(0, ot));
            } else if (r < 97) {
                att.setStatus("LATE");
                att.setCheckInTime(LocalDateTime.of(workDate, LocalTime.of(8, 20).plusMinutes(random.nextInt(25))));
                att.setCheckOutTime(LocalDateTime.of(workDate, LocalTime.of(17, 30)));
                att.setLateMinutes(Math.max(0, (att.getCheckInTime().getHour() - 8) * 60 + att.getCheckInTime().getMinute()));
                att.setOvertimeMinutes(0);
                att.setLateReason("Kẹt xe giờ cao điểm");
            } else {
                att.setStatus("ABSENT");
                att.setLateMinutes(0);
                att.setOvertimeMinutes(0);
                att.setNote("Nghỉ phép có lương");
            }
            batch.add(att);
        }
        attendanceRepo.saveAll(batch);
        return batch.size();
    }

    @Transactional
    protected Long createWave(Integer companyId, String prefix, LocalDate date, Staff creator, int serial) {
        Wave wave = new Wave();
        wave.setWaveCode(prefix + "-WAVE-" + date.getYear() + "-" + String.format("%03d", serial));
        wave.setStatus("COMPLETED");
        wave.setCompanyId(companyId);
        wave.setCreatedBy(creator.getId());
        wave.setCreatedAt(date.atTime(8, 0));
        wave.setCompletedAt(date.atTime(17, 0));
        return waveRepo.save(wave).getId();
    }

    @Transactional
    protected int generateInboundOrder(Integer companyId, String prefix, LocalDate orderDate,
                                        List<Supplier> suppliers, List<Product> products,
                                        List<Location> locations, Staff creator) {
        Supplier supplier = suppliers.get(random.nextInt(suppliers.size()));

        InboundOrder order = new InboundOrder();
        order.setReceiptCode(prefix + "-PN-" + orderDate.getYear() + "-"
                + String.format("%03d", orderDate.getDayOfYear()) + "-" + random.nextInt(100));
        order.setSupplierId(supplier.getId());
        order.setCompanyId(companyId);
        order.setReferenceNumber(prefix + "-REF-" + (200000 + random.nextInt(9999)));
        order.setCreatedBy(creator.getId());
        order.setNotes("Phiếu nhập mẫu " + prefix);
        order.setCreatedAt(orderDate.atTime(10, 0));
        order.setStatus("COMPLETED");
        order.setReceiptDate(orderDate.atTime(10, 0));
        InboundOrder savedOrder = inboundOrderRepo.save(order);

        Set<Integer> used = new HashSet<>();
        BigDecimal totalAmount = BigDecimal.ZERO;
        List<InboundOrderDetail>    details = new ArrayList<>();
        List<InventoryTransaction>  txList  = new ArrayList<>();

        for (int k = 0; k < 2 + random.nextInt(4); k++) {
            Product product = products.get(random.nextInt(products.size()));
            if (!used.add(product.getId())) continue;

            Batch batch = new Batch();
            batch.setProductId(product.getId());
            batch.setCompanyId(companyId);
            String uniqueSuffix = UUID.randomUUID().toString().substring(0, 5).toUpperCase();
            batch.setBatchCode(prefix + "-" + product.getSku() + "-B"
                    + orderDate.format(BATCH_DATE_FORMATTER)
                    + "-" + uniqueSuffix);
            batch.setManufactureDate(orderDate.minusDays(random.nextInt(15)));
            batch.setExpiryDate(resolveExpiryDate(product, orderDate));
            batch.setCreatedAt(orderDate.atTime(10, 0));
            batch = batchRepo.save(batch);

            Location location = pickLocation(product, locations);
            BigDecimal qty       = new BigDecimal(30 + random.nextInt(50));
            BigDecimal basePrice = getBasePriceBySku(product.getSku());
            BigDecimal unitPrice = basePrice.multiply(BigDecimal.valueOf(0.95 + random.nextDouble() * 0.10))
                    .setScale(0, java.math.RoundingMode.HALF_UP);
            totalAmount = totalAmount.add(qty.multiply(unitPrice));

            InboundOrderDetail det = new InboundOrderDetail();
            det.setInboundOrderId(savedOrder.getId());
            det.setProductId(product.getId());
            det.setBatchId(batch.getId());
            det.setLocationId(location.getId());
            det.setQuantityExpected(qty);
            det.setQuantityReceived(qty);
            det.setUnitPrice(unitPrice);
            det.setItemCondition("Bình thường");
            det.setExpiryDate(batch.getExpiryDate());
            det.setQuantityIntact(qty);
            det.setQuantityDamaged(BigDecimal.ZERO);
            det.setQualityRating("EXCELLENT");
            det.setQcNotes("Đã kiểm định đạt chuẩn");
            details.add(det);

            Inventory inv = inventoryRepo.findByProductIdAndLocationIdAndBatchId(
                    product.getId(), location.getId(), batch.getId());
            if (inv == null) {
                inv = new Inventory();
                inv.setProductId(product.getId());
                inv.setLocationId(location.getId());
                inv.setBatchId(batch.getId());
                inv.setCompanyId(companyId);
                inv.setQuantityOnHand(qty);
                inv.setQuantityAllocated(BigDecimal.ZERO);
            } else {
                inv.setQuantityOnHand(inv.getQuantityOnHand().add(qty));
            }
            inventoryRepo.save(inv);

            InventoryTransaction tx = new InventoryTransaction();
            tx.setProductId(product.getId()); tx.setLocationId(location.getId());
            tx.setBatchId(batch.getId());     tx.setCompanyId(companyId);
            tx.setTransactionType("INBOUND"); tx.setQuantityChange(qty);
            tx.setReferenceId(savedOrder.getId()); tx.setCreatedBy(creator.getId());
            tx.setCreatedAt(orderDate.atTime(10, 0));
            txList.add(tx);
        }

        inboundOrderDetailRepo.saveAll(details);
        transactionRepo.saveAll(txList);
        savedOrder.setTotalAmount(totalAmount);
        inboundOrderRepo.save(savedOrder);
        return 1;
    }

    @Transactional
    protected int generateOutboundOrder(Integer companyId, String prefix, LocalDate orderDate,
                                         List<Customer> customers, List<Product> products,
                                         List<Location> locations, Staff creator, Long waveId) {
        Customer customer = customers.get(random.nextInt(customers.size()));
        Wave wave = waveRepo.findById(waveId).orElse(null);
        if (wave == null) return 0;

        OutboundOrder order = new OutboundOrder();
        order.setIssueCode(prefix + "-XK-" + orderDate.getYear() + "-"
                + String.format("%03d", orderDate.getDayOfYear()) + "-" + random.nextInt(100));
        order.setCustomerId(customer.getId());
        order.setCompanyId(companyId);
        order.setCreatedBy(creator.getId());
        order.setNote("Phiếu xuất mẫu " + prefix);
        order.setCreatedAt(orderDate.atTime(14, 0));
        order.setStatus("COMPLETED");
        order.setIssueDate(orderDate.atTime(14, 0));
        order.setWaveId(wave.getId());
        OutboundOrder savedOrder = outboundOrderRepo.save(order);

        Set<Integer> used = new HashSet<>();
        BigDecimal totalAmount = BigDecimal.ZERO;
        boolean hasItems = false;
        List<OutboundOrderDetail>   details = new ArrayList<>();
        List<InventoryTransaction>  txList  = new ArrayList<>();

        for (int k = 0; k < 2 + random.nextInt(3); k++) {
            Product product = products.get(random.nextInt(products.size()));
            if (!used.add(product.getId())) continue;

            List<Inventory> stockList = inventoryRepo.findAvailableStockOrderByExpiryDate(
                    product.getId(), BigDecimal.ZERO);
            if (stockList.isEmpty()) continue;

            Inventory stock = stockList.get(0);
            BigDecimal available = stock.getQuantityOnHand().subtract(stock.getQuantityAllocated());
            if (available.compareTo(BigDecimal.ONE) <= 0) continue;

            BigDecimal requestedQty = new BigDecimal(10 + random.nextInt(20));
            BigDecimal qtyToSubtract = available.min(requestedQty);
            if (qtyToSubtract.compareTo(BigDecimal.ZERO) <= 0) {
                continue;
            }

            BigDecimal basePrice = getBasePriceBySku(product.getSku());
            BigDecimal unitPrice = basePrice.multiply(BigDecimal.valueOf(1.12 + random.nextDouble() * 0.10))
                    .setScale(0, java.math.RoundingMode.HALF_UP);
            totalAmount = totalAmount.add(qtyToSubtract.multiply(unitPrice));

            OutboundOrderDetail det = new OutboundOrderDetail();
            det.setOutboundOrderId(savedOrder.getId());
            det.setProductId(product.getId());
            det.setBatchId(stock.getBatchId());
            det.setLocationId(stock.getLocationId());
            det.setQuantity(qtyToSubtract); // Ghi nhận đúng lượng thực xuất
            det.setUnitPrice(unitPrice);
            details.add(det);

            stock.setQuantityOnHand(stock.getQuantityOnHand().subtract(qtyToSubtract));
            inventoryRepo.save(stock);

            InventoryTransaction tx = new InventoryTransaction();
            tx.setProductId(product.getId());
            tx.setLocationId(stock.getLocationId());
            tx.setBatchId(stock.getBatchId());
            tx.setCompanyId(companyId);
            tx.setTransactionType("OUTBOUND");
            tx.setQuantityChange(qtyToSubtract.negate()); // Khớp hoàn toàn với lượng thay đổi trong kho
            tx.setReferenceId(savedOrder.getId());
            tx.setCreatedBy(creator.getId());
            tx.setCreatedAt(orderDate.atTime(14, 0));
            txList.add(tx);
            hasItems = true;
        }

        if (hasItems) {
            outboundOrderDetailRepo.saveAll(details);
            transactionRepo.saveAll(txList);
            savedOrder.setTotalAmount(totalAmount);
            outboundOrderRepo.save(savedOrder);
            return 1;
        } else {
            outboundOrderRepo.delete(savedOrder);
            return 0;
        }
    }

    @Transactional
    protected int generateCycleCountPlan(Integer companyId, String prefix, LocalDate planDate,
                                          List<Location> locations, List<Product> products,
                                          Staff checker, int serial) {
        CycleCountPlan plan = new CycleCountPlan();
        plan.setPlanCode(prefix + "-CCP-" + planDate.getYear() + "-" + String.format("%03d", serial));
        plan.setCompanyId(companyId);
        plan.setCreatedBy(checker.getId());
        plan.setAssignedTo(checker.getId());
        plan.setScheduledDate(planDate.atTime(9, 0));
        plan.setNote("Kiểm kê định kỳ " + prefix);
        plan.setStatus("COMPLETED");
        plan.setCompletedAt(planDate.atTime(16, 0));
        CycleCountPlan savedPlan = cycleCountPlanRepo.save(plan);

        List<CycleCountDetail> details = new ArrayList<>();

        for (int j = 0; j < 3; j++) {
            Location location = locations.get(random.nextInt(locations.size()));
            List<Inventory> stockList = inventoryRepo.findByLocationId(location.getId());

            CycleCountDetail det = new CycleCountDetail();
            det.setPlanId(savedPlan.getId());
            det.setLocationId(location.getId());

            if (stockList.isEmpty()) {
                Product product = products.get(random.nextInt(products.size()));
                Batch batch = batchRepo.findByProductId(product.getId()).stream().findAny().orElse(null);
                det.setProductId(product.getId());
                det.setBatchId(batch != null ? batch.getId() : 1);
                det.setSystemQty(BigDecimal.ZERO);
                det.setCountedQty(BigDecimal.ZERO);
                det.setVariance(BigDecimal.ZERO);
                det.setNote("Vị trí trống, khớp.");
            } else {
                Inventory inv        = stockList.get(0);
                BigDecimal systemQty = inv.getQuantityOnHand();
                BigDecimal counted   = systemQty;
                BigDecimal variance  = BigDecimal.ZERO;

                if (random.nextInt(10) == 0) {
                    int diff = -2 + random.nextInt(5);
                    if (diff != 0) {
                        counted  = systemQty.add(BigDecimal.valueOf(diff)).max(BigDecimal.ZERO);
                        variance = counted.subtract(systemQty);
                        inv.setQuantityOnHand(counted);
                        inventoryRepo.save(inv);

                        InventoryTransaction tx = new InventoryTransaction();
                        tx.setProductId(inv.getProductId()); tx.setLocationId(inv.getLocationId());
                        tx.setBatchId(inv.getBatchId());     tx.setCompanyId(companyId);
                        tx.setTransactionType("ADJUSTMENT"); tx.setQuantityChange(variance);
                        tx.setReferenceId(savedPlan.getId()); tx.setCreatedBy(checker.getId());
                        tx.setCreatedAt(plan.getCompletedAt());
                        transactionRepo.save(tx);
                    }
                }

                det.setProductId(inv.getProductId());
                det.setBatchId(inv.getBatchId());
                det.setSystemQty(systemQty);
                det.setCountedQty(counted);
                det.setVariance(variance);
                det.setNote(variance.compareTo(BigDecimal.ZERO) == 0 ? "Khớp thực tế" : "Sai lệch điều chỉnh");
            }
            details.add(det);
        }

        cycleCountDetailRepo.saveAll(details);
        return 1;
    }

    // ═══════════════════════════════════════════════════════════════════════
    // Utilities
    // ═══════════════════════════════════════════════════════════════════════

    private Location pickLocation(Product product, List<Location> locations) {
        String temp = product.getStorageTemp() == null ? "" : product.getStorageTemp().toLowerCase();
        String zone;
        if      (temp.contains("mát") || temp.contains("5-10"))       zone = "COLD";
        else if (temp.contains("lạnh") || temp.contains("đông"))      zone = "FROZEN";
        else if (Boolean.TRUE.equals(product.getIsFragile()))          zone = "FRAGILE";
        else                                                            zone = "NORMAL";

        List<Location> filtered = locations.stream().filter(l -> zone.equals(l.getZone())).toList();
        return filtered.isEmpty() ? locations.get(0) : filtered.get(random.nextInt(filtered.size()));
    }

    private LocalDate resolveExpiryDate(Product product, LocalDate orderDate) {
        String temp = product.getStorageTemp() == null ? "" : product.getStorageTemp().toLowerCase();
        String sku  = product.getSku() == null ? "" : product.getSku().toUpperCase();
        if (temp.contains("mát") || temp.contains("5-10") || temp.contains("lạnh"))
            return orderDate.plusMonths(6 + random.nextInt(6));
        if (sku.contains("IPH") || sku.contains("SAM") || sku.contains("SONY") || sku.contains("DELL"))
            return orderDate.plusYears(5);
        if (sku.contains("SENKA") || sku.contains("ANESSA") || sku.contains("PANTENE") || sku.contains("LIFEBUOY"))
            return orderDate.plusYears(2 + random.nextInt(2));
        return orderDate.plusMonths(12 + random.nextInt(12));
    }

    private BigDecimal getBasePriceBySku(String sku) {
        if (sku == null) return new BigDecimal("50000");
        int idx = sku.lastIndexOf('-');
        String base = idx >= 0 ? sku.substring(idx + 1) : sku;
        return switch (base) {
            case "IPH15"     -> new BigDecimal("25000000");
            case "SAMS24"    -> new BigDecimal("22000000");
            case "SONYXM5"   -> new BigDecimal("6500000");
            case "DELLXPS"   -> new BigDecimal("35000000");
            case "HAHA"      -> new BigDecimal("180000");
            case "THTRUE"    -> new BigDecimal("30000");
            case "SIMPLY"    -> new BigDecimal("50000");
            case "ST25"      -> new BigDecimal("35000");
            case "LOCKNLOC"  -> new BigDecimal("250000");
            case "PANADRY"   -> new BigDecimal("350000");
            case "CUCKOO"    -> new BigDecimal("2200000");
            case "SENKOFAN"  -> new BigDecimal("400000");
            case "SENKAFACE" -> new BigDecimal("90000");
            case "ANESSA"    -> new BigDecimal("450000");
            case "PANTENE"   -> new BigDecimal("130000");
            case "LIFEBUOY"  -> new BigDecimal("140000");
            case "MASK3D"    -> new BigDecimal("45000");
            case "HANDSAN"   -> new BigDecimal("65000");
            case "COTTON"    -> new BigDecimal("25000");
            case "ALCOHOL"   -> new BigDecimal("15000");
            default          -> new BigDecimal("50000");
        };
    }

    @Transactional
    protected Company ensureCompany(String code, String name, Integer parentId, String taxCode, String address) {
        Company c = companyRepo.findByCompanyCodeIgnoreCase(code).orElseGet(Company::new);
        c.setCompanyCode(code);
        c.setCompanyName(name);
        c.setTaxCode(taxCode);
        c.setAddress(address);
        c.setParentCompanyId(parentId);
        c.setActive(true);
        return companyRepo.save(c);
    }
}
