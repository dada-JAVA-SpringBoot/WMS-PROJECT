-- ==============================================================================
-- DATABASE WMS - BẢN CHUẨN HÓA KIẾN TRÚC VÀ LOGIC
-- ==============================================================================
CREATE DATABASE WMS_DB;
GO
USE WMS_DB;
GO

-- 1. BẢNG DANH MỤC ĐỐI TÁC
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

-- 2. BẢNG DANH MỤC MASTER CHO SẢN PHẨM
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

-- 3. BẢNG SẢN PHẨM
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

-- 3.1 BẢNG QUY ĐỔI ĐƠN VỊ SẢN PHẨM
CREATE TABLE ProductUnitConversions (
Id INT IDENTITY(1,1) PRIMARY KEY,
ProductId INT NOT NULL FOREIGN KEY REFERENCES Products(Id),
UnitName NVARCHAR(50) NOT NULL, -- Tên đơn vị quy đổi (ví dụ: Thùng, Lốc)
ConversionFactor DECIMAL(18,4) NOT NULL, -- 1 UnitName = X BaseUnit
IsDefault BIT DEFAULT 0,
CreatedAt DATETIME2 DEFAULT GETDATE(),
CONSTRAINT UQ_Product_Unit UNIQUE (ProductId, UnitName)
);

-- 4. BẢNG TRUNG GIAN SẢN PHẨM & NHÀ CUNG CẤP (N-N)
CREATE TABLE ProductSuppliers (
ProductId INT FOREIGN KEY REFERENCES Products(Id),
SupplierId INT FOREIGN KEY REFERENCES Suppliers(Id),
IsDefault BIT DEFAULT 0,
PRIMARY KEY (ProductId, SupplierId)
);

-- 5. BẢNG QUẢN LÝ LÔ HÀNG
CREATE TABLE Batches (
Id INT IDENTITY(1,1) PRIMARY KEY,
ProductId INT NOT NULL FOREIGN KEY REFERENCES Products(Id),
BatchCode VARCHAR(100) NOT NULL,
ManufactureDate DATE,
ExpiryDate DATE NOT NULL,
CreatedAt DATETIME2 DEFAULT GETDATE(),
CONSTRAINT UQ_Product_Batch UNIQUE (ProductId, BatchCode)
);

-- 6. BẢNG KHO VÀ VỊ TRÍ
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
Capacity DECIMAL(18,2) DEFAULT 100,
StorageType NVARCHAR(20) DEFAULT N'NORMAL',
ContainerType NVARCHAR(20) DEFAULT N'THUNG'
);

-- 7. BẢNG TỒN KHO THỰC TẾ
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

-- 8. BẢNG SỔ KHO LỊCH SỬ (AUDIT)
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

-- 9. BẢNG GIAO DỊCH NHẬP KHO (Bản gộp hoàn chỉnh)
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

-- 10. BẢNG PHIẾU XUẤT KHO (Liên kết trực tiếp với Khách hàng)
CREATE TABLE OutboundOrders (
Id BIGINT IDENTITY(1,1) PRIMARY KEY,
IssueCode VARCHAR(50) UNIQUE NOT NULL,
CustomerId INT FOREIGN KEY REFERENCES Customers(Id),
Status VARCHAR(20) DEFAULT 'DRAFT',
IssueDate DATETIME2,
CreatedBy INT,
CreatedAt DATETIME2 DEFAULT GETDATE()
);

-- 11. CHI TIẾT PHIẾU XUẤT KHO
CREATE TABLE OutboundOrderDetails (
Id BIGINT IDENTITY(1,1) PRIMARY KEY,
OutboundOrderId BIGINT NOT NULL FOREIGN KEY REFERENCES OutboundOrders(Id),
ProductId INT NOT NULL FOREIGN KEY REFERENCES Products(Id),
BatchId INT NOT NULL FOREIGN KEY REFERENCES Batches(Id),
LocationId INT NOT NULL FOREIGN KEY REFERENCES Locations(Id),
Quantity DECIMAL(18,2) NOT NULL
);

