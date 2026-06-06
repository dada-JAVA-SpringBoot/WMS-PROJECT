package com.wmsbackend.service;

import com.wmsbackend.entity.*;
import com.wmsbackend.repository.*;
import com.wmsbackend.util.TimeUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;

@Service
public class MockDataService {

    @Autowired private ProductCategoryRepository categoryRepo;
    @Autowired private ProductUnitRepository unitRepo;
    @Autowired private ProductRepository productRepo;
    @Autowired private SupplierRepository supplierRepo;
    @Autowired private CustomerRepository customerRepo;
    @Autowired private ProductSupplierRepository productSupplierRepo;
    @Autowired private ProductUnitConversionRepository unitConversionRepo;
    @Autowired private WarehouseRepository warehouseRepo;
    @Autowired private LocationRepository locationRepo;
    @Autowired private StaffRepository staffRepo;
    @Autowired private RoleRepository roleRepo;
    @Autowired private WorkShiftRepository workShiftRepo;
    @Autowired private AttendanceRepository attendanceRepo;
    @Autowired private BatchRepository batchRepo;
    @Autowired private InboundOrderRepository inboundOrderRepo;
    @Autowired private InboundOrderDetailRepository inboundOrderDetailRepo;
    @Autowired private OutboundOrderRepository outboundOrderRepo;
    @Autowired private OutboundOrderDetailRepository outboundOrderDetailRepo;
    @Autowired private WaveRepository waveRepo;
    @Autowired private InventoryRepository inventoryRepo;
    @Autowired private InventoryTransactionRepository transactionRepo;
    @Autowired private CycleCountPlanRepository cycleCountPlanRepo;
    @Autowired private CycleCountDetailRepository cycleCountDetailRepo;

    @Autowired private PasswordEncoder passwordEncoder;
    @Autowired private jakarta.persistence.EntityManager entityManager;

    private final Random random = new Random();

    @Transactional
    public Map<String, Object> generateMockData() {
        Map<String, Object> result = new LinkedHashMap<>();

        // 1. DỌN DẸP DỮ LIỆU CŨ (Trừ Roles, WorkShifts, và tài khoản admin)
        cleanExistingData();
        result.put("status", "Cleaned existing transactional data");

        // 2. SINH DỮ LIỆU CƠ BẢN
        // 2.1. Đơn vị sản phẩm
        List<ProductUnit> units = seedProductUnits();
        result.put("units_count", units.size());

        // 2.2. Danh mục sản phẩm
        List<ProductCategory> categories = seedProductCategories();
        result.put("categories_count", categories.size());

        // 2.3. Nhà cung cấp
        List<Supplier> suppliers = seedSuppliers();
        result.put("suppliers_count", suppliers.size());

        // 2.4. Khách hàng
        List<Customer> customers = seedCustomers();
        result.put("customers_count", customers.size());

        // 2.5. Sản phẩm & Quy đổi đơn vị & Liên kết nhà cung cấp
        List<Product> products = seedProducts(categories, units, suppliers);
        result.put("products_count", products.size());

        // 2.6. Kho & Vị trí
        Warehouse warehouse = seedWarehouse();
        List<Location> locations = seedLocations(warehouse);
        result.put("warehouse", warehouse.getName());
        result.put("locations_count", locations.size());

        // 2.7. Nhân viên & Lịch sử Chấm công
        List<Staff> staffMembers = seedStaff();
        result.put("staff_count", staffMembers.size());
        int attendanceCount = seedAttendance(staffMembers);
        result.put("attendance_records", attendanceCount);

        // 2.8. Lô hàng (Batches)
        List<Batch> batches = seedBatches(products);
        result.put("batches_count", batches.size());

        // 2.9. Đơn hàng Nhập/Xuất & Tồn kho thực tế + Lịch sử Giao dịch kho
        int inboundCount = seedInboundOrders(suppliers, products, batches, locations, staffMembers);
        result.put("inbound_orders_count", inboundCount);

        int outboundCount = seedOutboundOrders(customers, products, batches, locations, staffMembers);
        result.put("outbound_orders_count", outboundCount);

        long inventoryCount = inventoryRepo.count();
        result.put("inventory_records_count", inventoryCount);

        long transactionCount = transactionRepo.count();
        result.put("inventory_transactions_count", transactionCount);

        // 2.10. Đợt kiểm kê
        int cycleCountCount = seedCycleCounts(locations, products, batches, staffMembers);
        result.put("cycle_counts_count", cycleCountCount);

        return result;
    }

    private void cleanExistingData() {
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

        // Xóa tất cả nhân viên trừ tài khoản admin
        List<Staff> staffList = staffRepo.findAll();
        for (Staff s : staffList) {
            if (!"admin".equals(s.getUsername())) {
                s.getRoles().clear();
                staffRepo.save(s);
                staffRepo.delete(s);
            }
        }
        
        entityManager.flush();
        entityManager.clear();
    }

    private List<ProductUnit> seedProductUnits() {
        List<ProductUnit> units = new ArrayList<>();
        String[][] unitData = {
            {"PCS", "Cái", "Đơn vị tính lẻ"},
            {"BOX", "Hộp", "Đóng gói dạng hộp nhỏ"},
            {"BOTTLE", "Chai", "Dành cho chất lỏng"},
            {"CARTON", "Thùng", "Thùng các-tông chứa nhiều cái"},
            {"KG", "Kg", "Đơn vị tính theo khối lượng"}
        };
        for (String[] ud : unitData) {
            ProductUnit pu = new ProductUnit();
            pu.setUnitCode("UNIT-" + ud[0]);
            pu.setName(ud[1]);
            pu.setDescription(ud[2]);
            pu.setIsActive(true);
            units.add(unitRepo.save(pu));
        }
        return units;
    }

