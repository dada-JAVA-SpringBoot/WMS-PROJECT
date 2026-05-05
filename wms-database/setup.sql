-- ==============================================================================
-- DATABASE WMS - BẢN CHUẨN HÓA KIẾN TRÚC VÀ LOGIC (Cập nhật Status Outbound)
-- ==============================================================================
CREATE DATABASE WMS;
GO
USE WMS;
GO

-- 1. Roles
CREATE TABLE Roles (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    RoleName NVARCHAR(50) NOT NULL UNIQUE,
    Description NVARCHAR(255)
);

-- 2. Staff
CREATE TABLE Staff (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    EmployeeCode NVARCHAR(20) NOT NULL UNIQUE,
    FullName NVARCHAR(100) NOT NULL,
    Username NVARCHAR(50) NOT NULL UNIQUE,
    Password NVARCHAR(255) NOT NULL,
    Email NVARCHAR(100),
    Phone NVARCHAR(20),
    Enabled BIT DEFAULT 1,
    CreatedAt DATETIME DEFAULT GETDATE()
);

-- 3. Staff_Roles
CREATE TABLE Staff_Roles (
    StaffId INT NOT NULL,
    RoleId INT NOT NULL,
    PRIMARY KEY (StaffId, RoleId),
    FOREIGN KEY (StaffId) REFERENCES Staff(Id),
    FOREIGN KEY (RoleId) REFERENCES Roles(Id)
);

-- 4. Suppliers & Customers
CREATE TABLE Suppliers (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    SupplierCode NVARCHAR(20) NOT NULL UNIQUE,
    Name NVARCHAR(100) NOT NULL,
    ContactName NVARCHAR(100),
    Email NVARCHAR(100),
    Phone NVARCHAR(20),
    Address NVARCHAR(255),
    Status NVARCHAR(20) DEFAULT 'ACTIVE'
);

CREATE TABLE Customers (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    CustomerCode NVARCHAR(20) NOT NULL UNIQUE,
    Name NVARCHAR(100) NOT NULL,
    ContactName NVARCHAR(100),
    Email NVARCHAR(100),
    Phone NVARCHAR(20),
    Address NVARCHAR(255),
    Status NVARCHAR(20) DEFAULT 'ACTIVE'
);

-- 5. Products & Units
CREATE TABLE ProductCategories (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    CategoryCode NVARCHAR(20) NOT NULL UNIQUE,
    Name NVARCHAR(100) NOT NULL,
    Description NVARCHAR(255)
);

CREATE TABLE ProductUnits (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    UnitCode NVARCHAR(10) NOT NULL UNIQUE,
    Name NVARCHAR(50) NOT NULL
);

CREATE TABLE Products (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    SKU NVARCHAR(50) NOT NULL UNIQUE,
    Barcode NVARCHAR(50),
    Name NVARCHAR(255) NOT NULL,
    BaseUnit NVARCHAR(10),
    CategoryId INT,
    ImageUrl NVARCHAR(500),
    Status NVARCHAR(20) DEFAULT 'ACTIVE',
    SupplierCodes NVARCHAR(255),
    Weight DECIMAL(18,2),
    Length DECIMAL(18,2),
    Width DECIMAL(18,2),
    Height DECIMAL(18,2),
    StorageTemp NVARCHAR(50),
    SafetyStock DECIMAL(18,2),
    IsFragile BIT DEFAULT 0,
    CreatedAt DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (CategoryId) REFERENCES ProductCategories(Id)
);

CREATE TABLE ProductUnitConversions (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    ProductId INT NOT NULL,
    UnitName NVARCHAR(50) NOT NULL,
    ConversionFactor DECIMAL(18,4) NOT NULL,
    FOREIGN KEY (ProductId) REFERENCES Products(Id)
);

-- 6. Batches & Locations
CREATE TABLE Batches (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    ProductId INT NOT NULL,
    BatchCode NVARCHAR(50) NOT NULL,
    ManufactureDate DATE,
    ExpiryDate DATE,
    CreatedAt DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (ProductId) REFERENCES Products(Id)
);

CREATE TABLE Warehouses (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    WarehouseCode NVARCHAR(20) NOT NULL UNIQUE,
    Name NVARCHAR(100) NOT NULL,
    Address NVARCHAR(255)
);

