-- ==============================================================================
-- DATABASE WMS - BẢN SIÊU CẤP: KHỚP 100% BACKEND + VŨ TRỤ DỮ LIỆU ĐỒ SỘ
-- ==============================================================================
IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'WMS_DB')
BEGIN
    CREATE DATABASE WMS_DB;
END
GO
USE WMS_DB;
GO

-- 0. DỌN DẸP TRIỆT ĐỂ (DROP TABLE THEO THỨ TỰ NGƯỢC)
DROP TABLE IF EXISTS Attendance;
DROP TABLE IF EXISTS InventoryTransactions;
DROP TABLE IF EXISTS Inventory;
DROP TABLE IF EXISTS InboundOrderDetails;
DROP TABLE IF EXISTS InboundOrders;
DROP TABLE IF EXISTS OutboundOrderDetails;
DROP TABLE IF EXISTS OutboundOrders;
DROP TABLE IF EXISTS CycleCountDetails;
DROP TABLE IF EXISTS CycleCountPlans;
DROP TABLE IF EXISTS Waves;
DROP TABLE IF EXISTS Staff_Roles;
DROP TABLE IF EXISTS Staff;
DROP TABLE IF EXISTS WorkShifts;
DROP TABLE IF EXISTS Roles;
DROP TABLE IF EXISTS ProductSuppliers;
DROP TABLE IF EXISTS ProductUnitConversions;
DROP TABLE IF EXISTS Batches;
DROP TABLE IF EXISTS Products;
DROP TABLE IF EXISTS ProductCategories;
DROP TABLE IF EXISTS ProductUnits;
DROP TABLE IF EXISTS Locations;
DROP TABLE IF EXISTS Warehouses;
DROP TABLE IF EXISTS Customers;
DROP TABLE IF EXISTS Suppliers;
GO

-- 1. CẤU TRÚC BẢNG (ĐẢM BẢO KHỚP 100% VỚI ENTITY JAVA)
CREATE TABLE Suppliers (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    SupplierCode VARCHAR(50) UNIQUE NOT NULL,
    Name NVARCHAR(255) NOT NULL,
    Phone VARCHAR(20),
    Address NVARCHAR(500),
    TotalImportQuantity INT DEFAULT 0
);

CREATE TABLE Customers (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    CustomerCode VARCHAR(50) UNIQUE NOT NULL,
    Name NVARCHAR(255) NOT NULL,
    Phone VARCHAR(20),
    Address NVARCHAR(500)
);

CREATE TABLE ProductCategories (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    CategoryCode VARCHAR(50) UNIQUE NOT NULL,
    Name NVARCHAR(255) NOT NULL,
    Description NVARCHAR(500),
    IsActive BIT DEFAULT 1
);

CREATE TABLE ProductUnits (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    UnitCode VARCHAR(50) UNIQUE NOT NULL,
    Name NVARCHAR(255) NOT NULL,
    Description NVARCHAR(500),
    IsActive BIT DEFAULT 1
);

CREATE TABLE Products (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Sku VARCHAR(50) UNIQUE NOT NULL,
    Barcode VARCHAR(100),
    Name NVARCHAR(255) NOT NULL,
    BaseUnit NVARCHAR(50) NOT NULL,
    CategoryId INT FOREIGN KEY REFERENCES ProductCategories(Id),
    Weight DECIMAL(10,2) NULL,
    Length DECIMAL(10,2) NULL,
    Width DECIMAL(10,2) NULL,
    Height DECIMAL(10,2) NULL,
    StorageTemp NVARCHAR(50) DEFAULT N'Bình thường',
    SafetyStock INT DEFAULT 0,
    IsFragile BIT DEFAULT 0,
    ImageUrl NVARCHAR(MAX) NULL,
    Status VARCHAR(20) DEFAULT 'ACTIVE',
    CreatedAt DATETIME2 DEFAULT GETDATE()
);

CREATE TABLE ProductSuppliers (
    ProductId INT FOREIGN KEY REFERENCES Products(Id),
    SupplierId INT FOREIGN KEY REFERENCES Suppliers(Id),
    IsDefault BIT DEFAULT 0,
    PRIMARY KEY (ProductId, SupplierId)
);