    private List<ProductCategory> seedProductCategories() {
        List<ProductCategory> list = new ArrayList<>();
        String[][] data = {
            {"ELE", "Thiết bị Điện tử", "Điện thoại, máy tính, tai nghe và phụ kiện công nghệ"},
            {"FOO", "Thực phẩm & Đồ uống", "Sữa, mì gói, nước tương và các loại nhu yếu phẩm"},
            {"HOU", "Đồ gia dụng", "Quạt điện, nồi cơm điện, chảo chống dính, bình giữ nhiệt"},
            {"COS", "Hóa mỹ phẩm", "Sữa tắm, dầu gội, kem dưỡng da, nước hoa hồng"},
            {"MED", "Thiết bị & Dược phẩm Y tế", "Khẩu trang y tế, bông băng, cồn sát khuẩn, thuốc bổ"}
        };
        for (String[] row : data) {
            ProductCategory pc = new ProductCategory();
            pc.setCategoryCode("CAT-" + row[0]);
            pc.setName(row[1]);
            pc.setDescription(row[2]);
            pc.setIsActive(true);
            list.add(categoryRepo.save(pc));
        }
        return list;
    }

    private List<Supplier> seedSuppliers() {
        List<Supplier> list = new ArrayList<>();
        String[][] data = {
            {"SUP001", "Cty Công nghệ Hưng Thịnh", "0987654321", "Tòa nhà Hưng Thịnh, Cầu Giấy, Hà Nội"},
            {"SUP002", "Cty Thực phẩm An Bình", "0912345678", "KCN Tân Bình, Tân Phú, TP.HCM"},
            {"SUP003", "Tập đoàn Gia dụng Việt", "0934567890", "Đường Số 5, KCN Biên Hòa 2, Đồng Nai"},
            {"SUP004", "NPP Hóa phẩm Mai Linh", "0945678901", "Quận Ô Môn, Cần Thơ"},
            {"SUP005", "Cty Thiết bị Y tế Thành Công", "0967890123", "Phường Kim Giang, Thanh Xuân, Hà Nội"}
        };
        for (String[] row : data) {
            Supplier s = new Supplier();
            s.setSupplierCode(row[0]);
            s.setName(row[1]);
            s.setPhone(row[2]);
            s.setAddress(row[3]);
            s.setTotalImportQuantity(0);
            list.add(supplierRepo.save(s));
        }
        return list;
    }

    private List<Customer> seedCustomers() {
        List<Customer> list = new ArrayList<>();
        String[][] data = {
            {"CUST001", "Siêu thị Co.opmart Nguyễn Đình Chiểu", "0283930182", "168 Nguyễn Đình Chiểu, Quận 3, TP.HCM"},
            {"CUST002", "Chuỗi cửa hàng WinMart Tây Hồ", "0247300808", "Lạc Long Quân, Tây Hồ, Hà Nội"},
            {"CUST003", "Cửa hàng Bách Hóa Xanh Linh Đông", "19001908", "Đường Linh Đông, Thủ Đức, TP.HCM"},
            {"CUST004", "NPP Điện máy Chợ Lớn Quận 5", "0283856338", "Lô G chung cư Hùng Vương, Quận 5, TP.HCM"},
            {"CUST005", "Hiệu thuốc Pharmacity Nguyễn Trãi", "18006821", "252 Nguyễn Trãi, Thanh Xuân, Hà Nội"}
        };
        for (String[] row : data) {
            Customer c = new Customer();
            c.setCustomerCode(row[0]);
            c.setName(row[1]);
            c.setPhone(row[2]);
            c.setAddress(row[3]);
            list.add(customerRepo.save(c));
        }
        return list;
    }