-- 12. BẢNG NHÂN SỰ
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
CreatedAt DATETIME2 DEFAULT GETDATE()
);
GO

-- Chỉ mục tối ưu hóa
CREATE NONCLUSTERED INDEX IX_Batches_ExpiryDate ON Batches(ExpiryDate ASC);
CREATE NONCLUSTERED INDEX IX_Inventory_Lookup ON Inventory(ProductId, LocationId, BatchId);
CREATE NONCLUSTERED INDEX IX_Staff_WorkStatus ON Staff(WorkStatus);
CREATE NONCLUSTERED INDEX IX_Staff_Role ON Staff(WarehouseRole);
GO

-- ==============================================================================
-- INSERT DỮ LIỆU MẪU CƠ BẢN (HOÀN THIỆN ĐẦY ĐỦ LOGIC WMS)
-- ==============================================================================

-- 1. THÊM NHÀ CUNG CẤP, KHÁCH HÀNG, PHÂN LOẠI, ĐƠN VỊ TÍNH
INSERT INTO Suppliers (SupplierCode, Name, Phone, Address) VALUES
('SUP-VNM', N'Công ty CP Sữa Việt Nam (Vinamilk)', '0281234567', N'Quận 7, TP.HCM'),
('SUP-MSN', N'Tập đoàn Masan', '0287654321', N'Quận 1, TP.HCM'),
('SUP-SS', N'Samsung Electronics VN', '0909123456', N'KCNC Quận 9, TP.HCM'),
('SUP-CP', N'Công ty CP Chăn Nuôi C.P', '0988777666', N'Biên Hòa, Đồng Nai');

INSERT INTO Customers (CustomerCode, Name, Phone, Address) VALUES
('CUS-WIN', N'Chuỗi siêu thị WinMart', '19008888', N'Hai Bà Trưng, Hà Nội'),
('CUS-COOP', N'Siêu thị Co.opmart', '19005555', N'Quận 1, TP.HCM');

INSERT INTO ProductCategories (CategoryCode, Name, Description) VALUES
('CAT-SUA', N'Sữa & đồ uống dinh dưỡng', N'Sữa tươi, sữa hộp, đồ uống dinh dưỡng'),
('CAT-GIAVI', N'Gia vị & thực phẩm chế biến', N'Nước mắm, gia vị, đồ ăn chế biến'),
('CAT-DT', N'Điện tử', N'Smartphone, TV, thiết bị điện tử'),

('CAT-TUOI', N'Thịt, trứng & hàng tươi', N'Hàng tươi, thịt, trứng, thực phẩm lạnh'),
('CAT-KHO', N'Mì & đồ khô', N'Mì gói, thực phẩm khô, nguyên liệu đóng gói'),
('CAT-DH', N'Đồ hộp & hải sản', N'Đồ hộp, cá ngừ, thực phẩm đóng hộp');

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

-- 2. THÊM KHO & VỊ TRÍ
INSERT INTO Warehouses (WarehouseCode, Name, Address) VALUES ('WH-MAIN', N'Kho Tổng Trung Tâm', N'KCN Tân Bình, TP.HCM');
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

-- 3. THÊM 10 SẢN PHẨM
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

-- 4. LIÊN KẾT NHÀ CUNG CẤP (N-N)
INSERT INTO ProductSuppliers (ProductId, SupplierId) VALUES
   (1, 1), (5, 1), -- Vinamilk
   (2, 2), (6, 2), -- Masan
   (3, 3), (8, 3), -- Samsung
   (4, 4), (7, 4), (9, 4), -- C.P
   (10, 2);

