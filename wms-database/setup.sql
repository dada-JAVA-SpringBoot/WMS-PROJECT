-- ==============================================================================
-- DATABASE WMS - BẢN CHUẨN HÓA KIẾN TRÚC VÀ LOGIC (FULL SAMPLE DATA & CORRECT PASSWORDS)
-- ==============================================================================
IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'WMS_DB')
BEGIN
    CREATE DATABASE WMS_DB;
END
GO
USE WMS_DB;
GO

-- 1. BẢNG DANH MỤC ĐỐI TÁC
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Suppliers')
BEGIN
    CREATE TABLE Suppliers (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        SupplierCode VARCHAR(50) UNIQUE NOT NULL,
        Name NVARCHAR(255) NOT NULL,
        Phone VARCHAR(20),
        Address NVARCHAR(500),
        TotalImportQuantity INT DEFAULT 0
    );
END

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Customers')
BEGIN
    CREATE TABLE Customers (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        CustomerCode VARCHAR(50) UNIQUE NOT NULL,
        Name NVARCHAR(255) NOT NULL,
        Phone VARCHAR(20),
        Address NVARCHAR(500)
    );
END

-- 2. BẢNG DANH MỤC MASTER CHO SẢN PHẨM
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'ProductCategories')
BEGIN
    CREATE TABLE ProductCategories (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        CategoryCode VARCHAR(50) UNIQUE NOT NULL,
        Name NVARCHAR(255) NOT NULL,
        Description NVARCHAR(500),
        IsActive BIT DEFAULT 1
    );
END

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'ProductUnits')
BEGIN
    CREATE TABLE ProductUnits (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        UnitCode VARCHAR(50) UNIQUE NOT NULL,
        Name NVARCHAR(255) NOT NULL,
        Description NVARCHAR(500),
        IsActive BIT DEFAULT 1
    );
END

-- 3. BẢNG SẢN PHẨM
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Products')
BEGIN
    CREATE TABLE Products (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        Sku VARCHAR(50) UNIQUE NOT NULL,
        Barcode VARCHAR(100),
        Name NVARCHAR(255) NOT NULL,
        BaseUnit NVARCHAR(50) NOT NULL,
        CategoryId INT FOREIGN KEY REFERENCES ProductCategories(Id),
        CreatedAt DATETIME2 DEFAULT GETDATE(),
        Weight DECIMAL(10,2) NULL,
        Length DECIMAL(10,2) NULL,
        Width DECIMAL(10,2) NULL,
        Height DECIMAL(10,2) NULL,
        StorageTemp NVARCHAR(50) DEFAULT N'Bình thường',
        SafetyStock INT DEFAULT 0,
        IsFragile BIT DEFAULT 0,
        ImageUrl NVARCHAR(MAX) NULL,
        Status VARCHAR(20) DEFAULT 'ACTIVE'
    );
END

-- 3.1 BẢNG QUY ĐỔI ĐƠN VỊ SẢN PHẨM
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'ProductUnitConversions')
BEGIN
    CREATE TABLE ProductUnitConversions (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        ProductId INT NOT NULL FOREIGN KEY REFERENCES Products(Id),
        UnitName NVARCHAR(50) NOT NULL,
        ConversionFactor DECIMAL(18,4) NOT NULL,
        IsDefault BIT DEFAULT 0,
        CreatedAt DATETIME2 DEFAULT GETDATE(),
        CONSTRAINT UQ_Product_Unit UNIQUE (ProductId, UnitName)
    );
END

-- 4. BẢNG TRUNG GIAN SẢN PHẨM & NHÀ CUNG CẤP (N-N)
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'ProductSuppliers')
BEGIN
    CREATE TABLE ProductSuppliers (
        ProductId INT FOREIGN KEY REFERENCES Products(Id),
        SupplierId INT FOREIGN KEY REFERENCES Suppliers(Id),
        IsDefault BIT DEFAULT 0,
        PRIMARY KEY (ProductId, SupplierId)
    );
END

-- 5. BẢNG QUẢN LÝ LÔ HÀNG
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Batches')
BEGIN
    CREATE TABLE Batches (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        ProductId INT NOT NULL FOREIGN KEY REFERENCES Products(Id),
        BatchCode VARCHAR(100) NOT NULL,
        ManufactureDate DATE,
        ExpiryDate DATE NOT NULL,
        CreatedAt DATETIME2 DEFAULT GETDATE(),
        CONSTRAINT UQ_Product_Batch UNIQUE (ProductId, BatchCode)
    );
END