    private List<Product> seedProducts(List<ProductCategory> cats, List<ProductUnit> units, List<Supplier> sups) {
        List<Product> list = new ArrayList<>();
        
        // 5 Categories, mỗi loại tạo 4 sản phẩm -> 20 sản phẩm
        String[][][] prodData = {
            // ELECTRONICS (cats.get(0))
            {
                {"IPH15", "iPhone 15 Pro Max 256GB", "Cái", "0.22", "15", "10", "8", "Bình thường", "20", "1"},
                {"SAMS24", "Samsung Galaxy S24 Ultra", "Cái", "0.23", "16", "10", "8", "Bình thường", "20", "1"},
                {"SONYXM5", "Tai nghe Sony WH-1000XM5", "Cái", "0.25", "20", "18", "12", "Bình thường", "10", "1"},
                {"DELLXPS", "Laptop Dell XPS 15 9530", "Cái", "1.96", "35", "25", "5", "Bình thường", "5", "1"}
            },
            // FOOD (cats.get(1))
            {
                {"HAHA", "Mì tôm Hảo Hảo Tôm Chua Cay", "Hộp", "1.50", "30", "20", "20", "Khô thoáng", "100", "0"},
                {"THTRUE", "Sữa tươi tiệt trùng TH True Milk 1L", "Chai", "1.05", "10", "10", "25", "Mát (5-10°C)", "50", "0"},
                {"SIMPLY", "Dầu ăn Simply 1L", "Chai", "0.92", "8", "8", "25", "Bình thường", "30", "0"},
                {"ST25", "Gạo ST25 túi 5kg", "Kg", "5.02", "40", "30", "15", "Khô ráo", "40", "0"}
            },
            // HOUSEHOLD (cats.get(2))
            {
                {"LOCKNLOC", "Bình giữ nhiệt Lock&Lock 500ml", "Cái", "0.35", "9", "9", "20", "Bình thường", "15", "0"},
                {"PANADRY", "Máy sấy tóc Panasonic EH-ND21", "Cái", "0.45", "15", "12", "12", "Bình thường", "15", "0"},
                {"CUCKOO", "Nồi cơm điện Cuckoo 1.8L", "Cái", "3.50", "30", "30", "28", "Bình thường", "10", "0"},
                {"SENKOFAN", "Quạt bàn Senko B1612", "Cái", "2.80", "35", "35", "40", "Bình thường", "12", "0"}
            },
            // COSMETICS (cats.get(3))
            {
                {"SENKAFACE", "Sữa rửa mặt Senka Perfect Whip 120g", "Chai", "0.14", "5", "5", "15", "Mát", "40", "0"},
                {"ANESSA", "Kem chống nắng Anessa SPF50+ 60ml", "Chai", "0.08", "4", "4", "12", "Mát", "30", "0"},
                {"PANTENE", "Dầu gội Pantene ngăn rụng tóc 650ml", "Chai", "0.72", "8", "8", "22", "Bình thường", "25", "0"},
                {"LIFEBUOY", "Sữa tắm Lifebuoy Bảo vệ vượt trội 850g", "Chai", "0.92", "10", "10", "24", "Bình thường", "35", "0"}
            },
            // MEDICAL (cats.get(4))
            {
                {"MASK3D", "Khẩu trang y tế 3D kháng khuẩn (Hộp 50 cái)", "Hộp", "0.18", "18", "12", "10", "Bình thường", "100", "0"},
                {"HANDSAN", "Nước rửa tay sát khuẩn nhanh 500ml", "Chai", "0.52", "8", "8", "18", "Mát", "50", "0"},
                {"COTTON", "Bông y tế Bạch Tuyết 100g", "Hộp", "0.11", "12", "12", "8", "Bình thường", "40", "0"},
                {"ALCOHOL", "Cồn đỏ sát trùng Povidine 90ml", "Chai", "0.10", "5", "5", "10", "Mát", "60", "0"}
            }
        };

        for (int cIdx = 0; cIdx < prodData.length; cIdx++) {
            ProductCategory cat = cats.get(cIdx);
            Supplier sup = sups.get(cIdx); // Mỗi ngành hàng gán mặc định cho 1 nhà cung cấp chính
            
            for (String[] row : prodData[cIdx]) {
                Product p = new Product();
                p.setSku(row[0]);
                p.setName(row[1]);
                p.setBaseUnit(row[2]);
                p.setCategoryId(cat.getId());
                p.setWeight(new BigDecimal(row[3]));
                p.setLength(new BigDecimal(row[4]));
                p.setWidth(new BigDecimal(row[5]));
                p.setHeight(new BigDecimal(row[6]));
                p.setStorageTemp(row[7]);
                p.setSafetyStock(Integer.parseInt(row[8]));
                p.setIsFragile("1".equals(row[9]));
                p.setStatus("ACTIVE");
                
                Product savedProduct = productRepo.save(p);
                
                // Quy đổi đơn vị: Thêm quy đổi sang THÙNG nếu sản phẩm đóng chai hoặc hộp
                if ("Hộp".equalsIgnoreCase(row[2]) || "Chai".equalsIgnoreCase(row[2])) {
                    ProductUnitConversion puc = new ProductUnitConversion();
                    puc.setProductId(savedProduct.getId());
                    puc.setUnitName("Thùng");
                    puc.setConversionFactor(new BigDecimal("24.0000"));
                    puc.setIsDefault(false);
                    unitConversionRepo.save(puc);
                }

                // Thiết lập Nhà cung cấp mặc định cho sản phẩm
                ProductSupplier ps = new ProductSupplier();
                ProductSupplier.ProductSupplierId psId = new ProductSupplier.ProductSupplierId(savedProduct.getId(), sup.getId());
                ps.setId(psId);
                ps.setProduct(savedProduct);
                ps.setSupplier(sup);
                ps.setIsDefault(true);
                productSupplierRepo.save(ps);

                list.add(savedProduct);
            }
        }
        return list;
    }

    private Warehouse seedWarehouse() {
        Warehouse wh = new Warehouse();
        wh.setWarehouseCode("WH-MAIN");
        wh.setName("Kho Tổng Hà Nội");
        wh.setAddress("Số 1 Tràng Tiền, Hoàn Kiếm, Hà Nội");
        return warehouseRepo.save(wh);
    }