CREATE TABLE Locations (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    WarehouseId INT,
    Zone NVARCHAR(50),
    Aisle NVARCHAR(50),
    Rack NVARCHAR(50),
    Level NVARCHAR(50),
    BinCode NVARCHAR(50) NOT NULL UNIQUE,
    Capacity DECIMAL(18,2),
    StorageType NVARCHAR(20),
    ContainerType NVARCHAR(20),
    FOREIGN KEY (WarehouseId) REFERENCES Warehouses(Id)
);

-- 7. Inventory
CREATE TABLE Inventory (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    ProductId INT NOT NULL,
    BatchId INT NOT NULL,
    LocationId INT NOT NULL,
    QuantityOnHand DECIMAL(18,2) NOT NULL DEFAULT 0,
    QuantityAllocated DECIMAL(18,2) NOT NULL DEFAULT 0,
    LastUpdated DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (ProductId) REFERENCES Products(Id),
    FOREIGN KEY (BatchId) REFERENCES Batches(Id),
    FOREIGN KEY (LocationId) REFERENCES Locations(Id)
);

-- 8. Orders (Inbound & Outbound)
CREATE TABLE InboundOrders (
    Id BIGINT IDENTITY(1,1) PRIMARY KEY,
    ReceiptCode NVARCHAR(50) NOT NULL UNIQUE,
    SupplierId INT,
    ReferenceNumber NVARCHAR(50),
    Status NVARCHAR(20),
    TotalAmount DECIMAL(18,2),
    ReceiptDate DATETIME,
    CreatedBy INT,
    Notes NVARCHAR(500),
    CreatedAt DATETIME DEFAULT GETDATE()
);

CREATE TABLE InboundOrderDetails (
    Id BIGINT IDENTITY(1,1) PRIMARY KEY,
    InboundOrderId BIGINT NOT NULL,
    ProductId INT NOT NULL,
    BatchId INT,
    LocationId INT,
    QuantityExpected DECIMAL(18,2),
    QuantityReceived DECIMAL(18,2),
    UnitPrice DECIMAL(18,2),
    ItemCondition NVARCHAR(50),
    FOREIGN KEY (InboundOrderId) REFERENCES InboundOrders(Id)
);

CREATE TABLE OutboundOrders (
    Id BIGINT IDENTITY(1,1) PRIMARY KEY,
    IssueCode NVARCHAR(50) NOT NULL UNIQUE,
    CustomerId INT,
    Status NVARCHAR(20),
    TotalAmount DECIMAL(18,2),
    IssueDate DATETIME,
    CreatedBy INT,
    Note NVARCHAR(500),
    CreatedAt DATETIME DEFAULT GETDATE()
);

CREATE TABLE OutboundOrderDetails (
    Id BIGINT IDENTITY(1,1) PRIMARY KEY,
    OutboundOrderId BIGINT NOT NULL,
    ProductId INT NOT NULL,
    BatchId INT,
    LocationId INT,
    Quantity DECIMAL(18,2),
    UnitPrice DECIMAL(18,2),
    FOREIGN KEY (OutboundOrderId) REFERENCES OutboundOrders(Id)
);

-- ==============================================================================
-- DỮ LIỆU MẪU (SEED DATA)
-- ==============================================================================

-- Roles
INSERT INTO Roles (RoleName, Description) VALUES 
('ADMIN', 'System Administrator'),
('MANAGER', 'Warehouse Manager'),
('STOREKEEPER', 'Lead Storekeeper'),
('INBOUND_STAFF', 'Receiving Staff'),
('OUTBOUND_STAFF', 'Shipping Staff'),
('CHECKER', 'Inventory Auditor');

-- Staff (Password: Admin@123)
INSERT INTO Staff (EmployeeCode, FullName, Username, Password, Enabled) VALUES 
('EMP-001', 'Nguyễn Văn Admin', 'admin', '$2a$10$XmI8XhC.8XvM2F/a5h6SHeC/Cq0vF9Y9G4W9e5W8h/e9R5P7Q7eK.', 1),
('EMP-002', 'Lê Thị Quản Lý', 'manager1', '$2a$10$XmI8XhC.8XvM2F/a5h6SHeC/Cq0vF9Y9G4W9e5W8h/e9R5P7Q7eK.', 1),
('EMP-003', 'Trần Văn Kho', 'kho01', '$2a$10$XmI8XhC.8XvM2F/a5h6SHeC/Cq0vF9Y9G4W9e5W8h/e9R5P7Q7eK.', 1);