-- 6. BẢNG KHO VÀ VỊ TRÍ
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Warehouses')
BEGIN
    CREATE TABLE Warehouses (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        WarehouseCode VARCHAR(50) UNIQUE NOT NULL,
        Name NVARCHAR(255) NOT NULL,
        Address NVARCHAR(500)
    );
END

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Locations')
BEGIN
    CREATE TABLE Locations (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        WarehouseId INT NOT NULL FOREIGN KEY REFERENCES Warehouses(Id),
        Zone NVARCHAR(50), Aisle NVARCHAR(50), Rack NVARCHAR(50), Level NVARCHAR(50),
        BinCode VARCHAR(50) UNIQUE NOT NULL,
        Capacity DECIMAL(18,2) DEFAULT 100,
        StorageType NVARCHAR(20) DEFAULT N'NORMAL',
        ContainerType NVARCHAR(20) DEFAULT N'THUNG'
    );
END

-- 7. BẢNG TỒN KHO THỰC TẾ
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Inventory')
BEGIN
    CREATE TABLE Inventory (
        Id BIGINT IDENTITY(1,1) PRIMARY KEY,
        ProductId INT NOT NULL FOREIGN KEY REFERENCES Products(Id),
        LocationId INT NOT NULL FOREIGN KEY REFERENCES Locations(Id),
        BatchId INT NOT NULL FOREIGN KEY REFERENCES Batches(Id),
        QuantityOnHand DECIMAL(18,2) DEFAULT 0,
        QuantityAllocated DECIMAL(18,2) DEFAULT 0,
        LastUpdated DATETIME2 DEFAULT GETDATE(),
        CONSTRAINT UQ_Inventory_Stock UNIQUE (ProductId, LocationId, BatchId)
    );
END

-- 8. BẢNG SỔ KHO LỊCH SỬ (AUDIT)
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'InventoryTransactions')
BEGIN
    CREATE TABLE InventoryTransactions (
        Id BIGINT IDENTITY(1,1) PRIMARY KEY,
        ProductId INT NOT NULL FOREIGN KEY REFERENCES Products(Id),
        LocationId INT NOT NULL FOREIGN KEY REFERENCES Locations(Id),
        BatchId INT NOT NULL FOREIGN KEY REFERENCES Batches(Id),
        TransactionType VARCHAR(20) NOT NULL,
        QuantityChange DECIMAL(18,2) NOT NULL,
        ReferenceId BIGINT,
        CreatedBy INT,
        CreatedAt DATETIME2 DEFAULT GETDATE()
    );
END

-- 9. BẢNG GIAO DỊCH NHẬP KHO
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'InboundOrders')
BEGIN
    CREATE TABLE InboundOrders (
        Id BIGINT IDENTITY(1,1) PRIMARY KEY,
        ReceiptCode VARCHAR(50) UNIQUE NOT NULL,
        SupplierId INT FOREIGN KEY REFERENCES Suppliers(Id),
        ReferenceNumber VARCHAR(100),
        Status VARCHAR(20) DEFAULT 'DRAFT',
        ReceiptDate DATETIME2,
        TotalAmount DECIMAL(18, 2) DEFAULT 0,
        CreatedBy INT,
        CreatedAt DATETIME2 DEFAULT GETDATE()
    );
END

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'InboundOrderDetails')
BEGIN
    CREATE TABLE InboundOrderDetails (
        Id BIGINT IDENTITY(1,1) PRIMARY KEY,
        InboundOrderId BIGINT NOT NULL FOREIGN KEY REFERENCES InboundOrders(Id),
        ProductId INT NOT NULL FOREIGN KEY REFERENCES Products(Id),
        BatchId INT NOT NULL FOREIGN KEY REFERENCES Batches(Id),
        LocationId INT NOT NULL FOREIGN KEY REFERENCES Locations(Id),
        Quantity DECIMAL(18,2) NOT NULL,
        QuantityExpected DECIMAL(18,2) DEFAULT 0,
        UnitPrice DECIMAL(18, 2) DEFAULT 0,
        ItemCondition NVARCHAR(100) DEFAULT N'Bình thường',
        TotalPrice AS (Quantity * UnitPrice)
    );
END

-- 10. BẢNG PHIẾU XUẤT KHO
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'OutboundOrders')
BEGIN
    CREATE TABLE OutboundOrders (
        Id BIGINT IDENTITY(1,1) PRIMARY KEY,
        IssueCode VARCHAR(50) UNIQUE NOT NULL,
        CustomerId INT FOREIGN KEY REFERENCES Customers(Id),
        Status VARCHAR(20) DEFAULT 'DRAFT',
        IssueDate DATETIME2,
        TotalAmount DECIMAL(18, 2) DEFAULT 0,
        Note NVARCHAR(500),
        CreatedBy INT,
        CreatedAt DATETIME2 DEFAULT GETDATE()
    );