    private List<Location> seedLocations(Warehouse wh) {
        List<Location> list = new ArrayList<>();
        String[] zones = {"NORMAL", "COLD", "FRAGILE"};
        String[] aisles = {"A", "B", "C", "D"};
        String[] racks = {"R1", "R2"};
        String[] levels = {"L1", "L2"};

        // Tạo 3 zones * 4 aisles * 2 racks * 2 levels = 48 vị trí
        for (String zone : zones) {
            for (String aisle : aisles) {
                for (String rack : racks) {
                    for (String level : levels) {
                        Location loc = new Location();
                        loc.setWarehouseId(wh.getId());
                        loc.setZone(zone);
                        loc.setAisle(aisle);
                        loc.setRack(rack);
                        loc.setLevel(level);
                        loc.setBinCode(zone + "-" + aisle + "-" + rack + "-" + level);
                        loc.setCapacity(200);
                        loc.setStorageType(zone);
                        loc.setContainerType("THUNG");
                        list.add(locationRepo.save(loc));
                    }
                }
            }
        }
        return list;
    }

    private List<Staff> seedStaff() {
        List<Staff> list = new ArrayList<>();
        WorkShift shiftHc = workShiftRepo.findAll().stream()
                .filter(s -> s.getShiftName().contains("hành chính")).findFirst().orElse(null);
        WorkShift shiftSang = workShiftRepo.findAll().stream()
                .filter(s -> s.getShiftName().contains("sáng")).findFirst().orElse(null);

        Role roleManager = roleRepo.findByRoleName("MANAGER").orElse(null);
        Role roleStorekeeper = roleRepo.findByRoleName("STOREKEEPER").orElse(null);
        Role roleQc = roleRepo.findByRoleName("QUALITY_CONTROL").orElse(null);
        Role roleInbound = roleRepo.findByRoleName("INBOUND_STAFF").orElse(null);
        Role roleOutbound = roleRepo.findByRoleName("OUTBOUND_STAFF").orElse(null);
        Role roleChecker = roleRepo.findByRoleName("INVENTORY_CHECKER").orElse(null);

        String[][] staffData = {
            {"manager1", "Nguyễn Văn Quản Lý", "MALE", "1985-05-12", "0901234567", "manager@wms.com", "MANAGER", "Ca hành chính"},
            {"keeper1", "Trần Minh Thủ Kho", "MALE", "1988-08-20", "0912345678", "keeper@wms.com", "STOREKEEPER", "Ca hành chính"},
            {"qc1", "Lê Thị Kiểm Duyệt", "FEMALE", "1992-10-15", "0923456789", "qc@wms.com", "QUALITY_CONTROL", "Ca sáng"},
            {"inbound1", "Phạm Văn Nhập Kho", "MALE", "1995-02-25", "0934567890", "inbound@wms.com", "INBOUND_STAFF", "Ca sáng"},
            {"outbound1", "Vũ Thị Xuất Kho", "FEMALE", "1996-07-30", "0945678901", "outbound@wms.com", "OUTBOUND_STAFF", "Ca sáng"},
            {"checker1", "Hoàng Giang Kiểm Kê", "MALE", "1994-11-05", "0956789012", "checker@wms.com", "INVENTORY_CHECKER", "Ca hành chính"}
        };

        String defaultHashedPassword = passwordEncoder.encode("password");

        for (String[] row : staffData) {
            Staff s = new Staff();
            s.setUsername(row[0]);
            s.setFullName(row[1]);
            s.setEmployeeCode("EMP-" + row[0].toUpperCase());
            s.setGender(row[2]);
            s.setDateOfBirth(LocalDate.parse(row[3]));
            s.setPhone(row[4]);
            s.setEmail(row[5]);
            s.setWarehouseRole(row[6]);
            s.setContractType("FULL_TIME");
            s.setWorkStatus("OFF_SHIFT");
            s.setPassword(defaultHashedPassword);
            s.setEnabled(true);
            s.setAvatar("default");
            s.setHireDate(LocalDate.now().minusMonths(6));

            WorkShift ws = row[7].contains("sáng") ? shiftSang : shiftHc;
            if (ws != null) {
                s.setShiftStartTime(ws.getStartTime());
                s.setShiftEndTime(ws.getEndTime());
            }

            // Gán quyền tương ứng
            Set<Role> roles = new HashSet<>();
            if ("MANAGER".equals(row[6]) && roleManager != null) roles.add(roleManager);
            else if ("STOREKEEPER".equals(row[6]) && roleStorekeeper != null) roles.add(roleStorekeeper);
            else if ("QUALITY_CONTROL".equals(row[6]) && roleQc != null) roles.add(roleQc);
            else if ("INBOUND_STAFF".equals(row[6]) && roleInbound != null) roles.add(roleInbound);
            else if ("OUTBOUND_STAFF".equals(row[6]) && roleOutbound != null) roles.add(roleOutbound);
            else if ("INVENTORY_CHECKER".equals(row[6]) && roleChecker != null) roles.add(roleChecker);
            s.setRoles(roles);

            list.add(staffRepo.save(s));
        }

        return list;
    }