INSERT INTO Staff_Roles (StaffId, RoleId) SELECT s.Id, r.Id FROM Staff s, Roles r WHERE s.EmployeeCode='EMP-001' AND r.RoleName='ADMIN';
INSERT INTO Staff_Roles (StaffId, RoleId) SELECT s.Id, r.Id FROM Staff s, Roles r WHERE s.EmployeeCode='EMP-002' AND r.RoleName='MANAGER';
INSERT INTO Staff_Roles (StaffId, RoleId) SELECT s.Id, r.Id FROM Staff s, Roles r WHERE s.EmployeeCode='EMP-003' AND r.RoleName='STOREKEEPER';

-- Customers
INSERT INTO Customers (CustomerCode, Name, ContactName, Phone, Address) VALUES 
('CUS-001', 'Công ty TNHH Bán Lẻ ABC', 'Anh Tuấn', '0912345678', 'Quận 1, TP.HCM'),
('CUS-002', 'Siêu thị Coop Mart', 'Chị Lan', '0987654321', 'Quận 7, TP.HCM'),
('CUS-003', 'Cửa hàng Tiện Lợi 24h', 'Anh Hùng', '0909090909', 'Hoàn Kiếm, Hà Nội');

-- Suppliers
INSERT INTO Suppliers (SupplierCode, Name, Phone) VALUES 
('SUP-001', 'Tổng kho Phân Phối Miền Bắc', '024-3333333'),
('SUP-002', 'Công ty Xuất Nhập Khẩu Toàn Cầu', '028-4444444');

-- Categories & Products
INSERT INTO ProductCategories (CategoryCode, Name) VALUES ('CAT-ELEC', 'Điện tử'), ('CAT-FOOD', 'Thực phẩm');
INSERT INTO ProductUnits (UnitCode, Name) VALUES ('CAI', 'Cái'), ('THUNG', 'Thùng'), ('HOP', 'Hộp');

INSERT INTO Products (SKU, Name, CategoryId, BaseUnit, SafetyStock) VALUES 
('PROD-IP15', 'iPhone 15 Pro Max', 1, 'CAI', 10),
('PROD-MILS', 'Sữa tươi TH True Milk 1L', 2, 'HOP', 50);

-- Batches
INSERT INTO Batches (ProductId, BatchCode, ExpiryDate) VALUES 
(1, 'LOT-IP-001', '2026-12-31'),
(2, 'LOT-TH-2024', '2025-06-30');

-- Warehouse & Locations
INSERT INTO Warehouses (WarehouseCode, Name) VALUES ('WH-HN', 'Kho Tổng Hà Nội');
INSERT INTO Locations (WarehouseId, Zone, Aisle, Rack, Level, BinCode, Capacity, ContainerType) VALUES 
(1, 'ZONE-A', 'A1', 'R1', 'L1', 'A1-01-01', 100, 'CAI'),
(1, 'ZONE-B', 'B1', 'R2', 'L2', 'B1-02-02', 500, 'HOP');

-- Inventory (Thêm tồn kho ban đầu)
INSERT INTO Inventory (ProductId, BatchId, LocationId, QuantityOnHand, QuantityAllocated) VALUES 
(1, 1, 1, 50, 0),
(2, 2, 2, 200, 0);

-- Phiếu Xuất Mẫu (Outbound Orders)
-- Trạng thái: ALLOCATED (Đã phân bổ - hàng vẫn ở kho nhưng đã giữ chỗ)
INSERT INTO OutboundOrders (IssueCode, CustomerId, Status, TotalAmount, IssueDate, CreatedBy, Note) VALUES 
('XK20260505001', 1, 'ALLOCATED', 150000000, '2026-05-05 08:30:00', 3, 'Xuất hàng cho đại lý ABC'),
('XK20260505002', 2, 'DRAFT', 4500000, '2026-05-05 10:15:00', 3, 'Giao siêu thị Coop Mart');

-- Chi tiết phiếu xuất
INSERT INTO OutboundOrderDetails (OutboundOrderId, ProductId, BatchId, LocationId, Quantity, UnitPrice) VALUES 
(1, 1, 1, 1, 5, 30000000), -- 5 iPhone 15
(2, 2, 2, 2, 100, 45000);  -- 100 Hộp sữa

-- Cập nhật phân bổ cho hàng đang ở trạng thái ALLOCATED
UPDATE Inventory SET QuantityAllocated = 5 WHERE ProductId = 1 AND BatchId = 1 AND LocationId = 1;

GO