-- 4.1 THÊM DỮ LIỆU QUY ĐỔI ĐƠN VỊ
INSERT INTO ProductUnitConversions (ProductId, UnitName, ConversionFactor) VALUES
    (1, N'Lốc', 4),      -- Sữa 1L: 1 Lốc = 4 Hộp
    (1, N'Thùng', 12),   -- Sữa 1L: 1 Thùng = 12 Hộp
    (2, N'Thùng', 24),   -- Nước mắm: 1 Thùng = 24 Chai
    (3, N'Thùng', 1),    -- TV: 1 Thùng = 1 Cái (Hàng cồng kềnh)
    (3, N'Pallet', 10),  -- TV: 1 Pallet = 10 Cái
    (4, N'Thùng', 20),   -- Thịt heo: 1 Thùng = 20 Khay
    (5, N'Thùng', 48),   -- Sữa 180ml: 1 Thùng = 48 Hộp
    (6, N'Gói', 0.0333), -- Mì: 1 Gói (Quy đổi ngược từ Thùng)
    (7, N'Thùng', 30),   -- Trứng: 1 Thùng = 30 Vỉ
    (8, N'Thùng', 10),   -- Điện thoại: 1 Thùng = 10 Cái
    (8, N'Pallet', 100), -- Điện thoại: 1 Pallet = 100 Cái
    (9, N'Thùng', 50);   -- Xúc xích: 1 Thùng = 50 Gói

-- 5. TẠO LÔ HÀNG ĐẦY ĐỦ CHO TẤT CẢ SẢN PHẨM (Nhiều hạn sử dụng)
INSERT INTO Batches (ProductId, BatchCode, ManufactureDate, ExpiryDate) VALUES
    (1, 'LOT-M1-OLD', '2023-01-01', '2023-07-01'),
    (1, 'LOT-M1-NEW', '2024-01-01', '2024-07-01'),
    (2, 'LOT-C1-001', '2023-12-01', '2024-12-01'),
    (3, 'LOT-TV-001', '2024-01-10', '2034-01-10'),
    (4, 'LOT-P-001', '2024-03-01', '2024-03-15'),
    (5, 'LOT-M180-A', '2024-02-01', '2024-08-01'),
    (5, 'LOT-M180-B', '2024-03-01', '2024-09-01'),
    (6, 'LOT-OMC-1', '2024-01-01', '2024-10-01'),
    (7, 'LOT-EGG-1', '2024-04-01', '2024-04-20'),
    (8, 'LOT-S24-1', '2024-02-15', '2034-02-15'),
    (9, 'LOT-XX-1', '2024-01-20', '2024-06-20'),
    (10,'LOT-TUN-1','2023-10-01', '2026-10-01');

-- 6. TỒN KHO THỰC TẾ & HÀNG ĐANG GIỮ CHỖ
INSERT INTO Inventory (ProductId, LocationId, BatchId, QuantityOnHand, QuantityAllocated) VALUES
    (1, 1, 1, 100, 0),   
    (1, 2, 2, 400, 50),  
    (2, 3, 3, 300, 100), 
    (3, 4, 4, 20, 2),    
    (4, 9, 5, 50, 0),    
    (4, 10, 5, 40, 5),   
    (5, 5, 6, 200, 0),   
    (5, 6, 7, 300, 20),  
    (6, 2, 8, 400, 0),   
    (7, 3, 9, 80, 15),   
    (7, 11, 9, 60, 10),  
    (8, 4, 10, 45, 5),   
    (9, 5, 11, 150, 0),  
    (9, 11, 11, 100, 0), 
    (10, 6, 12, 200, 0); 