    private int seedAttendance(List<Staff> staffMembers) {
        int count = 0;
        LocalDate today = LocalDate.now();
        // Sinh lịch sử điểm danh trong 90 ngày qua
        for (int i = 90; i >= 1; i--) {
            LocalDate workDate = today.minusDays(i);
            // Bỏ qua Chủ Nhật
            if (workDate.getDayOfWeek().getValue() == 7) continue;

            for (Staff staff : staffMembers) {
                Attendance att = new Attendance();
                att.setStaff(staff);
                att.setWorkDate(workDate);
                att.setApprovalStatus("APPROVED");

                int rand = random.nextInt(100);
                if (rand < 85) { // 85% đúng giờ
                    att.setStatus("PRESENT");
                    att.setCheckInTime(LocalDateTime.of(workDate, LocalTime.of(7, 45).plusMinutes(random.nextInt(20)))); // 7:45 - 8:05
                    att.setCheckOutTime(LocalDateTime.of(workDate, LocalTime.of(17, 30).plusMinutes(random.nextInt(40)))); // 17:30 - 18:10
                    att.setLateMinutes(0);
                    // Giờ hành chính là 17:30. Nếu checkOut > 17:30 thì tính OT
                    int ot = att.getCheckOutTime().getMinute();
                    if (att.getCheckOutTime().getHour() >= 18) {
                        ot += (att.getCheckOutTime().getHour() - 17) * 60 - 30;
                    }
                    att.setOvertimeMinutes(Math.max(0, ot));
                } else if (rand < 95) { // 10% đi muộn
                    att.setStatus("LATE");
                    att.setCheckInTime(LocalDateTime.of(workDate, LocalTime.of(8, 20).plusMinutes(random.nextInt(25)))); // 8:20 - 8:45
                    att.setCheckOutTime(LocalDateTime.of(workDate, LocalTime.of(17, 30)));
                    // Điểm danh muộn tính từ sau 08:15 (08:00 + 15p Grace)
                    int late = (att.getCheckInTime().getHour() - 8) * 60 + att.getCheckInTime().getMinute();
                    att.setLateMinutes(Math.max(0, late));
                    att.setOvertimeMinutes(0);
                    att.setLateReason("Kẹt xe giờ cao điểm");
                } else { // 5% vắng mặt
                    att.setStatus("ABSENT");
                    att.setLateMinutes(0);
                    att.setOvertimeMinutes(0);
                    att.setNote("Nghỉ phép có lương");
                }
                attendanceRepo.save(att);
                count++;
            }
        }
        return count;
    }

    private List<Batch> seedBatches(List<Product> products) {
        List<Batch> list = new ArrayList<>();
        LocalDate today = LocalDate.now();
        for (Product p : products) {
            // Batch 1: Đã hết hạn (hạn dùng 3 tháng trước)
            Batch b1 = new Batch();
            b1.setProductId(p.getId());
            b1.setBatchCode(p.getSku() + "-EXP-01");
            b1.setManufactureDate(today.minusYears(1).minusMonths(3));
            b1.setExpiryDate(today.minusMonths(3));
            list.add(batchRepo.save(b1));

            // Batch 2: Sắp hết hạn (hạn dùng trong 15 ngày tới)
            Batch b2 = new Batch();
            b2.setProductId(p.getId());
            b2.setBatchCode(p.getSku() + "-WARN-02");
            b2.setManufactureDate(today.minusMonths(5));
            b2.setExpiryDate(today.plusDays(15));
            list.add(batchRepo.save(b2));

            // Batch 3: Hạn dài (hạn dùng trong 1 năm rưỡi tới)
            Batch b3 = new Batch();
            b3.setProductId(p.getId());
            b3.setBatchCode(p.getSku() + "-GOOD-03");
            b3.setManufactureDate(today.minusMonths(1));
            b3.setExpiryDate(today.plusYears(1).plusMonths(6));
            list.add(batchRepo.save(b3));
        }
        return list;
    }

