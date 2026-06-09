IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'WMS_DB')
BEGIN
    CREATE DATABASE WMS_DB;
END
GO
USE WMS_DB;
GO

-- XÓA DỮ LIỆU CŨ THEO THỨ TỰ NGƯỢC LẠI ĐỂ TRÁNH RÀNG BUỘC FK
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
DROP TABLE IF EXISTS Batches;
DROP TABLE IF EXISTS Locations;
DROP TABLE IF EXISTS Warehouses;
DROP TABLE IF EXISTS ProductSuppliers;
DROP TABLE IF EXISTS ProductUnitConversions;
DROP TABLE IF EXISTS ProductUnits;
DROP TABLE IF EXISTS Products;
DROP TABLE IF EXISTS ProductCategories;
DROP TABLE IF EXISTS Staff_Roles;
DROP TABLE IF EXISTS Staff;
DROP TABLE IF EXISTS Roles;
DROP TABLE IF EXISTS WorkShifts;
DROP TABLE IF EXISTS Customers;
DROP TABLE IF EXISTS Suppliers;
DROP TABLE IF EXISTS Companies;

-- 1. COMPANIES
CREATE TABLE Companies (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    CompanyCode NVARCHAR(50) UNIQUE NOT NULL,
    CompanyName NVARCHAR(255) NOT NULL,
    TaxCode NVARCHAR(50),
    Address NVARCHAR(500),
    ParentCompanyId INT NULL,
    Active BIT DEFAULT 1,
    CreatedAt DATETIME DEFAULT GETDATE()
);

-- 2. ROLES
CREATE TABLE Roles (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    RoleName NVARCHAR(50) UNIQUE NOT NULL,
    Description NVARCHAR(255)
);

-- 3. WORK SHIFTS
CREATE TABLE WorkShifts (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    ShiftName NVARCHAR(100) NOT NULL,
    StartTime TIME NOT NULL,
    EndTime TIME NOT NULL,
    GracePeriodMinutes INT DEFAULT 15,
    CompanyId INT
);

-- 4. STAFF
CREATE TABLE Staff (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    EmployeeCode NVARCHAR(50) UNIQUE NOT NULL,
    FullName NVARCHAR(255) NOT NULL,
    Gender NVARCHAR(10) DEFAULT 'MALE',
    DateOfBirth DATE,
    Phone NVARCHAR(20),
    Email NVARCHAR(100),
    HireDate DATE,
    ContractType NVARCHAR(50) DEFAULT 'FULL_TIME',
    WarehouseRole NVARCHAR(50) DEFAULT 'INBOUND_STAFF',
    WorkStatus NVARCHAR(50) DEFAULT 'OFF_SHIFT',
    Notes NVARCHAR(MAX),
    Username NVARCHAR(100) UNIQUE,
    Password NVARCHAR(255),
    Enabled BIT DEFAULT 1,
    CompanyId INT,
    Avatar NVARCHAR(MAX),
    ShiftStartTime TIME,
    ShiftEndTime TIME,
    LastActiveAt DATETIME,
    CreatedAt DATETIME DEFAULT GETDATE()
);

-- 5. STAFF_ROLES (JOIN TABLE)
CREATE TABLE Staff_Roles (
    StaffId INT NOT NULL,
    RoleId INT NOT NULL,
    PRIMARY KEY (StaffId, RoleId),
    FOREIGN KEY (StaffId) REFERENCES Staff(Id),
    FOREIGN KEY (RoleId) REFERENCES Roles(Id)
);

-- 6. PRODUCT CATEGORIES
CREATE TABLE ProductCategories (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    CategoryCode NVARCHAR(50) UNIQUE NOT NULL,
    Name NVARCHAR(255) NOT NULL,
    Description NVARCHAR(500),
    IsActive BIT DEFAULT 1,
    CompanyId INT
);

-- 7. SUPPLIERS
CREATE TABLE Suppliers (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    SupplierCode NVARCHAR(50) UNIQUE NOT NULL,
    Name NVARCHAR(255) NOT NULL,
    Phone NVARCHAR(20),
    Email NVARCHAR(100),
    Address NVARCHAR(500),
    TaxCode NVARCHAR(50),
    Status NVARCHAR(20) DEFAULT 'ACTIVE',
    CompanyId INT,
    TotalImportQuantity INT DEFAULT 0,
    CreatedAt DATETIME DEFAULT GETDATE()
);