-- 7. GHI LOG PHIẾU NHẬP
INSERT INTO InboundOrders (ReceiptCode, SupplierId, ReferenceNumber, Status, ReceiptDate, TotalAmount, CreatedBy) VALUES
     ('PN-2401-001', 1, 'PO-2401-001', 'COMPLETED', '2024-01-05', 6245000, 1),
     ('PN-2402-002', 2, 'PO-2402-002', 'COMPLETED', '2024-02-10', 14800000, 2),
     ('PN-2404-001', 1, 'PO-2404-001', 'IN_TRANSIT', DATEADD(day, 5, GETDATE()), 6245000, 1),
     ('PN-2404-002', 4, 'PO-2404-002', 'ORDERED', DATEADD(day, 9, GETDATE()), 14800000, 2),
     ('PN-2405-001', 2, 'PO-2405-001', 'DRAFT', GETDATE(), 250000, 2),
     ('PN-2405-002', 3, 'PO-2405-002', 'ORDERED', DATEADD(day, 7, GETDATE()), 1800000, 3),
     ('PN-2406-001', 4, 'PO-2406-001', 'IN_TRANSIT', DATEADD(day, 3, GETDATE()), 2340000, 3);

INSERT INTO InboundOrderDetails (InboundOrderId, ProductId, BatchId, LocationId, Quantity, QuantityExpected, UnitPrice, ItemCondition) VALUES
     (3, 1, 2, 2, 250, 250, 12500, N'Bình thường'),
     (3, 5, 7, 2, 600, 600, 5200, N'Bình thường'),
     (4, 4, 5, 1, 120, 120, 78000, N'Bình thường'),
     (4, 7, 9, 1, 160, 160, 34000, N'Bình thường'),
     (5, 6, 8, 1, 50, 50, 5000, N'Bình thường'),
     (6, 2, 3, 5, 100, 100, 18000, N'Bình thường'),
     (7, 4, 5, 9, 30, 30, 78000, N'Bình thường');

INSERT INTO InventoryTransactions (ProductId, LocationId, BatchId, TransactionType, QuantityChange)
SELECT ProductId, LocationId, BatchId, 'INBOUND', QuantityOnHand FROM Inventory;

-- 8. TẠO PHIẾU XUẤT KHO
INSERT INTO OutboundOrders (IssueCode, CustomerId, Status, IssueDate) VALUES
    ('OUT-2404-W01', 1, 'ALLOCATED', GETDATE());

INSERT INTO OutboundOrderDetails (OutboundOrderId, ProductId, BatchId, LocationId, Quantity) VALUES
       (1, 1, 2, 2, 50),
       (1, 2, 3, 1, 100),
       (1, 3, 4, 3, 2),
       (1, 5, 7, 2, 20),
       (1, 7, 9, 2, 15),
       (1, 8, 10, 3, 5);