END

-- 11. CHI TIẾT PHIẾU XUẤT KHO
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'OutboundOrderDetails')
BEGIN
    CREATE TABLE OutboundOrderDetails (
        Id BIGINT IDENTITY(1,1) PRIMARY KEY,
        OutboundOrderId BIGINT NOT NULL FOREIGN KEY REFERENCES OutboundOrders(Id),
        ProductId INT NOT NULL FOREIGN KEY REFERENCES Products(Id),
        BatchId INT NOT NULL FOREIGN KEY REFERENCES Batches(Id),
        LocationId INT NOT NULL FOREIGN KEY REFERENCES Locations(Id),
        Quantity DECIMAL(18,2) NOT NULL,
        UnitPrice DECIMAL(18, 2) DEFAULT 0
    );
END

-- 12. BẢNG PHÂN QUYỀN
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Roles')
BEGIN
    CREATE TABLE Roles (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        RoleName VARCHAR(50) UNIQUE NOT NULL,
        Description NVARCHAR(255) NULL
    );
END

-- 13. BẢNG CA LÀM VIỆC
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'WorkShifts')
BEGIN
    CREATE TABLE WorkShifts (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        ShiftName NVARCHAR(100) NOT NULL,
        StartTime TIME NOT NULL,
        EndTime TIME NOT NULL,
        GracePeriodMinutes INT DEFAULT 15
    );
END

-- 14. BẢNG NHÂN SỰ
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Staff')
BEGIN
    CREATE TABLE Staff (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        EmployeeCode VARCHAR(50) UNIQUE NOT NULL,
        FullName NVARCHAR(255) NOT NULL,
        Gender VARCHAR(10) NOT NULL DEFAULT 'MALE',
        DateOfBirth DATE NULL,
        Phone VARCHAR(20) NULL,
        Email VARCHAR(255) NULL,
        HireDate DATE NOT NULL DEFAULT CAST(GETDATE() AS DATE),
        ContractType VARCHAR(20) NOT NULL DEFAULT 'FULL_TIME',
        WarehouseRole VARCHAR(30) NOT NULL DEFAULT 'INBOUND_STAFF',
        WorkStatus VARCHAR(20) NOT NULL DEFAULT 'OFF_SHIFT',
        Notes NVARCHAR(500) NULL,
        Username VARCHAR(100) UNIQUE NOT NULL,
        Password VARCHAR(255) NOT NULL,
        Enabled BIT NOT NULL DEFAULT 1,
        Avatar NVARCHAR(500) DEFAULT 'default',
        ShiftId INT NULL FOREIGN KEY REFERENCES WorkShifts(Id),
        LastActiveAt DATETIME2 NULL,
        CreatedAt DATETIME2 DEFAULT GETDATE()
    );
END
ELSE
BEGIN
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Staff') AND name = 'LastActiveAt')
    BEGIN
        ALTER TABLE Staff ADD LastActiveAt DATETIME2 NULL;
    END
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Staff') AND name = 'Avatar')
    BEGIN
        ALTER TABLE Staff ADD Avatar NVARCHAR(500) DEFAULT 'default';
    END
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Staff') AND name = 'ShiftId')
    BEGIN
        ALTER TABLE Staff ADD ShiftId INT NULL FOREIGN KEY REFERENCES WorkShifts(Id);
    END
END

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Staff_Roles')
BEGIN
    CREATE TABLE Staff_Roles (
        StaffId INT NOT NULL FOREIGN KEY REFERENCES Staff(Id),
        RoleId  INT NOT NULL FOREIGN KEY REFERENCES Roles(Id),
        PRIMARY KEY (StaffId, RoleId)
    );
END

-- 15. BẢNG CHẤM CÔNG
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Attendance')
BEGIN
    CREATE TABLE Attendance (
        Id BIGINT IDENTITY(1,1) PRIMARY KEY,
        StaffId INT NOT NULL FOREIGN KEY REFERENCES Staff(Id),
        WorkDate DATE NOT NULL,
        CheckInTime DATETIME2,
        CheckOutTime DATETIME2,
        LateMinutes INT DEFAULT 0,
        OvertimeMinutes INT DEFAULT 0,
        Status VARCHAR(20), -- PRESENT, LATE, ABSENT, ON_LEAVE
        LateReason NVARCHAR(MAX),
        ApprovalStatus VARCHAR(20), -- PENDING, APPROVED, REJECTED
        Note NVARCHAR(500)
    );