CREATE TABLE ProductUnitConversions (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    ProductId INT NOT NULL FOREIGN KEY REFERENCES Products(Id),
    UnitName NVARCHAR(50) NOT NULL,
    ConversionFactor DECIMAL(18,4) NOT NULL,
    IsDefault BIT DEFAULT 0,
    CreatedAt DATETIME2 DEFAULT GETDATE()
);

CREATE TABLE Batches (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    ProductId INT NOT NULL FOREIGN KEY REFERENCES Products(Id),
    BatchCode VARCHAR(100) NOT NULL,
    ManufactureDate DATE,
    ExpiryDate DATE NOT NULL,
    CreatedAt DATETIME2 DEFAULT GETDATE()
);

CREATE TABLE Roles (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    RoleName VARCHAR(50) UNIQUE NOT NULL,
    Description NVARCHAR(255) NULL
);

CREATE TABLE WorkShifts (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    ShiftName NVARCHAR(100) NOT NULL,
    StartTime TIME NOT NULL,
    EndTime TIME NOT NULL,
    GracePeriodMinutes INT DEFAULT 15
);

CREATE TABLE Staff (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    EmployeeCode VARCHAR(50) UNIQUE NOT NULL,
    FullName NVARCHAR(255) NOT NULL,
    Gender VARCHAR(10) DEFAULT 'MALE',
    DateOfBirth DATE NULL,
    Phone VARCHAR(20),
    Email VARCHAR(255),
    HireDate DATE DEFAULT CAST(GETDATE() AS DATE),
    ContractType VARCHAR(20) DEFAULT 'FULL_TIME',
    WarehouseRole VARCHAR(30) DEFAULT 'INBOUND_STAFF',
    WorkStatus VARCHAR(20) DEFAULT 'OFF_SHIFT',
    Notes NVARCHAR(500),
    Username VARCHAR(100) UNIQUE NOT NULL,
    Password VARCHAR(255) NOT NULL,
    Enabled BIT DEFAULT 1,
    Avatar NVARCHAR(MAX) DEFAULT 'default',
    ShiftId INT FOREIGN KEY REFERENCES WorkShifts(Id),
    ShiftStartTime TIME NULL,
    ShiftEndTime TIME NULL,
    LastActiveAt DATETIME2 NULL,
    CreatedAt DATETIME2 DEFAULT GETDATE()
);

CREATE TABLE Staff_Roles (
    StaffId INT NOT NULL FOREIGN KEY REFERENCES Staff(Id),
    RoleId  INT NOT NULL FOREIGN KEY REFERENCES Roles(Id),
    PRIMARY KEY (StaffId, RoleId)
);

CREATE TABLE Attendance (
    Id BIGINT IDENTITY(1,1) PRIMARY KEY,
    StaffId INT NOT NULL FOREIGN KEY REFERENCES Staff(Id),
    WorkDate DATE NOT NULL,
    CheckInTime DATETIME2,
    CheckOutTime DATETIME2,
    LateMinutes INT DEFAULT 0,
    OvertimeMinutes INT DEFAULT 0,
    Status VARCHAR(20),
    LateReason NVARCHAR(MAX),
    ApprovalStatus VARCHAR(20),
    Note NVARCHAR(500)
);

CREATE TABLE Warehouses (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    WarehouseCode VARCHAR(50) UNIQUE NOT NULL,
    Name NVARCHAR(255) NOT NULL,
    Address NVARCHAR(500)
);

CREATE TABLE Locations (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    WarehouseId INT NOT NULL FOREIGN KEY REFERENCES Warehouses(Id),
    Zone NVARCHAR(50), Aisle NVARCHAR(50), Rack NVARCHAR(50), Level NVARCHAR(50),
    BinCode VARCHAR(50) UNIQUE NOT NULL,
    Capacity INT DEFAULT 100,
    StorageType NVARCHAR(20) DEFAULT N'NORMAL',
    ContainerType NVARCHAR(20) DEFAULT N'THUNG'
);