-- 9. NHÂN SỰ
INSERT INTO Staff (EmployeeCode, FullName, Gender, DateOfBirth, Phone, Email, HireDate, ContractType, WarehouseRole, WorkStatus, Notes)
VALUES
    ('EMP-001', N'Nguyễn Minh Tuấn',   'MALE',   '1990-05-15', '0901234561', 'tuan.nm@wms.vn',    '2021-03-01', 'FULL_TIME',  'WAREHOUSE_MANAGER',   'ON_SHIFT',  N'Quản lý ca sáng'),
    ('EMP-002', N'Trần Thị Lan',       'FEMALE', '1995-08-22', '0901234562', 'lan.tt@wms.vn',     '2022-01-10', 'FULL_TIME',  'WAREHOUSE_KEEPER',    'ON_SHIFT',  N'Phụ trách khu A'),
    ('EMP-003', N'Lê Văn Hùng',        'MALE',   '1993-11-30', '0901234563', 'hung.lv@wms.vn',    '2022-06-15', 'FULL_TIME',  'INBOUND_STAFF',       'ON_SHIFT',  N'Ca sáng thứ 2-6'),
    ('EMP-004', N'Phạm Thị Hoa',       'FEMALE', '1998-03-10', '0901234564', 'hoa.pt@wms.vn',     '2023-02-20', 'PART_TIME',  'OUTBOUND_STAFF',      'OFF_SHIFT', N'Làm ca chiều T3,T5,T7'),
    ('EMP-005', N'Hoàng Đức Mạnh',     'MALE',   '1991-07-18', '0901234565', 'manh.hd@wms.vn',    '2020-11-01', 'FULL_TIME',  'INVENTORY_CHECKER',   'OFF_SHIFT', N'Kiểm kê định kỳ cuối tháng'),
    ('EMP-006', N'Nguyễn Thị Thu',     'FEMALE', '2000-12-05', '0901234566', 'thu.nt@wms.vn',     '2024-01-08', 'INTERN',     'INBOUND_STAFF',       'ON_SHIFT',  N'Thực tập sinh khóa 2024'),
    ('EMP-007', N'Võ Văn Tài',         'MALE',   '1988-04-25', '0901234567', 'tai.vv@wms.vn',     '2019-05-15', 'FULL_TIME',  'WAREHOUSE_KEEPER',    'RESIGNED',  N'Kết thúc hợp đồng 31/12/2023'),
    ('EMP-008', N'Đặng Thị Mỹ Linh',   'FEMALE', '1997-09-14', '0901234568', 'linh.dtm@wms.vn',   '2023-07-01', 'PROBATION',  'OUTBOUND_STAFF',      'ON_SHIFT',  N'Đang trong thời gian thử việc'),
    ('EMP-009', N'Bùi Quang Vinh',     'MALE',   '1994-01-20', '0901234569', 'vinh.bq@wms.vn',    '2021-09-10', 'FULL_TIME',  'INVENTORY_CHECKER',   'OFF_SHIFT', N'Phụ trách khu B và C'),
    ('EMP-010', N'Trương Thị Ngọc',    'FEMALE', '2001-06-03', '0901234570', 'ngoc.tt@wms.vn',    '2024-03-01', 'INTERN',     'OUTBOUND_STAFF',      'OFF_SHIFT', N'Thực tập sinh khóa Spring 2024');
GO

-- ==============================================================================
-- RBAC MIGRATION — Chạy script này vào WMS_DB sau setup.sql
-- Thêm cột login vào Staff, tạo bảng Roles + bảng trung gian Staff_Roles
-- ==============================================================================
USE WMS_DB;
GO

-- 1. THÊM CỘT ĐĂNG NHẬP VÀO BẢNG STAFF (nếu chưa có)
ALTER TABLE Staff ADD
    Username  VARCHAR(100) NULL,
    Password  VARCHAR(255) NULL,   -- BCrypt hash
    Enabled   BIT NOT NULL DEFAULT 1;
GO

-- Đảm bảo Username là duy nhất
ALTER TABLE Staff ADD CONSTRAINT UQ_Staff_Username UNIQUE (Username);
GO

-- 2. BẢNG ROLES
CREATE TABLE Roles (
                       Id        INT IDENTITY(1,1) PRIMARY KEY,
                       RoleName  VARCHAR(50) UNIQUE NOT NULL,   -- ADMIN, MANAGER, STOREKEEPER, ...
                       Description NVARCHAR(255) NULL
);
GO

-- 3. BẢNG TRUNG GIAN STAFF_ROLES (Many-to-Many)
CREATE TABLE Staff_Roles (
                             StaffId INT NOT NULL FOREIGN KEY REFERENCES Staff(Id),
                             RoleId  INT NOT NULL FOREIGN KEY REFERENCES Roles(Id),
                             PRIMARY KEY (StaffId, RoleId)
);
GO

-- ==============================================================================
-- INSERT DỮ LIỆU MẶC ĐỊNH
-- ==============================================================================

-- 4. TẠO 6 ROLES
INSERT INTO Roles (RoleName, Description) VALUES
                                              ('ADMIN',           N'Quản trị hệ thống toàn quyền'),
                                              ('MANAGER',         N'Quản lý kho — xem báo cáo, duyệt phiếu'),
                                              ('STOREKEEPER',     N'Thủ kho — quản lý tồn kho, vị trí'),
                                              ('INBOUND_STAFF',   N'Nhân viên nhập kho — tạo và xử lý phiếu nhập'),
                                              ('OUTBOUND_STAFF',  N'Nhân viên xuất kho — tạo và xử lý phiếu xuất'),
                                              ('CHECKER',         N'Kiểm kê viên — kiểm tra và đối soát tồn kho');