END
GO

-- CHỈ MỤC
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Batches_ExpiryDate')
    CREATE NONCLUSTERED INDEX IX_Batches_ExpiryDate ON Batches(ExpiryDate ASC);
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Inventory_Lookup')
    CREATE NONCLUSTERED INDEX IX_Inventory_Lookup ON Inventory(ProductId, LocationId, BatchId);
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Staff_WorkStatus')
    CREATE NONCLUSTERED INDEX IX_Staff_WorkStatus ON Staff(WorkStatus);
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Attendance_Date')
    CREATE NONCLUSTERED INDEX IX_Attendance_Date ON Attendance(WorkDate);
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Attendance_Staff')
    CREATE NONCLUSTERED INDEX IX_Attendance_Staff ON Attendance(StaffId);
GO

-- ==============================================================================
-- INSERT DỮ LIỆU MẪU (FULL DATA - DOCKER SAFE)
-- ==============================================================================

-- 1. Suppliers
IF NOT EXISTS (SELECT 1 FROM Suppliers)
BEGIN
    INSERT INTO Suppliers (SupplierCode, Name, Phone, Address) VALUES
    ('SUP-VNM', N'Công ty CP Sữa Việt Nam (Vinamilk)', '0281234567', N'Quận 7, TP.HCM'),
    ('SUP-MSN', N'Tập đoàn Masan', '0287654321', N'Quận 1, TP.HCM'),
    ('SUP-SS', N'Samsung Electronics VN', '0909123456', N'KCNC Quận 9, TP.HCM'),
    ('SUP-CP', N'Công ty CP Chăn Nuôi C.P', '0988777666', N'Biên Hòa, Đồng Nai');
END

-- 2. Customers
IF NOT EXISTS (SELECT 1 FROM Customers)
BEGIN
    INSERT INTO Customers (CustomerCode, Name, Phone, Address) VALUES
    ('CUS-WIN', N'Chuỗi siêu thị WinMart', '19008888', N'Hai Bà Trưng, Hà Nội'),
    ('CUS-COOP', N'Siêu thị Co.opmart', '19005555', N'Quận 1, TP.HCM');
END

-- 3. ProductCategories
IF NOT EXISTS (SELECT 1 FROM ProductCategories)
BEGIN
    INSERT INTO ProductCategories (CategoryCode, Name, Description) VALUES
    ('CAT-SUA', N'Sữa & đồ uống dinh dưỡng', N'Sữa tươi, sữa hộp, đồ uống dinh dưỡng'),
    ('CAT-GIAVI', N'Gia vị & thực phẩm chế biến', N'Nước mắm, gia vị, đồ ăn chế biến'),
    ('CAT-DT', N'Điện tử', N'Smartphone, TV, thiết bị điện tử'),
    ('CAT-TUOI', N'Thịt, trứng & hàng tươi', N'Hàng tươi, thịt, trứng, thực phẩm lạnh'),
    ('CAT-KHO', N'Mì & đồ khô', N'Mì gói, thực phẩm khô, nguyên liệu đóng gói'),
    ('CAT-DH', N'Đồ hộp & hải sản', N'Đồ hộp, cá ngừ, thực phẩm đóng hộp');
END

-- 4. ProductUnits
IF NOT EXISTS (SELECT 1 FROM ProductUnits)
BEGIN
    INSERT INTO ProductUnits (UnitCode, Name, Description) VALUES
    ('UNIT-HOP', N'Hộp', N'Đơn vị đóng gói cơ bản'),
    ('UNIT-CHAI', N'Chai', N'Đơn vị cho hàng dạng lỏng'),
    ('UNIT-CAI', N'Cái', N'Đơn vị đếm theo chiếc'),
    ('UNIT-KHAY', N'Khay', N'Đơn vị cho khay/hộp khay'),
    ('UNIT-LOC', N'Lốc', N'Đơn vị pack nhỏ'),
    ('UNIT-THUNG', N'Thùng', N'Đơn vị kiện lớn'),
    ('UNIT-VI', N'Vỉ', N'Đơn vị dạng vỉ'),
    ('UNIT-GOI', N'Gói', N'Đơn vị bao gói'),
    ('UNIT-KG', N'Kg', N'Đơn vị khối lượng'),
    ('UNIT-PALLET', N'Pallet', N'Đơn vị kiện pallet');
END