    private int seedInboundOrders(List<Supplier> suppliers, List<Product> products, List<Batch> batches, List<Location> locations, List<Staff> staffMembers) {
        int orderCount = 0;
        LocalDate today = LocalDate.now();
        Staff creator = staffMembers.stream().filter(s -> "inbound1".equals(s.getUsername())).findFirst().orElse(staffMembers.get(0));

        // Tạo đơn nhập trong 2 năm (730 ngày) qua, tần suất 3 ngày/đơn
        for (int i = 730; i >= 1; i--) {
            if (i % 3 != 0) continue; // 3 ngày tạo 1 đơn

            LocalDate orderDate = today.minusDays(i);
            InboundOrder order = new InboundOrder();
            order.setReceiptCode("PN-" + (100000 + orderDate.getDayOfYear()) + "-" + i);
            Supplier sup = suppliers.get(random.nextInt(suppliers.size()));
            order.setSupplierId(sup.getId());
            order.setReferenceNumber("REF-" + (200000 + random.nextInt(9999)));
            order.setCreatedBy(creator.getId());
            order.setNotes("Phiếu nhập hàng định kỳ");
            order.setCreatedAt(orderDate.atTime(10, 0));

            // Quyết định trạng thái theo thời gian
            String status;
            if (i > 3) {
                status = "COMPLETED"; // Đơn cũ đều đã hoàn thành
            } else {
                String[] sts = {"DRAFT", "PENDING", "COMPLETED", "CANCELED"};
                status = sts[random.nextInt(sts.length)];
            }
            order.setStatus(status);

            if ("COMPLETED".equals(status)) {
                order.setReceiptDate(orderDate.atTime(10, 0));
            }
            
            InboundOrder savedOrder = inboundOrderRepo.save(order);
            orderCount++;

            // Thêm chi tiết đơn hàng (2-4 sản phẩm)
            int numItems = 2 + random.nextInt(3);
            Set<Integer> usedProducts = new HashSet<>();
            BigDecimal totalAmount = BigDecimal.ZERO;

            for (int k = 0; k < numItems; k++) {
                Product p = products.get(random.nextInt(products.size()));
                if (usedProducts.contains(p.getId())) continue;
                usedProducts.add(p.getId());

                // Tìm Batch phù hợp
                Batch batch = batches.stream()
                        .filter(b -> b.getProductId().equals(p.getId()) && b.getBatchCode().contains("GOOD"))
                        .findFirst().orElse(batches.stream().filter(b -> b.getProductId().equals(p.getId())).findFirst().orElse(null));

                // Tìm Location thuộc zone phù hợp với điều kiện bảo quản của sản phẩm
                String storageReq = p.getStorageTemp();
                String zoneFilter = "NORMAL";
                if (storageReq.contains("Mát") || storageReq.contains("5-10")) zoneFilter = "COLD";
                else if (p.getIsFragile()) zoneFilter = "FRAGILE";

                final String targetZone = zoneFilter;
                List<Location> zoneLocs = locations.stream()
                        .filter(l -> targetZone.equals(l.getZone()))
                        .toList();
                Location loc = zoneLocs.isEmpty() ? locations.get(0) : zoneLocs.get(random.nextInt(zoneLocs.size()));

                BigDecimal quantity = new BigDecimal(20 + random.nextInt(31)); // 20 - 50
                BigDecimal basePrice = getBasePriceBySku(p.getSku());
                BigDecimal unitPrice = basePrice.multiply(BigDecimal.valueOf(0.95 + random.nextDouble() * 0.10)).setScale(0, java.math.RoundingMode.HALF_UP);
                BigDecimal itemAmount = quantity.multiply(unitPrice);
                totalAmount = totalAmount.add(itemAmount);

                InboundOrderDetail detail = new InboundOrderDetail();
                detail.setInboundOrderId(savedOrder.getId());
                detail.setProductId(p.getId());
                detail.setBatchId(batch.getId());
                detail.setLocationId(loc.getId());
                detail.setQuantityExpected(quantity);
                detail.setQuantityReceived(quantity);
                detail.setUnitPrice(unitPrice);
                detail.setItemCondition("Bình thường");
                detail.setExpiryDate(batch.getExpiryDate());

                if ("COMPLETED".equals(status)) {
                    detail.setQuantityIntact(quantity);
                    detail.setQuantityDamaged(BigDecimal.ZERO);
                    detail.setQualityRating("EXCELLENT");
                    detail.setQcNotes("Đã kiểm định đạt chuẩn");

                    // Cộng vào Tồn kho (Inventory)
                    Inventory inv = inventoryRepo.findByProductIdAndLocationIdAndBatchId(p.getId(), loc.getId(), batch.getId());
                    if (inv == null) {
                        inv = new Inventory();
                        inv.setProductId(p.getId());
                        inv.setLocationId(loc.getId());
                        inv.setBatchId(batch.getId());
                        inv.setQuantityOnHand(quantity);
                        inv.setQuantityAllocated(BigDecimal.ZERO);
                    } else {
                        inv.setQuantityOnHand(inv.getQuantityOnHand().add(quantity));
                    }
                    inventoryRepo.save(inv);

                    // Thêm Lịch sử Giao dịch (InventoryTransaction)
                    InventoryTransaction tx = new InventoryTransaction();
                    tx.setProductId(p.getId());
                    tx.setLocationId(loc.getId());
                    tx.setBatchId(batch.getId());
                    tx.setTransactionType("INBOUND");
                    tx.setQuantityChange(quantity);
                    tx.setReferenceId(savedOrder.getId());
                    tx.setCreatedBy(creator.getId());
                    tx.setCreatedAt(orderDate.atTime(10, 0));
                    transactionRepo.save(tx);
                }

                inboundOrderDetailRepo.save(detail);
            }

            savedOrder.setTotalAmount(totalAmount);
            inboundOrderRepo.save(savedOrder);

            // Cập nhật số lượng nhập kho của Nhà cung cấp
            if ("COMPLETED".equals(status)) {
                sup.setTotalImportQuantity(sup.getTotalImportQuantity() + totalAmount.intValue() / 10000); // Thống kê ảo
                supplierRepo.save(sup);
            }
        }
        return orderCount;
    }