CREATE TABLE Inventory (
    Id BIGINT IDENTITY(1,1) PRIMARY KEY,
    ProductId INT NOT NULL FOREIGN KEY REFERENCES Products(Id),
    LocationId INT NOT NULL FOREIGN KEY REFERENCES Locations(Id),
    BatchId INT NOT NULL FOREIGN KEY REFERENCES Batches(Id),
    QuantityOnHand DECIMAL(18,2) DEFAULT 0,
    QuantityAllocated DECIMAL(18,2) DEFAULT 0,
    LastUpdated DATETIME2 DEFAULT GETDATE()
);

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

CREATE TABLE InboundOrders (
    Id BIGINT IDENTITY(1,1) PRIMARY KEY,
    ReceiptCode VARCHAR(50) UNIQUE NOT NULL,
    SupplierId INT FOREIGN KEY REFERENCES Suppliers(Id),
    ReferenceNumber NVARCHAR(100),
    Status VARCHAR(20) DEFAULT 'DRAFT',
    ReceiptDate DATETIME2,
    TotalAmount DECIMAL(18, 2) DEFAULT 0,
    CreatedBy INT,
    CreatedAt DATETIME2 DEFAULT GETDATE()
);

CREATE TABLE InboundOrderDetails (
    Id BIGINT IDENTITY(1,1) PRIMARY KEY,
    InboundOrderId BIGINT NOT NULL FOREIGN KEY REFERENCES InboundOrders(Id),
    ProductId INT NOT NULL FOREIGN KEY REFERENCES Products(Id),
    BatchId INT NOT NULL FOREIGN KEY REFERENCES Batches(Id),
    LocationId INT NOT NULL FOREIGN KEY REFERENCES Locations(Id),
    QuantityReceived DECIMAL(18,2) NOT NULL,
    QuantityExpected DECIMAL(18,2) DEFAULT 0,
    UnitPrice DECIMAL(18, 2) DEFAULT 0,
    ItemCondition NVARCHAR(100) DEFAULT N'Bình thường',
    QuantityIntact DECIMAL(18,2) NULL,
    QuantityDamaged DECIMAL(18,2) NULL,
    QualityRating NVARCHAR(50) NULL,
    QcNotes NVARCHAR(500) NULL
);

CREATE TABLE Waves (
    Id BIGINT IDENTITY(1,1) PRIMARY KEY,
    WaveCode VARCHAR(50) UNIQUE NOT NULL,
    Status VARCHAR(20) DEFAULT 'CREATED',
    CreatedBy INT,
    AssignedTo INT,
    Note NVARCHAR(500),
    CompletedAt DATETIME2,
    CreatedAt DATETIME2 DEFAULT GETDATE()
);

CREATE TABLE OutboundOrders (
    Id BIGINT IDENTITY(1,1) PRIMARY KEY,
    IssueCode VARCHAR(50) UNIQUE NOT NULL,
    CustomerId INT FOREIGN KEY REFERENCES Customers(Id),
    Status VARCHAR(20) DEFAULT 'DRAFT',
    IssueDate DATETIME2,
    TotalAmount DECIMAL(18, 2) DEFAULT 0,
    Note NVARCHAR(500),
    WaveId BIGINT FOREIGN KEY REFERENCES Waves(Id),
    CreatedBy INT,
    CreatedAt DATETIME2 DEFAULT GETDATE()
);

CREATE TABLE OutboundOrderDetails (
    Id BIGINT IDENTITY(1,1) PRIMARY KEY,
    OutboundOrderId BIGINT NOT NULL FOREIGN KEY REFERENCES OutboundOrders(Id),
    ProductId INT NOT NULL FOREIGN KEY REFERENCES Products(Id),
    BatchId INT NOT NULL FOREIGN KEY REFERENCES Batches(Id),
    LocationId INT NOT NULL FOREIGN KEY REFERENCES Locations(Id),
    Quantity DECIMAL(18,2) NOT NULL,
    UnitPrice DECIMAL(18, 2) DEFAULT 0
);