-- 8. CUSTOMERS
CREATE TABLE Customers (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    CustomerCode NVARCHAR(50) UNIQUE NOT NULL,
    Name NVARCHAR(255) NOT NULL,
    Phone NVARCHAR(20),
    Email NVARCHAR(100),
    Address NVARCHAR(500),
    CompanyId INT,
    CreatedAt DATETIME DEFAULT GETDATE()
);

-- 9. WAREHOUSES
CREATE TABLE Warehouses (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    WarehouseCode NVARCHAR(50) UNIQUE NOT NULL,
    Name NVARCHAR(255) NOT NULL,
    Address NVARCHAR(500),
    CompanyId INT
);

-- 10. LOCATIONS
CREATE TABLE Locations (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    WarehouseId INT NOT NULL,
    CompanyId INT,
    Zone NVARCHAR(50),
    Aisle NVARCHAR(50),
    Rack NVARCHAR(50),
    Level NVARCHAR(50),
    BinCode NVARCHAR(50) UNIQUE NOT NULL,
    Capacity INT DEFAULT 100,
    StorageType NVARCHAR(20) DEFAULT 'NORMAL',
    ContainerType NVARCHAR(20) DEFAULT 'CAI',
    FOREIGN KEY (WarehouseId) REFERENCES Warehouses(Id)
);

-- 11. PRODUCTS
CREATE TABLE Products (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Sku NVARCHAR(50) UNIQUE NOT NULL,
    Barcode NVARCHAR(100),
    Name NVARCHAR(255) NOT NULL,
    BaseUnit NVARCHAR(50),
    CategoryId INT,
    CompanyId INT,
    ImageUrl NVARCHAR(MAX),
    Status NVARCHAR(20) DEFAULT 'ACTIVE',
    Weight DECIMAL(18,2),
    Length DECIMAL(18,2),
    Width DECIMAL(18,2),
    Height DECIMAL(18,2),
    StorageTemp NVARCHAR(50),
    SafetyStock INT DEFAULT 0,
    IsFragile BIT DEFAULT 0,
    CreatedAt DATETIME DEFAULT GETDATE()
);

-- 12. BATCHES
CREATE TABLE Batches (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    ProductId INT NOT NULL,
    CompanyId INT,
    BatchCode NVARCHAR(100) NOT NULL,
    ManufactureDate DATE,
    ExpiryDate DATE NOT NULL,
    CreatedAt DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (ProductId) REFERENCES Products(Id)
);

-- 13. INVENTORY
CREATE TABLE Inventory (
    Id BIGINT IDENTITY(1,1) PRIMARY KEY,
    ProductId INT NOT NULL,
    LocationId INT NOT NULL,
    BatchId INT NOT NULL,
    CompanyId INT,
    QuantityOnHand DECIMAL(18,2) DEFAULT 0,
    QuantityAllocated DECIMAL(18,2) DEFAULT 0,
    LastUpdated DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (ProductId) REFERENCES Products(Id),
    FOREIGN KEY (LocationId) REFERENCES Locations(Id),
    FOREIGN KEY (BatchId) REFERENCES Batches(Id)
);

-- 14. INBOUND ORDERS
CREATE TABLE InboundOrders (
    Id BIGINT IDENTITY(1,1) PRIMARY KEY,
    ReceiptCode NVARCHAR(50) UNIQUE NOT NULL,
    SupplierId INT,
    CompanyId INT,
    ReferenceNumber NVARCHAR(100),
    Status NVARCHAR(20), -- DRAFT, PENDING, RECEIVING, COMPLETED, CANCELLED
    ReceiptDate DATETIME,
    TotalAmount DECIMAL(18,2),
    CreatedBy INT,
    Notes NVARCHAR(500),
    CreatedAt DATETIME DEFAULT GETDATE()
);