GO

-- 5. TẠO TÀI KHOẢN ADMIN MẶC ĐỊNH
--    Password gốc: Admin@123  (BCrypt hash bên dưới)
--    Sau khi login lần đầu nên đổi mật khẩu!
INSERT INTO Staff (
    EmployeeCode, FullName, Gender, ContractType,
    WarehouseRole, WorkStatus, Username, Password, Enabled
) VALUES (
             'EMP-ADMIN',
             N'Quản trị viên hệ thống',
             'MALE',
             'FULL_TIME',
             'WAREHOUSE_MANAGER',
             'ON_SHIFT',
             'admin',
             '$2a$12$YSNbpfnUMByiNEjxyoqVn.Y4VXHb.Y5J9qYLYCOLQj.FHjVoWXREe',  -- Admin@123
             1
         );
GO

-- 6. GÁN ROLE ADMIN CHO TÀI KHOẢN ADMIN
INSERT INTO Staff_Roles (StaffId, RoleId)
SELECT s.Id, r.Id
FROM Staff s, Roles r
WHERE s.Username = 'admin' AND r.RoleName = 'ADMIN';
GO

-- 7. GÁN ROLE PHÙHỢP CHO 10 NHÂN VIÊN MẪU (từ setup.sql)
--    EMP-001 (WAREHOUSE_MANAGER) -> MANAGER
--    EMP-002 (WAREHOUSE_KEEPER)  -> STOREKEEPER
--    EMP-003, EMP-006            -> INBOUND_STAFF
--    EMP-004, EMP-008, EMP-010   -> OUTBOUND_STAFF
--    EMP-005, EMP-009            -> CHECKER

-- Cập nhật username + password cho nhân viên mẫu (password: Staff@123)
UPDATE Staff SET
                 Username = LOWER(REPLACE(EmployeeCode, '-', '_')),
                 Password = '$2a$12$8K1p/a0dR1xqM8K5Jt8K8O.bZvZ5vZ5vZ5vZ5vZ5vZ5vZ5vZ5vZ5.',
                 Enabled  = 1
WHERE EmployeeCode IN ('EMP-001','EMP-002','EMP-003','EMP-004','EMP-005',
                       'EMP-006','EMP-007','EMP-008','EMP-009','EMP-010');
GO

-- EMP-007 (đã nghỉ) -> disabled
UPDATE Staff SET Enabled = 0 WHERE EmployeeCode = 'EMP-007';
GO

INSERT INTO Staff_Roles (StaffId, RoleId)
SELECT s.Id, r.Id FROM Staff s JOIN Roles r ON r.RoleName = 'MANAGER'
WHERE s.EmployeeCode = 'EMP-001';

INSERT INTO Staff_Roles (StaffId, RoleId)
SELECT s.Id, r.Id FROM Staff s JOIN Roles r ON r.RoleName = 'STOREKEEPER'
WHERE s.EmployeeCode = 'EMP-002';

INSERT INTO Staff_Roles (StaffId, RoleId)
SELECT s.Id, r.Id FROM Staff s JOIN Roles r ON r.RoleName = 'INBOUND_STAFF'
WHERE s.EmployeeCode IN ('EMP-003','EMP-006');

INSERT INTO Staff_Roles (StaffId, RoleId)
SELECT s.Id, r.Id FROM Staff s JOIN Roles r ON r.RoleName = 'OUTBOUND_STAFF'
WHERE s.EmployeeCode IN ('EMP-004','EMP-008','EMP-010');

INSERT INTO Staff_Roles (StaffId, RoleId)
SELECT s.Id, r.Id FROM Staff s JOIN Roles r ON r.RoleName = 'CHECKER'
WHERE s.EmployeeCode IN ('EMP-005','EMP-009');
GO
