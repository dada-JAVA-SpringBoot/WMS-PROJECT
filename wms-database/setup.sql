IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'WMS_DB')
BEGIN
    CREATE DATABASE WMS_DB;
END
GO
USE WMS_DB;
GO

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
-- 2. NẠP DỮ LIỆU CƠ SỞ (CORE DATA)
-- ==============================================================================

-- 2.1 Roles & Shifts
INSERT INTO Roles (RoleName, Description) VALUES 
('ADMIN', N'Quản trị'), ('MANAGER', N'Quản lý kho'), ('ACCOUNTANT', N'Kế toán kho'), 
('STOREKEEPER', N'Thủ kho'), ('QUALITY_CONTROL', N'Kiểm duyệt (QC)'), 
('INBOUND_STAFF', N'Nhân viên nhập kho'), ('OUTBOUND_STAFF', N'Nhân viên xuất kho'), 
('HANDLER', N'Nhân viên điều chuyển'), ('INVENTORY_CHECKER', N'Kiểm kê viên'),
('INTERN', N'Thực tập sinh');

INSERT INTO WorkShifts (ShiftName, StartTime, EndTime, GracePeriodMinutes) VALUES 
(N'Ca hành chính', '08:00:00', '17:30:00', 15), 
(N'Ca sáng', '06:00:00', '14:00:00', 10), 
(N'Ca chiều', '14:00:00', '22:00:00', 10);
GO

-- 2.2 Tài khoản Admin hệ thống
DECLARE @sHC INT = (SELECT Id FROM WorkShifts WHERE ShiftName = N'Ca hành chính');

INSERT INTO Staff (EmployeeCode, FullName, Username, Password, Enabled, WarehouseRole, ShiftId, HireDate, DateOfBirth, Gender) VALUES 
('ADMIN-001', N'Administrator', 'admin', '$2a$10$IS2milLlKmbykA2gf6hf4.hP8F.tQ1mwCXZYhh5cWcqoMF7Iu5fb2', 1, 'ADMIN', @sHC, CAST(GETDATE() AS DATE), '1990-01-01', 'MALE');

-- Cập nhật giờ ca làm việc sang bảng Staff
UPDATE Staff
SET ShiftStartTime = ws.StartTime,
    ShiftEndTime = ws.EndTime
FROM Staff s
JOIN WorkShifts ws ON s.ShiftId = ws.Id;

-- Gán quyền ADMIN
INSERT INTO Staff_Roles (StaffId, RoleId) 
SELECT s.Id, r.Id FROM Staff s, Roles r 
WHERE s.Username='admin' AND r.RoleName='ADMIN';
GO

-- 2.3 Cấu trúc kho mặc định (Tùy chọn - Có thể để trống để người dùng tự tạo)
-- INSERT INTO Warehouses (WarehouseCode, Name, Address) VALUES ('WH-MAIN', N'Kho Tổng', N'HCM');

-- 2.4 Danh mục & Đơn vị mặc định (Cần thiết cho vận hành ban đầu)
INSERT INTO ProductUnits (UnitCode, Name) VALUES 
('UNIT-HOP', N'Hộp'), ('UNIT-CHAI', N'Chai'), ('UNIT-CAI', N'Cái'), ('UNIT-THUNG', N'Thùng'), ('UNIT-KG', N'Kg');

PRINT 'HỆ THỐNG ĐÃ SẴN SÀNG CHO VẬN HÀNH (CLEAN DEPLOY)!';
GO