CREATE TABLE InboundOrderDetails (
    Id BIGINT IDENTITY(1,1) PRIMARY KEY,
    InboundOrderId BIGINT NOT NULL,
    ProductId INT NOT NULL,
    BatchId INT NOT NULL,
    LocationId INT NOT NULL,
    QuantityReceived DECIMAL(18,2) NOT NULL,
    QuantityExpected DECIMAL(18,2),
    UnitPrice DECIMAL(18,2),
    ItemCondition NVARCHAR(100),
    QuantityIntact DECIMAL(18,2),
    QuantityDamaged DECIMAL(18,2),
    QualityRating NVARCHAR(50),
    QcNotes NVARCHAR(500),
    ExpiryDate DATE,
    FOREIGN KEY (InboundOrderId) REFERENCES InboundOrders(Id),
    FOREIGN KEY (ProductId) REFERENCES Products(Id),
    FOREIGN KEY (BatchId) REFERENCES Batches(Id),
    FOREIGN KEY (LocationId) REFERENCES Locations(Id)
);

-- 15. OUTBOUND ORDERS
CREATE TABLE OutboundOrders (
    Id BIGINT IDENTITY(1,1) PRIMARY KEY,
    IssueCode NVARCHAR(50) UNIQUE NOT NULL,
    CustomerId INT,
    CompanyId INT,
    Status NVARCHAR(20), -- DRAFT, ALLOCATED, PICKING, SHIPPED, CANCELLED
    IssueDate DATETIME,
    TotalAmount DECIMAL(18,2),
    CreatedBy INT,
    Note NVARCHAR(500),
    CreatedAt DATETIME DEFAULT GETDATE(),
    WaveId BIGINT
);

CREATE TABLE OutboundOrderDetails (
    Id BIGINT IDENTITY(1,1) PRIMARY KEY,
    OutboundOrderId BIGINT NOT NULL,
    ProductId INT NOT NULL,
    BatchId INT NOT NULL,
    LocationId INT NOT NULL,
    Quantity DECIMAL(18,2) NOT NULL,
    UnitPrice DECIMAL(18,2),
    FOREIGN KEY (OutboundOrderId) REFERENCES OutboundOrders(Id),
    FOREIGN KEY (ProductId) REFERENCES Products(Id)
);

-- 16. INVENTORY TRANSACTIONS
CREATE TABLE InventoryTransactions (
    Id BIGINT IDENTITY(1,1) PRIMARY KEY,
    ProductId INT NOT NULL,
    LocationId INT NOT NULL,
    BatchId INT NOT NULL,
    CompanyId INT,
    TransactionType NVARCHAR(50) NOT NULL,
    QuantityChange DECIMAL(18,2) NOT NULL,
    ReferenceId BIGINT,
    CreatedBy INT,
    CreatedAt DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (ProductId) REFERENCES Products(Id)
);

-- 17. ATTENDANCE
CREATE TABLE Attendance (
    Id BIGINT IDENTITY(1,1) PRIMARY KEY,
    StaffId INT NOT NULL,
    WorkDate DATE NOT NULL,
    CheckInTime DATETIME,
    CheckOutTime DATETIME,
    LateMinutes INT DEFAULT 0,
    OvertimeMinutes INT DEFAULT 0,
    Status NVARCHAR(20), -- PRESENT, LATE, ABSENT
    ApprovalStatus NVARCHAR(20) DEFAULT 'PENDING', -- PENDING, APPROVED, REJECTED
    LateReason NVARCHAR(MAX),
    Note NVARCHAR(MAX),
    CompanyId INT,
    FOREIGN KEY (StaffId) REFERENCES Staff(Id)
);

-- 18. MASTER DATA SUPPORT
CREATE TABLE ProductSuppliers (
    ProductId INT NOT NULL,
    SupplierId INT NOT NULL,
    IsDefault BIT DEFAULT 0,
    PRIMARY KEY (ProductId, SupplierId),
    FOREIGN KEY (ProductId) REFERENCES Products(Id),
    FOREIGN KEY (SupplierId) REFERENCES Suppliers(Id)
);

CREATE TABLE ProductUnits (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    UnitCode NVARCHAR(20) UNIQUE NOT NULL,
    Name NVARCHAR(50) NOT NULL,
    Description NVARCHAR(255),
    IsActive BIT DEFAULT 1,
    CompanyId INT
);