CREATE TABLE CycleCountPlans (
    Id BIGINT IDENTITY(1,1) PRIMARY KEY,
    PlanCode VARCHAR(50) UNIQUE NOT NULL,
    Status VARCHAR(20) DEFAULT 'CREATED',
    CreatedBy INT,
    AssignedTo INT,
    ScheduledDate DATETIME2,
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    CompletedAt DATETIME2,
    Note NVARCHAR(500)
);

CREATE TABLE CycleCountDetails (
    Id BIGINT IDENTITY(1,1) PRIMARY KEY,
    PlanId BIGINT NOT NULL FOREIGN KEY REFERENCES CycleCountPlans(Id),
    LocationId INT NOT NULL FOREIGN KEY REFERENCES Locations(Id),
    ProductId INT NOT NULL FOREIGN KEY REFERENCES Products(Id),
    BatchId INT NOT NULL FOREIGN KEY REFERENCES Batches(Id),
    SystemQty DECIMAL(18,2) DEFAULT 0,
    CountedQty DECIMAL(18,2) DEFAULT 0,
    Variance DECIMAL(18,2) DEFAULT 0,
    Note NVARCHAR(255)
);
GO

-- ==============================================================================
-- 2. NẠP DỮ LIỆU MẪU SIÊU PHONG PHÚ (ZERO-CONFLICT)
-- ==============================================================================

-- 2.1 Roles & Shifts
INSERT INTO Roles (RoleName, Description) VALUES 
('ADMIN', N'Quản trị'), ('MANAGER', N'Quản lý'), ('ACCOUNTANT', N'Kế toán'), 
('STOREKEEPER', N'Thủ kho'), ('QUALITY_CONTROL', N'Kiểm duyệt QC'), 
('INBOUND_STAFF', N'Nhân viên nhập'), ('OUTBOUND_STAFF', N'Nhân viên xuất'), ('HANDLER', N'Điều chuyển');

INSERT INTO WorkShifts (ShiftName, StartTime, EndTime, GracePeriodMinutes) VALUES 
(N'Ca hành chính', '08:00:00', '17:30:00', 15), (N'Ca sáng', '06:00:00', '14:00:00', 10), (N'Ca chiều', '14:00:00', '22:00:00', 10);
GO

-- 2.2 Nhân sự (Full 11 thành viên)
DECLARE @sHC INT = (SELECT Id FROM WorkShifts WHERE ShiftName = N'Ca hành chính');
DECLARE @sS INT = (SELECT Id FROM WorkShifts WHERE ShiftName = N'Ca sáng');
DECLARE @sC INT = (SELECT Id FROM WorkShifts WHERE ShiftName = N'Ca chiều');