-- 5. Warehouses & Locations
IF NOT EXISTS (SELECT 1 FROM Warehouses)
BEGIN
    INSERT INTO Warehouses (WarehouseCode, Name, Address) VALUES ('WH-MAIN', N'Kho Tổng Trung Tâm', N'KCN Tân Bình, TP.HCM');
END

IF NOT EXISTS (SELECT 1 FROM Locations)
BEGIN
    INSERT INTO Locations (WarehouseId, Zone, Aisle, Rack, Level, BinCode, Capacity, StorageType, ContainerType) VALUES
    (1, 'A', '01', '01', '1', 'WH1-A-01-01-1', 1000, N'NORMAL', N'PALLET'),
    (1, 'A', '01', '01', '2', 'WH1-A-01-01-2', 1000, N'NORMAL', N'THUNG'),
    (1, 'A', '01', '02', '1', 'WH1-A-01-02-1', 1000, N'NORMAL', N'THUNG'),
    (1, 'A', '01', '02', '2', 'WH1-A-01-02-2', 1000, N'NORMAL', N'THUNG'),
    (1, 'B', '01', '01', '1', 'WH1-B-01-01-1', 500, N'NORMAL', N'LOC'),
    (1, 'B', '01', '01', '2', 'WH1-B-01-01-2', 500, N'NORMAL', N'LOC'),
    (1, 'B', '01', '02', '1', 'WH1-B-01-02-1', 500, N'NORMAL', N'GOI'),
    (1, 'B', '02', '01', '1', 'WH1-B-02-01-1', 500, N'NORMAL', N'KG'),
    (1, 'C', '01', '01', '1', 'WH1-COLD-01-01-1', 300, N'COLD', N'KHAY'),
    (1, 'C', '01', '01', '2', 'WH1-COLD-01-01-2', 300, N'COLD', N'KHAY'),
    (1, 'D', '01', '01', '1', 'WH1-CHILL-01-01-1', 300, N'CHILLED', N'KHAY'),
    (1, 'E', '01', '01', '1', 'WH1-FROZEN-01-01-1', 200, N'FROZEN', N'KHAY'),
    (1, 'F', '01', '01', '1', 'WH1-QUAR-01-01-1', 200, N'QUARANTINE', N'KHAY');
END