CREATE TABLE ProductUnitConversions (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    ProductId INT NOT NULL,
    UnitName NVARCHAR(50) NOT NULL,
    FromUnit NVARCHAR(50),
    ToUnit NVARCHAR(50),
    ConversionFactor DECIMAL(18,4),
    IsDefault BIT DEFAULT 0,
    CreatedAt DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (ProductId) REFERENCES Products(Id)
);

-- 19. WAVES & CYCLE COUNT
CREATE TABLE Waves (
    Id BIGINT IDENTITY(1,1) PRIMARY KEY,
    WaveCode NVARCHAR(50) UNIQUE NOT NULL,
    Status NVARCHAR(20),
    CompanyId INT,
    CreatedBy INT,
    AssignedTo INT,
    CreatedAt DATETIME DEFAULT GETDATE(),
    CompletedAt DATETIME,
    Note NVARCHAR(500)
);

CREATE TABLE CycleCountPlans (
    Id BIGINT IDENTITY(1,1) PRIMARY KEY,
    PlanCode NVARCHAR(50) UNIQUE NOT NULL,
    Status NVARCHAR(20),
    CompanyId INT,
    CreatedBy INT,
    AssignedTo INT,
    ScheduledDate DATETIME,
    CreatedAt DATETIME DEFAULT GETDATE(),
    CompletedAt DATETIME,
    Note NVARCHAR(500)
);

CREATE TABLE CycleCountDetails (
    Id BIGINT IDENTITY(1,1) PRIMARY KEY,
    PlanId BIGINT NOT NULL,
    LocationId INT NOT NULL,
    ProductId INT NOT NULL,
    BatchId INT NOT NULL,
    SystemQty DECIMAL(18,2),
    CountedQty DECIMAL(18,2),
    Variance DECIMAL(18,2),
    Note NVARCHAR(255),
    FOREIGN KEY (PlanId) REFERENCES CycleCountPlans(Id)
);

-- ==========================================
-- CHÈN DỮ LIỆU DEMO (REALISTIC WAREHOUSE)
-- ==========================================

-- 1. ROLES
INSERT INTO Roles (RoleName, Description) VALUES
('ADMIN', N'Quản trị viên hệ thống'),
('MANAGER', N'Quản lý kho'),
('STOREKEEPER', N'Thủ kho'),
('INBOUND_STAFF', N'Nhân viên nhập hàng'),
('OUTBOUND_STAFF', N'Nhân viên xuất hàng'),
('CHECKER', N'Nhân viên kiểm kê'),
('QUALITY_CONTROL', N'Nhân viên kiểm định');

-- 2. WORK SHIFTS
INSERT INTO WorkShifts (ShiftName, StartTime, EndTime, GracePeriodMinutes, CompanyId) VALUES
(N'Ca Hành chính', '08:00:00', '17:00:00', 15, NULL),
(N'Ca Sáng', '06:00:00', '14:00:00', 10, NULL),
(N'Ca Chiều', '14:00:00', '22:00:00', 10, NULL);

-- 3. STAFF
-- Password: 'admin' ($2a$10$IS2milLlKmbykA2gf6hf4.hP8F.tQ1mwCXZYhh5cWcqoMF7Iu5fb2)
INSERT INTO Staff (EmployeeCode, FullName, Username, Password, Enabled, WarehouseRole, CompanyId, HireDate, ContractType) VALUES
('EMP-HQ-01', N'Nguyễn Quản Trị (HQ)', 'admin', '$2a$10$IS2milLlKmbykA2gf6hf4.hP8F.tQ1mwCXZYhh5cWcqoMF7Iu5fb2', 1, 'ADMIN', NULL, '2020-01-01', 'FULL_TIME');

-- 4. STAFF_ROLES
INSERT INTO Staff_Roles (StaffId, RoleId) VALUES
(1, (SELECT Id FROM Roles WHERE RoleName = 'ADMIN'));

PRINT 'DATABASE SCHEMA AND INITIAL ADMIN READY. TRANSACTIONS WILL BE SEEDED ON BACKEND STARTUP!';
GO