    private int seedOutboundOrders(List<Customer> customers, List<Product> products, List<Batch> batches, List<Location> locations, List<Staff> staffMembers) {
        int orderCount = 0;
        LocalDate today = LocalDate.now();
        Staff creator = staffMembers.stream().filter(s -> "outbound1".equals(s.getUsername())).findFirst().orElse(staffMembers.get(0));

        // Tạo 3 Waves sẵn để gán vào các đơn hàng xuất
        List<Wave> waves = new ArrayList<>();
        String[] waveCodes = {"WAVE-01", "WAVE-02", "WAVE-03"};
        for (String wc : waveCodes) {
            Wave w = new Wave();
            w.setWaveCode(wc);
            w.setStatus("COMPLETED");
            w.setCreatedBy(creator.getId());
            w.setCreatedAt(today.minusDays(5).atStartOfDay());
            w.setCompletedAt(today.minusDays(5).atTime(15, 0));
            waves.add(waveRepo.save(w));
        }

        // Tạo đơn xuất trong 2 năm (730 ngày) qua, tần suất 3 ngày/đơn
        for (int i = 730; i >= 1; i--) {
            if (i % 3 != 0) continue; 

            LocalDate orderDate = today.minusDays(i);
            OutboundOrder order = new OutboundOrder();
            order.setIssueCode("XK-" + (300000 + orderDate.getDayOfYear()) + "-" + i);
            order.setCustomerId(customers.get(random.nextInt(customers.size())).getId());
            order.setCreatedBy(creator.getId());
            order.setNote("Đơn xuất siêu thị định kỳ");
            order.setCreatedAt(orderDate.atTime(14, 0));

            String status;
            if (i > 4) {
                status = "COMPLETED"; // Đơn cũ hơn 4 ngày đều hoàn thành
            } else {
                String[] sts = {"DRAFT", "PENDING", "ALLOCATED", "PICKING", "COMPLETED", "CANCELED"};
                status = sts[random.nextInt(sts.length)];
            }
            order.setStatus(status);

            if ("COMPLETED".equals(status)) {
                order.setIssueDate(orderDate.atTime(14, 0));
                // Phân ngẫu nhiên vào Wave để làm dữ liệu đẹp
                order.setWaveId(waves.get(random.nextInt(waves.size())).getId());
            } else if ("PICKING".equals(status) || "ALLOCATED".equals(status)) {
                order.setWaveId(waves.get(2).getId()); // Gán vào Wave chưa đóng hoàn toàn
            }

            OutboundOrder savedOrder = outboundOrderRepo.save(order);
            orderCount++;

            // Thêm chi tiết đơn hàng (2-3 sản phẩm)
            int numItems = 2 + random.nextInt(2);
            Set<Integer> usedProducts = new HashSet<>();
            BigDecimal totalAmount = BigDecimal.ZERO;

            for (int k = 0; k < numItems; k++) {
                Product p = products.get(random.nextInt(products.size()));
                if (usedProducts.contains(p.getId())) continue;
                usedProducts.add(p.getId());

                // Tìm Batch & Vị trí đang có tồn kho
                List<Inventory> stockList = inventoryRepo.findAll().stream()
                        .filter(inv -> inv.getProductId().equals(p.getId()) && inv.getQuantityOnHand().compareTo(BigDecimal.TEN) > 0)
                        .toList();

                if (stockList.isEmpty()) continue; // Nếu không có tồn kho sản phẩm này, bỏ qua

                Inventory stock = stockList.get(random.nextInt(stockList.size()));
                BigDecimal stockQty = stock.getQuantityOnHand();
                int available = stockQty.intValue();
                if (available < 10) continue; // ensure at least 10 items in stock
                
                int targetMax = Math.min(45, available);
                int targetMin = Math.min(15, targetMax);
                int range = Math.max(1, targetMax - targetMin + 1);
                BigDecimal quantity = new BigDecimal(targetMin + random.nextInt(range));

                BigDecimal basePrice = getBasePriceBySku(p.getSku());
                BigDecimal unitPrice = basePrice.multiply(BigDecimal.valueOf(1.15 + random.nextDouble() * 0.15)).setScale(0, java.math.RoundingMode.HALF_UP);
                BigDecimal itemAmount = quantity.multiply(unitPrice);
                totalAmount = totalAmount.add(itemAmount);

                OutboundOrderDetail detail = new OutboundOrderDetail();
                detail.setOutboundOrderId(savedOrder.getId());
                detail.setProductId(p.getId());
                detail.setBatchId(stock.getBatchId());
                detail.setLocationId(stock.getLocationId());
                detail.setQuantity(quantity);
                detail.setUnitPrice(unitPrice);

                if ("COMPLETED".equals(status)) {
                    // Trừ tồn kho thực tế
                    stock.setQuantityOnHand(stock.getQuantityOnHand().subtract(quantity).max(BigDecimal.ZERO));
                    inventoryRepo.save(stock);

                    // Thêm Lịch sử Giao dịch
                    InventoryTransaction tx = new InventoryTransaction();
                    tx.setProductId(p.getId());
                    tx.setLocationId(stock.getLocationId());
                    tx.setBatchId(stock.getBatchId());
                    tx.setTransactionType("OUTBOUND");
                    tx.setQuantityChange(quantity.negate()); // số lượng âm đại diện xuất kho
                    tx.setReferenceId(savedOrder.getId());
                    tx.setCreatedBy(creator.getId());
                    tx.setCreatedAt(orderDate.atTime(14, 0));
                    transactionRepo.save(tx);
                } else if ("ALLOCATED".equals(status) || "PICKING".equals(status)) {
                    // Tăng lượng phân bổ
                    stock.setQuantityAllocated(stock.getQuantityAllocated().add(quantity));
                    inventoryRepo.save(stock);
                }

                outboundOrderDetailRepo.save(detail);
            }

            savedOrder.setTotalAmount(totalAmount);
            outboundOrderRepo.save(savedOrder);
        }
        return orderCount;
    }