-- 6. Products
IF NOT EXISTS (SELECT 1 FROM Products)
BEGIN
    INSERT INTO Products (Sku, Barcode, Name, BaseUnit, CategoryId, Weight, Length, Width, Height, StorageTemp, SafetyStock, IsFragile, ImageUrl, Status) VALUES
    ('MILK-1L', '89301', N'Sữa tươi Vinamilk 1L', N'Hộp', 1, 1.05, 10, 7, 20, N'Bình thường', 500, 0, 'https://cdn.tgdd.vn/Products/Images/2386/79312/bhx/sua-tuoi-tiet-trung-co-duong-vinamilk-100-sua-tuoi-hop-1-lit-202403281405409207.jpg', 'ACTIVE'),
    ('CHINSU-1', '89302', N'Nước mắm Chinsu 500ml', N'Chai', 2, 0.6, 6, 6, 25, N'Bình thường', 300, 1, 'https://cdn.tgdd.vn/Products/Images/2289/209456/bhx/nuoc-mam-huong-ca-hoi-hao-hang-chinsu-12-do-dam-chai-500ml-202309211050423407.jpg', 'ACTIVE'),
    ('TV-65', '89303', N'Smart TV Samsung 65"', N'Cái', 3, 25.0, 145, 15, 85, N'Bình thường', 10, 1, 'https://cdn2.cellphones.com.vn/insecure/rs:fill:358:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/s/m/smart-tivi-samsung-qled-65q6fa-4k-65-inch.png', 'ACTIVE'),
    ('PORK-CP', '89304', N'Thịt heo CP (Khay 500g)', N'Khay', 4, 0.5, 20, 15, 3, N'Kho Lạnh', 100, 0, 'https://cdnv2.tgdd.vn/bhx-static/bhx/production/2026/1/image/production/2026/1/image/Products/8781/344531/suon-non-heo-cp-300g_202601300958028317.jpg', 'ACTIVE'),
    ('MILK-180', '89305', N'Sữa tươi Vinamilk 180ml', N'Lốc', 1, 0.8, 15, 10, 12, N'Bình thường', 200, 0, 'https://cdnv2.tgdd.vn/bhx-static/bhx/production/2025/12/image/Products/Images/2386/85844/bhx/thung-48-hop-sua-tuoi-tiet-trung-vinamilk-100-sua-tuoi-co-duong-180ml_202512221131120525.jpg', 'ACTIVE'),
    ('NOODLE-O', '89306', N'Mì Omachi (Thùng 30 gói)', N'Thùng', 5, 2.5, 40, 30, 20, N'Bình thường', 400, 0, 'https://cdn.tgdd.vn/Products/Images/2565/175895/bhx/thung-30-goi-mi-khoai-tay-omachi-xot-bo-ham-80g-202303141450332772.jpg', 'ACTIVE'),
    ('EGG-CP', '89307', N'Trứng gà CP (Vỉ 10)', N'Vỉ', 4, 0.6, 25, 10, 7, N'Bình thường', 100, 1, 'https://cdn.tgdd.vn/Products/Images/8783/228775/bhx/hop-10-trung-ga-tuoi-qlegg-202011040900362921.jpg', 'ACTIVE'),
    ('PHONE-SS', '89308', N'Samsung Galaxy S24', N'Cái', 3, 0.2, 15, 7, 1, N'Bình thường', 50, 1, 'https://cdn2.cellphones.com.vn/insecure/rs:fill:358:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/s/2/s24-thumb.png', 'ACTIVE'),
    ('SAUSAGE', '89309', N'Xúc xích CP tiệt trùng', N'Gói', 4, 0.2, 10, 5, 2, N'Kho Mát', 150, 0, 'https://cdn.tgdd.vn/Products/Images/3507/89851/bhx/xuc-xich-heo-tiet-trung-cp-goi-200g-202208220808364009.jpg', 'ACTIVE'),
    ('TUNA-01', '89310', N'Cá ngừ đóng hộp', N'Hộp', 6, 0.2, 8, 8, 4, N'Bình thường', 300, 0, 'https://product.hstatic.net/1000282430/product/century-tuna-with-vegetable-oil-184g-_b3b36dcdab9c4690af88963d93d9f3cd_grande.jpg', 'INACTIVE');

    INSERT INTO ProductSuppliers (ProductId, SupplierId) VALUES (1, 1), (5, 1), (2, 2), (6, 2), (3, 3), (8, 3), (4, 4), (7, 4), (9, 4), (10, 2);

    INSERT INTO ProductUnitConversions (ProductId, UnitName, ConversionFactor) VALUES
    (1, N'Lốc', 4), (1, N'Thùng', 12), (2, N'Thùng', 24), (3, N'Thùng', 1), (3, N'Pallet', 10), (4, N'Thùng', 20), (5, N'Thùng', 48), (6, N'Gói', 0.0333), (7, N'Thùng', 30), (8, N'Thùng', 10), (8, N'Pallet', 100), (9, N'Thùng', 50);
END

-- 7. Batches & Inventory
IF NOT EXISTS (SELECT 1 FROM Batches)
BEGIN
    INSERT INTO Batches (ProductId, BatchCode, ManufactureDate, ExpiryDate) VALUES
    (1, 'LOT-M1-OLD', '2023-01-01', '2023-07-01'), (1, 'LOT-M1-NEW', '2024-01-01', '2024-07-01'), (2, 'LOT-C1-001', '2023-12-01', '2024-12-01'), (3, 'LOT-TV-001', '2024-01-10', '2034-01-10'), (4, 'LOT-P-001', '2024-03-01', '2024-03-15'), (5, 'LOT-M180-A', '2024-02-01', '2024-08-01'), (5, 'LOT-M180-B', '2024-03-01', '2024-09-01'), (6, 'LOT-OMC-1', '2024-01-01', '2024-10-01'), (7, 'LOT-EGG-1', '2024-04-01', '2024-04-20'), (8, 'LOT-S24-1', '2024-02-15', '2034-02-15'), (9, 'LOT-XX-1', '2024-01-20', '2024-06-20'), (10,'LOT-TUN-1','2023-10-01', '2026-10-01');

    INSERT INTO Inventory (ProductId, LocationId, BatchId, QuantityOnHand, QuantityAllocated) VALUES
    (1, 1, 1, 100, 0), (1, 2, 2, 400, 50), (2, 3, 3, 300, 100), (3, 4, 4, 20, 2), (4, 9, 5, 50, 0), (4, 10, 5, 40, 5), (5, 5, 6, 200, 0), (5, 6, 7, 300, 20), (6, 2, 8, 400, 0), (7, 3, 9, 80, 15), (7, 11, 9, 60, 10), (8, 4, 10, 45, 5), (9, 5, 11, 150, 0), (9, 11, 11, 100, 0), (10, 6, 12, 200, 0);

    INSERT INTO InventoryTransactions (ProductId, LocationId, BatchId, TransactionType, QuantityChange)
    SELECT ProductId, LocationId, BatchId, 'INBOUND', QuantityOnHand FROM Inventory;