INSERT INTO Staff (EmployeeCode, FullName, Username, Password, Enabled, WarehouseRole, ShiftId, HireDate, DateOfBirth, Gender) VALUES 
('EMP-001', N'Hệ Thống Admin', 'admin', '$2a$10$IS2milLlKmbykA2gf6hf4.hP8F.tQ1mwCXZYhh5cWcqoMF7Iu5fb2', 1, 'WAREHOUSE_MANAGER', @sHC, '2020-01-01', '1990-01-01', 'MALE'),
('EMP-002', N'Đặng QC', 'qc_01', '$2a$10$IS2milLlKmbykA2gf6hf4.hP8F.tQ1mwCXZYhh5cWcqoMF7Iu5fb2', 1, 'QUALITY_CONTROL', @sHC, '2023-05-10', '1995-05-20', 'FEMALE'),
('EMP-003', N'Trần Quản Lý', 'manager_01', '$2a$10$IS2milLlKmbykA2gf6hf4.hP8F.tQ1mwCXZYhh5cWcqoMF7Iu5fb2', 1, 'WAREHOUSE_MANAGER', @sHC, '2021-06-15', '1988-12-12', 'MALE'),
('EMP-004', N'Lê Kế Toán', 'accountant_01', '$2a$10$IS2milLlKmbykA2gf6hf4.hP8F.tQ1mwCXZYhh5cWcqoMF7Iu5fb2', 1, 'ACCOUNTANT', @sHC, '2022-02-20', '1994-03-08', 'FEMALE'),
('EMP-005', N'Vũ Thủ Kho', 'storekeeper_01', '$2a$10$IS2milLlKmbykA2gf6hf4.hP8F.tQ1mwCXZYhh5cWcqoMF7Iu5fb2', 1, 'WAREHOUSE_KEEPER', @sS, '2022-11-01', '1992-10-10', 'MALE'),
('EMP-006', N'Hoàng Nhập', 'inbound_01', '$2a$10$IS2milLlKmbykA2gf6hf4.hP8F.tQ1mwCXZYhh5cWcqoMF7Iu5fb2', 1, 'INBOUND_STAFF', @sS, '2023-01-10', '1997-01-01', 'MALE'),
('EMP-007', N'Nguyễn Xuất', 'outbound_01', '$2a$10$IS2milLlKmbykA2gf6hf4.hP8F.tQ1mwCXZYhh5cWcqoMF7Iu5fb2', 1, 'OUTBOUND_STAFF', @sC, '2023-02-15', '1998-04-04', 'MALE'),
('EMP-008', N'Phạm Chuyển', 'handler_01', '$2a$10$IS2milLlKmbykA2gf6hf4.hP8F.tQ1mwCXZYhh5cWcqoMF7Iu5fb2', 1, 'HANDLER', @sC, '2023-03-20', '1999-09-09', 'MALE'),
('EMP-INT01', N'Thực Tập 1', 'intern_01', '$2a$10$IS2milLlKmbykA2gf6hf4.hP8F.tQ1mwCXZYhh5cWcqoMF7Iu5fb2', 1, 'INTERN', @sS, '2024-05-01', '2002-01-01', 'MALE'),
('EMP-INT02', N'Thực Tập 2', 'intern_02', '$2a$10$IS2milLlKmbykA2gf6hf4.hP8F.tQ1mwCXZYhh5cWcqoMF7Iu5fb2', 1, 'INTERN', @sC, '2024-05-01', '2002-02-02', 'FEMALE'),
('EMP-OFF01', N'Trương Nghỉ', 'retired_staff', '$2a$10$IS2milLlKmbykA2gf6hf4.hP8F.tQ1mwCXZYhh5cWcqoMF7Iu5fb2', 0, 'OUTBOUND_STAFF', NULL, '2019-01-01', '1985-05-05', 'MALE');

-- Cập nhật giờ ca làm việc từ bảng WorkShifts sang bảng Staff (để khớp với logic Backend)
UPDATE Staff
SET ShiftStartTime = ws.StartTime,
    ShiftEndTime = ws.EndTime
FROM Staff s
JOIN WorkShifts ws ON s.ShiftId = ws.Id;

-- Gán quyền (Staff_Roles) - Đầy đủ cho 11 nhân sự
INSERT INTO Staff_Roles (StaffId, RoleId) 
SELECT s.Id, r.Id FROM Staff s, Roles r 
WHERE (s.Username='admin' AND r.RoleName='ADMIN') 
   OR (s.Username='qc_01' AND r.RoleName='QUALITY_CONTROL')
   OR (s.Username='manager_01' AND r.RoleName='MANAGER')
   OR (s.Username='accountant_01' AND r.RoleName='ACCOUNTANT')
   OR (s.Username='storekeeper_01' AND r.RoleName='STOREKEEPER')
   OR (s.Username='inbound_01' AND r.RoleName='INBOUND_STAFF')
   OR (s.Username='outbound_01' AND r.RoleName='OUTBOUND_STAFF')
   OR (s.Username='handler_01' AND r.RoleName='HANDLER')
   OR (s.Username='intern_01' AND r.RoleName='INTERN')
   OR (s.Username='intern_02' AND r.RoleName='INTERN')
   OR (s.Username='retired_staff' AND r.RoleName='OUTBOUND_STAFF');
GO