    private int seedCycleCounts(List<Location> locations, List<Product> products, List<Batch> batches, List<Staff> staffMembers) {
        int count = 0;
        LocalDate today = LocalDate.now();
        Staff checker = staffMembers.stream().filter(s -> "checker1".equals(s.getUsername())).findFirst().orElse(staffMembers.get(0));

        // Tạo 5 đợt kiểm kê
        for (int i = 1; i <= 5; i++) {
            CycleCountPlan plan = new CycleCountPlan();
            plan.setPlanCode("CCP-00" + i);
            plan.setCreatedBy(checker.getId());
            plan.setAssignedTo(checker.getId());
            plan.setScheduledDate(today.minusDays(i * 2).atTime(9, 0));
            plan.setNote("Kiểm kê định kỳ");

            String status;
            if (i > 1) {
                status = "COMPLETED";
                plan.setCompletedAt(today.minusDays(i * 2).atTime(16, 0));
            } else {
                status = "CREATED";
            }
            plan.setStatus(status);

            CycleCountPlan savedPlan = cycleCountPlanRepo.save(plan);
            count++;

            // Chọn 3 vị trí ngẫu nhiên để lập chi tiết kiểm kê
            for (int k = 0; k < 3; k++) {
                Location loc = locations.get(random.nextInt(locations.size()));
                
                // Lấy tồn kho tại vị trí này (nếu có)
                List<Inventory> stockList = inventoryRepo.findAll().stream()
                        .filter(inv -> inv.getLocationId().equals(loc.getId()))
                        .toList();

                if (stockList.isEmpty()) {
                    // Nếu vị trí trống, kiểm kê sản phẩm ngẫu nhiên với systemQty = 0
                    Product p = products.get(random.nextInt(products.size()));
                    Batch b = batches.stream().filter(bt -> bt.getProductId().equals(p.getId())).findFirst().orElse(batches.get(0));

                    CycleCountDetail ccd = new CycleCountDetail();
                    ccd.setPlanId(savedPlan.getId());
                    ccd.setLocationId(loc.getId());
                    ccd.setProductId(p.getId());
                    ccd.setBatchId(b.getId());
                    ccd.setSystemQty(BigDecimal.ZERO);
                    ccd.setCountedQty(BigDecimal.ZERO);
                    ccd.setVariance(BigDecimal.ZERO);
                    ccd.setNote("Vị trí trống, khớp.");
                    cycleCountDetailRepo.save(ccd);
                } else {
                    Inventory inv = stockList.get(0);
                    BigDecimal systemQty = inv.getQuantityOnHand();
                    
                    BigDecimal countedQty = systemQty;
                    // Tạo một số sai lệch (20% khả năng)
                    BigDecimal variance = BigDecimal.ZERO;
                    String note = "Khớp thực tế";
                    if (random.nextInt(10) < 2 && "COMPLETED".equals(status)) {
                        int diff = -2 + random.nextInt(5); // -2 đến +2
                        if (diff != 0) {
                            countedQty = systemQty.add(new BigDecimal(diff)).max(BigDecimal.ZERO);
                            variance = countedQty.subtract(systemQty);
                            note = "Sai lệch " + (diff > 0 ? "+" : "") + diff + " sản phẩm";

                            // Cập nhật lại tồn thực tế & Transaction điều chỉnh
                            if (diff != 0) {
                                inv.setQuantityOnHand(countedQty);
                                inventoryRepo.save(inv);

                                InventoryTransaction tx = new InventoryTransaction();
                                tx.setProductId(inv.getProductId());
                                tx.setLocationId(inv.getLocationId());
                                tx.setBatchId(inv.getBatchId());
                                tx.setTransactionType("ADJUSTMENT");
                                tx.setQuantityChange(variance);
                                tx.setReferenceId(savedPlan.getId());
                                tx.setCreatedBy(checker.getId());
                                tx.setCreatedAt(savedPlan.getCompletedAt());
                                transactionRepo.save(tx);
                            }
                        }
                    }

                    CycleCountDetail ccd = new CycleCountDetail();
                    ccd.setPlanId(savedPlan.getId());
                    ccd.setLocationId(loc.getId());
                    ccd.setProductId(inv.getProductId());
                    ccd.setBatchId(inv.getBatchId());
                    ccd.setSystemQty(systemQty);
                    ccd.setCountedQty(countedQty);
                    ccd.setVariance(variance);
                    ccd.setNote(note);
                    cycleCountDetailRepo.save(ccd);
                }
            }
        }
        return count;
    }

    private BigDecimal getBasePriceBySku(String sku) {
        switch (sku) {
            case "IPH15": return new BigDecimal("25000000");
            case "SAMS24": return new BigDecimal("22000000");
            case "SONYXM5": return new BigDecimal("6500000");
            case "DELLXPS": return new BigDecimal("35000000");
            case "HAHA": return new BigDecimal("180000");
            case "THTRUE": return new BigDecimal("30000");
            case "SIMPLY": return new BigDecimal("50000");
            case "ST25": return new BigDecimal("35000");
            case "LOCKNLOC": return new BigDecimal("250000");
            case "PANADRY": return new BigDecimal("350000");
            case "CUCKOO": return new BigDecimal("2200000");
            case "SENKOFAN": return new BigDecimal("400000");
            case "SENKAFACE": return new BigDecimal("90000");
            case "ANESSA": return new BigDecimal("450000");
            case "PANTENE": return new BigDecimal("130000");
            case "LIFEBUOY": return new BigDecimal("140000");
            case "MASK3D": return new BigDecimal("45000");
            case "HANDSAN": return new BigDecimal("65000");
            case "COTTON": return new BigDecimal("25000");
            case "ALCOHOL": return new BigDecimal("15000");
            default: return new BigDecimal("50000");
        }
    }
}