END

-- 8. Orders
IF NOT EXISTS (SELECT 1 FROM InboundOrders)
BEGIN
    INSERT INTO InboundOrders (ReceiptCode, SupplierId, ReferenceNumber, Status, ReceiptDate, TotalAmount, CreatedBy) VALUES
    ('PN-2401-001', 1, 'PO-2401-001', 'COMPLETED', '2024-01-05', 6245000, 1), ('PN-2402-002', 2, 'PO-2402-002', 'COMPLETED', '2024-02-10', 14800000, 2), ('PN-2404-001', 1, 'PO-2404-001', 'IN_TRANSIT', DATEADD(day, 5, GETDATE()), 6245000, 1), ('PN-2404-002', 4, 'PO-2404-002', 'ORDERED', DATEADD(day, 9, GETDATE()), 14800000, 2), ('PN-2405-001', 2, 'PO-2405-001', 'DRAFT', GETDATE(), 250000, 2), ('PN-2405-002', 3, 'PO-2405-002', 'ORDERED', DATEADD(day, 7, GETDATE()), 1800000, 3), ('PN-2406-001', 4, 'PO-2406-001', 'IN_TRANSIT', DATEADD(day, 3, GETDATE()), 2340000, 3);

    INSERT INTO InboundOrderDetails (InboundOrderId, ProductId, BatchId, LocationId, Quantity, QuantityExpected, UnitPrice, ItemCondition) VALUES
    (3, 1, 2, 2, 250, 250, 12500, N'Bình thường'), (3, 5, 7, 2, 600, 600, 5200, N'Bình thường'), (4, 4, 5, 1, 120, 120, 78000, N'Bình thường'), (4, 7, 9, 1, 160, 160, 34000, N'Bình thường'), (5, 6, 8, 1, 50, 50, 5000, N'Bình thường'), (6, 2, 3, 5, 100, 100, 18000, N'Bình thường'), (7, 4, 5, 9, 30, 30, 78000, N'Bình thường');
END

IF NOT EXISTS (SELECT 1 FROM OutboundOrders)
BEGIN
    INSERT INTO OutboundOrders (IssueCode, CustomerId, Status, IssueDate, TotalAmount, Note) VALUES ('OUT-2404-W01', 1, 'ALLOCATED', GETDATE(), 500000, N'Đơn hàng mẫu');
    INSERT INTO OutboundOrderDetails (OutboundOrderId, ProductId, BatchId, LocationId, Quantity, UnitPrice) VALUES
    (1, 1, 2, 2, 50, 10000), (1, 2, 3, 1, 100, 5000), (1, 3, 4, 3, 2, 200000), (1, 5, 7, 2, 20, 5000), (1, 7, 9, 2, 15, 3000), (1, 8, 10, 3, 5, 150000);
END

-- 9. Roles
IF NOT EXISTS (SELECT 1 FROM Roles)
BEGIN
    INSERT INTO Roles (RoleName, Description) VALUES
    ('ADMIN',           N'Quản trị hệ thống toàn quyền'),
    ('MANAGER',         N'Quản lý kho — xem báo cáo, duyệt phiếu'),
    ('ACCOUNTANT',      N'Kế toán kho — quản lý giá vốn, chi phí, doanh thu'),
    ('STOREKEEPER',     N'Thủ kho — quản lý sơ đồ vị trí và lô hàng'),
    ('HANDLER',         N'Nhân viên điều chuyển — di chuyển hàng nội bộ'),
    ('INBOUND_STAFF',   N'Nhân viên nhập kho'),
    ('OUTBOUND_STAFF',  N'Nhân viên xuất kho'),
    ('CHECKER',         N'Kiểm kê viên'),
    ('INTERN',          N'Thực tập sinh — quyền hạn hạn chế');
END

-- 10. WorkShifts
IF NOT EXISTS (SELECT 1 FROM WorkShifts)
BEGIN
    INSERT INTO WorkShifts (ShiftName, StartTime, EndTime, GracePeriodMinutes) VALUES
    (N'Ca hành chính', '08:00:00', '17:30:00', 15),
    (N'Ca sáng', '06:00:00', '14:00:00', 10),
    (N'Ca chiều', '14:00:00', '22:00:00', 10);
END

-- 11. Staff (Mật khẩu chuẩn Admin@123 cho tất cả)
-- Xóa data cũ để tạo bộ khung chuyên nghiệp khi khởi tạo
DELETE FROM Staff_Roles;
DELETE FROM Staff;