-- 2.3 Đối tác (Suppliers & Customers)
INSERT INTO Suppliers (SupplierCode, Name, Phone, Address) VALUES 
('SUP-VNM', N'Vinamilk', '028123', N'Quận 7, HCM'), ('SUP-MSN', N'Masan Group', '028456', N'Quận 1, HCM'), ('SUP-SS',  N'Samsung VN', '090912', N'Quận 9, HCM'), ('SUP-CP',  N'CP Vietnam', '098877', N'Biên Hòa');
INSERT INTO Customers (CustomerCode, Name, Phone, Address) VALUES 
('CUS-WIN', N'WinMart', '19001', N'Hà Nội'), ('CUS-COOP', N'Co.op Mart', '19002', N'TP.HCM'), ('CUS-BHX', N'Bách Hóa Xanh', '19003', N'Bình Dương');

-- 2.4 Categories & Units
INSERT INTO ProductCategories (CategoryCode, Name, Description) VALUES 
('CAT-SUA', N'Sữa & Đồ uống', N'Sữa tươi, sữa hộp'), ('CAT-GIAVI', N'Gia vị', N'Nước mắm, gia vị'), ('CAT-DT', N'Điện tử', N'Smartphone, TV'), ('CAT-TUOI', N'Hàng tươi sống', N'Thịt, trứng, hàng lạnh'), ('CAT-KHO', N'Mì & Đồ khô', N'Đồ khô');
INSERT INTO ProductUnits (UnitCode, Name) VALUES ('UNIT-HOP', N'Hộp'), ('UNIT-CHAI', N'Chai'), ('UNIT-CAI', N'Cái'), ('UNIT-THUNG', N'Thùng'), ('UNIT-KG', N'Kg');
GO

-- 2.5 Sản phẩm (15 món đa dạng)
DECLARE @catSua INT = (SELECT Id FROM ProductCategories WHERE CategoryCode='CAT-SUA');
DECLARE @catGia INT = (SELECT Id FROM ProductCategories WHERE CategoryCode='CAT-GIAVI');
DECLARE @catDT INT = (SELECT Id FROM ProductCategories WHERE CategoryCode='CAT-DT');
DECLARE @catTuoi INT = (SELECT Id FROM ProductCategories WHERE CategoryCode='CAT-TUOI');
DECLARE @catKho INT = (SELECT Id FROM ProductCategories WHERE CategoryCode='CAT-KHO');

INSERT INTO Products (Sku, Barcode, Name, BaseUnit, CategoryId, ImageUrl, SafetyStock, Weight) VALUES 
('VNM-1L', '89301', N'Sữa tươi Vinamilk 1L', N'Hộp', @catSua, 'https://cdn.tgdd.vn/Products/Images/2386/79312/bhx/sua-tuoi-tiet-trung-co-duong-vinamilk-100-sua-tuoi-hop-1-lit-202403281405409207.jpg', 100, 1.05),
('CHINSU-500', '89302', N'Nước mắm Chinsu 500ml', N'Chai', @catGia, 'https://cdn.tgdd.vn/Products/Images/2289/209456/bhx/nuoc-mam-huong-ca-hoi-hao-hang-chinsu-12-do-dam-chai-500ml-202309211050423407.jpg', 50, 0.6),
('SAMSUNG-65', '89303', N'Smart TV Samsung 65"', N'Cái', @catDT, 'https://cdn2.cellphones.com.vn/insecure/rs:fill:358:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/s/m/smart-tivi-samsung-qled-65q6fa-4k-65-inch.png', 5, 25.0),
('IPHONE-15', '89306', N'iPhone 15 Pro Max', N'Cái', @catDT, 'https://cdn2.cellphones.com.vn/insecure/rs:fill:358:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/i/p/iphone-15-pro-max_3.png', 10, 0.22),
('CP-PORK', '89304', N'Thịt heo CP 500g', N'Khay', @catTuoi, 'https://cdnv2.tgdd.vn/bhx-static/bhx/production/2026/1/image/production/2026/1/image/Products/8781/344531/suon-non-heo-cp-300g_202601300958028317.jpg', 20, 0.5),
('GẠO-ST25', '89314', N'Gạo ST25 túi 5kg', N'Gói', @catKho, 'https://cdn.tgdd.vn/Products/Images/2521/227443/bhx/gao-st25-tui-5kg-202303031046420546.jpg', 40, 5.0),
('OMO-36', '89313', N'Nước giặt Omo 3.6kg', N'Chai', @catGia, 'https://cdn.tgdd.vn/Products/Images/2458/175883/bhx/nuoc-giat-omo-matic-cho-may-giat-cua-truoc-ben-dep-luu-huong-tui-36kg-202308181412019446.jpg', 20, 3.7),
('TH-180', '89307', N'Sữa TH True Milk 180ml', N'Hộp', @catSua, 'https://cdn.tgdd.vn/Products/Images/2386/194452/bhx/loc-4-hop-sua-tuoi-tiet-trung-it-duong-th-true-milk-180ml-202311301552554761.jpg', 200, 0.2),
('CP-EGG', '89308', N'Trứng gà CP vỉ 10', N'Khay', @catTuoi, 'https://cdn.tgdd.vn/Products/Images/8783/228775/bhx/hop-10-trung-ga-tuoi-qlegg-202011040900362921.jpg', 50, 0.6),
('S24-ULTRA', '89310', N'Samsung Galaxy S24 Ultra', N'Cái', @catDT, 'https://cdn2.cellphones.com.vn/insecure/rs:fill:358:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/s/2/s24-ultra-xanh.png', 5, 0.23);
GO

-- 2.6 Kho & 13 Vị trí
DECLARE @wh INT;
INSERT INTO Warehouses (WarehouseCode, Name, Address) VALUES ('WH-MAIN', N'Kho Tổng', N'HCM'); SET @wh = SCOPE_IDENTITY();

INSERT INTO Locations (WarehouseId, Zone, BinCode, Capacity, StorageType) VALUES 
(@wh, 'A', 'WH1-A-01-01-1', 1000, 'NORMAL'), (@wh, 'A', 'WH1-A-01-01-2', 1000, 'NORMAL'), (@wh, 'A', 'WH1-A-01-02-1', 1000, 'NORMAL'),
(@wh, 'B', 'WH1-B-01-01-1', 500, 'NORMAL'), (@wh, 'B', 'WH1-B-01-01-2', 500, 'NORMAL'), (@wh, 'B', 'WH1-B-01-02-1', 500, 'NORMAL'),
(@wh, 'C', 'WH1-COLD-01-01-1', 300, 'COLD'), (@wh, 'C', 'WH1-COLD-01-01-2', 300, 'COLD'),
(@wh, 'D', 'WH1-CHILL-01-01-1', 300, 'CHILLED'), (@wh, 'E', 'WH1-FROZEN-01-01-1', 200, 'FROZEN'),
(@wh, 'F', 'WH1-QUAR-01-01-1', 200, 'QUARANTINE'), (@wh, 'G', 'WH1-G-01-01-1', 1000, 'NORMAL'), (@wh, 'G', 'WH1-G-01-01-2', 1000, 'NORMAL');
GO

-- 2.7 Batches, Inventory & Transactions
DECLARE @p1 INT = (SELECT Id FROM Products WHERE Sku='VNM-1L');
DECLARE @p2 INT = (SELECT Id FROM Products WHERE Sku='CHINSU-500');
DECLARE @l1 INT = (SELECT Id FROM Locations WHERE BinCode='WH1-A-01-01-1');
DECLARE @l2 INT = (SELECT Id FROM Locations WHERE BinCode='WH1-B-01-01-1');

INSERT INTO Batches (ProductId, BatchCode, ExpiryDate) VALUES (@p1, 'LOT-VNM-2025', '2025-12-31'), (@p2, 'LOT-CHINSU-2024', '2024-12-31');
DECLARE @b1 INT = (SELECT Id FROM Batches WHERE BatchCode='LOT-VNM-2025');
DECLARE @b2 INT = (SELECT Id FROM Batches WHERE BatchCode='LOT-CHINSU-2024');