INSERT INTO Staff (EmployeeCode, FullName, Username, Password, Enabled, WarehouseRole, WorkStatus, ContractType, ShiftId)
VALUES 
('EMP-ADMIN', N'Hệ Thống Admin', 'admin', '$2a$10$IS2milLlKmbykA2gf6hf4.hP8F.tQ1mwCXZYhh5cWcqoMF7Iu5fb2', 1, 'WAREHOUSE_MANAGER', 'OFF_SHIFT', 'PERMANENT', 1),
('EMP-MGR01', N'Trần Quang Quản Lý', 'manager_01', '$2a$10$IS2milLlKmbykA2gf6hf4.hP8F.tQ1mwCXZYhh5cWcqoMF7Iu5fb2', 1, 'WAREHOUSE_MANAGER', 'OFF_SHIFT', 'PERMANENT', 1),
('EMP-ACC01', N'Lê Mai Kế Toán', 'accountant_01', '$2a$10$IS2milLlKmbykA2gf6hf4.hP8F.tQ1mwCXZYhh5cWcqoMF7Iu5fb2', 1, 'ACCOUNTANT', 'OFF_SHIFT', 'PERMANENT', 1),
('EMP-SK01',  N'Vũ Trọng Thủ Kho', 'storekeeper_01', '$2a$10$IS2milLlKmbykA2gf6hf4.hP8F.tQ1mwCXZYhh5cWcqoMF7Iu5fb2', 1, 'WAREHOUSE_KEEPER', 'OFF_SHIFT', 'PERMANENT', 2),
('EMP-IN01',  N'Hoàng Văn Nhập', 'inbound_01', '$2a$10$IS2milLlKmbykA2gf6hf4.hP8F.tQ1mwCXZYhh5cWcqoMF7Iu5fb2', 1, 'INBOUND_STAFF', 'OFF_SHIFT', 'PERMANENT', 2),
('EMP-OUT01', N'Nguyễn Văn Xuất', 'outbound_01', '$2a$10$IS2milLlKmbykA2gf6hf4.hP8F.tQ1mwCXZYhh5cWcqoMF7Iu5fb2', 1, 'OUTBOUND_STAFF', 'OFF_SHIFT', 'PERMANENT', 3),
('EMP-HD01',  N'Phạm Văn Chuyển', 'handler_01', '$2a$10$IS2milLlKmbykA2gf6hf4.hP8F.tQ1mwCXZYhh5cWcqoMF7Iu5fb2', 1, 'HANDLER', 'OFF_SHIFT', 'PERMANENT', 3),
('EMP-INT01', N'Bùi Văn Thực Tập 1', 'intern_01', '$2a$10$IS2milLlKmbykA2gf6hf4.hP8F.tQ1mwCXZYhh5cWcqoMF7Iu5fb2', 1, 'INTERN', 'OFF_SHIFT', 'SEASONAL', 2),
('EMP-INT02', N'Đặng Thị Thực Tập 2', 'intern_02', '$2a$10$IS2milLlKmbykA2gf6hf4.hP8F.tQ1mwCXZYhh5cWcqoMF7Iu5fb2', 1, 'INTERN', 'OFF_SHIFT', 'SEASONAL', 3),
('EMP-OFF01', N'Trương Văn Nghỉ', 'retired_staff', '$2a$10$IS2milLlKmbykA2gf6hf4.hP8F.tQ1mwCXZYhh5cWcqoMF7Iu5fb2', 0, 'OUTBOUND_STAFF', 'OFF_SHIFT', 'EXPIRED', NULL);

-- Gán Roles
INSERT INTO Staff_Roles (StaffId, RoleId)
SELECT s.Id, r.Id FROM Staff s, Roles r 
WHERE (s.Username = 'admin' AND r.RoleName = 'ADMIN')
OR (s.Username = 'manager_01' AND r.RoleName = 'MANAGER')
OR (s.Username = 'accountant_01' AND r.RoleName = 'ACCOUNTANT')
OR (s.Username = 'storekeeper_01' AND r.RoleName = 'STOREKEEPER')
OR (s.Username = 'inbound_01' AND r.RoleName = 'INBOUND_STAFF')
OR (s.Username = 'outbound_01' AND r.RoleName = 'OUTBOUND_STAFF')
OR (s.Username = 'handler_01' AND r.RoleName = 'HANDLER')
OR (s.Username LIKE 'intern%' AND r.RoleName = 'INTERN')
OR (s.Username = 'retired_staff' AND r.RoleName = 'OUTBOUND_STAFF');
GO
GO