INSERT INTO Inventory (ProductId, LocationId, BatchId, QuantityOnHand) VALUES (@p1, @l1, @b1, 1000), (@p2, @l2, @b2, 500);
INSERT INTO InventoryTransactions (ProductId, LocationId, BatchId, TransactionType, QuantityChange, CreatedAt)
SELECT ProductId, LocationId, BatchId, 'INBOUND', QuantityOnHand, DATEADD(day, -10, GETDATE()) FROM Inventory;
GO

-- 2.8 Phiếu kho (History + PENDING QC)
DECLARE @uAdmin INT = (SELECT Id FROM Staff WHERE Username='admin');
DECLARE @sVNM INT = (SELECT Id FROM Suppliers WHERE SupplierCode='SUP-VNM');
DECLARE @sMSN INT = (SELECT Id FROM Suppliers WHERE SupplierCode='SUP-MSN');
DECLARE @cWIN INT = (SELECT Id FROM Customers WHERE CustomerCode='CUS-WIN');

-- Phiếu xong (7 ngày qua)
DECLARE @in1 BIGINT;
INSERT INTO InboundOrders (ReceiptCode, SupplierId, Status, CreatedBy, TotalAmount, CreatedAt) VALUES ('PN-2026-001', @sVNM, 'COMPLETED', @uAdmin, 12500000, DATEADD(day, -7, GETDATE()));
SET @in1 = SCOPE_IDENTITY();
INSERT INTO InboundOrderDetails (InboundOrderId, ProductId, BatchId, LocationId, QuantityReceived, UnitPrice, QualityRating, QuantityIntact)
SELECT @in1, p.Id, b.Id, l.Id, 1000, 12500, N'Đạt chuẩn', 1000 FROM Products p, Batches b, Locations l WHERE p.Sku='VNM-1L' AND l.BinCode='WH1-A-01-01-1' AND b.BatchCode='LOT-VNM-2025';

-- Phiếu Đang duyệt (Pending QC)
DECLARE @in2 BIGINT;
INSERT INTO InboundOrders (ReceiptCode, SupplierId, Status, CreatedBy, TotalAmount, CreatedAt, ReferenceNumber) 
VALUES ('PN-QC-WAITING', @sMSN, 'PENDING', @uAdmin, 4500000, GETDATE(), 'REF-VÀO-KHO-QC');
SET @in2 = SCOPE_IDENTITY();
INSERT INTO InboundOrderDetails (InboundOrderId, ProductId, BatchId, LocationId, QuantityReceived, QuantityExpected, UnitPrice)
SELECT @in2, p.Id, b.Id, l.Id, 250, 250, 18000 FROM Products p, Batches b, Locations l WHERE p.Sku='CHINSU-500' AND l.BinCode='WH1-B-01-01-1' AND b.BatchCode='LOT-CHINSU-2024';

-- Phiếu Xuất (History)
DECLARE @out1 BIGINT;
INSERT INTO OutboundOrders (IssueCode, CustomerId, Status, CreatedBy, TotalAmount, CreatedAt) VALUES ('XK-2026-001', @cWIN, 'COMPLETED', @uAdmin, 1500000, DATEADD(day, -3, GETDATE()));
SET @out1 = SCOPE_IDENTITY();
INSERT INTO OutboundOrderDetails (OutboundOrderId, ProductId, BatchId, LocationId, Quantity, UnitPrice)
SELECT @out1, p.Id, b.Id, l.Id, 100, 15000 FROM Products p, Batches b, Locations l WHERE p.Sku='VNM-1L' AND l.BinCode='WH1-A-01-01-1' AND b.BatchCode='LOT-VNM-2025';

-- Ghi nhận giao dịch xuất
INSERT INTO InventoryTransactions (ProductId, LocationId, BatchId, TransactionType, QuantityChange, CreatedAt)
SELECT ProductId, LocationId, BatchId, 'OUTBOUND', 100, DATEADD(day, -3, GETDATE()) FROM OutboundOrderDetails d WHERE d.OutboundOrderId = @out1;

PRINT 'HỆ THỐNG ĐÃ HOÀN TẤT ĐỒNG BỘ VÀ NẠP ĐẦY ĐỦ VŨ TRỤ DỮ LIỆU!';
GO
