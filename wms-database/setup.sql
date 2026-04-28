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

-- 2. BẢNG SẢN PHẨM (Đã xóa cột SupplierCodes để chuẩn hóa)
CREATE TABLE Products (
Id INT IDENTITY(1,1) PRIMARY KEY,
Sku VARCHAR(50) UNIQUE NOT NULL,
Barcode VARCHAR(100),
Name NVARCHAR(255) NOT NULL,
BaseUnit NVARCHAR(50) NOT NULL,
CategoryId INT,
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

-- 3. BẢNG TRUNG GIAN SẢN PHẨM & NHÀ CUNG CẤP (N-N)
CREATE TABLE ProductSuppliers (
ProductId INT FOREIGN KEY REFERENCES Products(Id),
SupplierId INT FOREIGN KEY REFERENCES Suppliers(Id),
IsDefault BIT DEFAULT 0,
PRIMARY KEY (ProductId, SupplierId)
);

-- 4. BẢNG QUẢN LÝ LÔ HÀNG
CREATE TABLE Batches (
Id INT IDENTITY(1,1) PRIMARY KEY,
ProductId INT NOT NULL FOREIGN KEY REFERENCES Products(Id),
BatchCode VARCHAR(100) NOT NULL,
ManufactureDate DATE,
ExpiryDate DATE NOT NULL,
CreatedAt DATETIME2 DEFAULT GETDATE(),
CONSTRAINT UQ_Product_Batch UNIQUE (ProductId, BatchCode)
);

-- 5. BẢNG KHO VÀ VỊ TRÍ
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
BinCode VARCHAR(50) UNIQUE NOT NULL
);

-- 6. BẢNG TỒN KHO THỰC TẾ
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

-- 7. BẢNG SỔ KHO LỊCH SỬ (AUDIT)
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
-- 8. BẢNG GIAO DỊCH NHẬP KHO (Bản gộp hoàn chỉnh)
CREATE TABLE InboundOrders (
Id BIGINT IDENTITY(1,1) PRIMARY KEY,
ReceiptCode VARCHAR(50) UNIQUE NOT NULL,
SupplierId INT FOREIGN KEY REFERENCES Suppliers(Id),
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
UnitPrice DECIMAL(18, 2) DEFAULT 0,
TotalPrice AS (Quantity * UnitPrice)
);
-- 9. BẢNG PHIẾU XUẤT KHO (Liên kết trực tiếp với Khách hàng)
CREATE TABLE OutboundOrders (
Id BIGINT IDENTITY(1,1) PRIMARY KEY,
IssueCode VARCHAR(50) UNIQUE NOT NULL,
CustomerId INT FOREIGN KEY REFERENCES Customers(Id), -- ĐÂY CHÍNH LÀ NƠI KÉO DÂY LIÊN KẾT
Status VARCHAR(20) DEFAULT 'DRAFT', -- Trạng thái: DRAFT, ALLOCATED, PICKED, SHIPPED
IssueDate DATETIME2,
CreatedBy INT,
CreatedAt DATETIME2 DEFAULT GETDATE()
);

-- 10. CHI TIẾT PHIẾU XUẤT KHO
CREATE TABLE OutboundOrderDetails (
Id BIGINT IDENTITY(1,1) PRIMARY KEY,
OutboundOrderId BIGINT NOT NULL FOREIGN KEY REFERENCES OutboundOrders(Id),
ProductId INT NOT NULL FOREIGN KEY REFERENCES Products(Id),
BatchId INT NOT NULL FOREIGN KEY REFERENCES Batches(Id), -- Xuất từ Lô nào (FEFO)
LocationId INT NOT NULL FOREIGN KEY REFERENCES Locations(Id), -- Lấy hàng từ Ô kệ nào
Quantity DECIMAL(18,2) NOT NULL
);

--11
CREATE TABLE Staff (
                       Id              INT IDENTITY(1,1) PRIMARY KEY,
                       EmployeeCode    VARCHAR(50)      UNIQUE NOT NULL,
                       FullName        NVARCHAR(255)    NOT NULL,
                       Gender          VARCHAR(10)      NOT NULL DEFAULT 'MALE',       -- MALE | FEMALE
                       DateOfBirth     DATE             NULL,
                       Phone           VARCHAR(20)      NULL,
                       Email           VARCHAR(255)     NULL,
                       HireDate        DATE             NOT NULL DEFAULT CAST(GETDATE() AS DATE),
                       ContractType    VARCHAR(20)      NOT NULL DEFAULT 'FULL_TIME',  -- FULL_TIME | PART_TIME | PROBATION | INTERN
                       WarehouseRole   VARCHAR(30)      NOT NULL DEFAULT 'INBOUND_STAFF',
    -- WAREHOUSE_KEEPER | INBOUND_STAFF | OUTBOUND_STAFF | INVENTORY_CHECKER | WAREHOUSE_MANAGER
                       WorkStatus      VARCHAR(20)      NOT NULL DEFAULT 'OFF_SHIFT',
    -- ON_SHIFT | OFF_SHIFT | RESIGNED
                       Notes           NVARCHAR(500)    NULL,
                       CreatedAt       DATETIME2        DEFAULT GETDATE()
);
GO

-- Chỉ mục tối ưu hóa
CREATE NONCLUSTERED INDEX IX_Batches_ExpiryDate ON Batches(ExpiryDate ASC);
CREATE NONCLUSTERED INDEX IX_Inventory_Lookup ON Inventory(ProductId, LocationId, BatchId);
-- Chỉ mục tối ưu tìm kiếm
CREATE NONCLUSTERED INDEX IX_Staff_WorkStatus ON Staff(WorkStatus);
CREATE NONCLUSTERED INDEX IX_Staff_Role ON Staff(WarehouseRole);
GO


-- ==============================================================================
-- INSERT DỮ LIỆU MẪU CƠ BẢN (HOÀN THIỆN ĐẦY ĐỦ LOGIC WMS)
-- ==============================================================================

-- 1. THÊM NHÀ CUNG CẤP & KHÁCH HÀNG
INSERT INTO Suppliers (SupplierCode, Name, Phone, Address) VALUES
('SUP-VNM', N'Công ty CP Sữa Việt Nam (Vinamilk)', '0281234567', N'Quận 7, TP.HCM'),
('SUP-MSN', N'Tập đoàn Masan', '0287654321', N'Quận 1, TP.HCM'),
('SUP-SS', N'Samsung Electronics VN', '0909123456', N'KCNC Quận 9, TP.HCM'),
('SUP-CP', N'Công ty CP Chăn Nuôi C.P', '0988777666', N'Biên Hòa, Đồng Nai');

INSERT INTO Customers (CustomerCode, Name, Phone, Address) VALUES
('CUS-WIN', N'Chuỗi siêu thị WinMart', '19008888', N'Hai Bà Trưng, Hà Nội'),
('CUS-COOP', N'Siêu thị Co.opmart', '19005555', N'Quận 1, TP.HCM');

-- 2. THÊM KHO & VỊ TRÍ
INSERT INTO Warehouses (WarehouseCode, Name, Address) VALUES ('WH-MAIN', N'Kho Tổng Trung Tâm', N'KCN Tân Bình, TP.HCM');
INSERT INTO Locations (WarehouseId, Zone, Aisle, Rack, Level, BinCode) VALUES
   (1, 'A', '01', '01', '1', 'WH1-A-01-01-1'),
   (1, 'B', '02', '01', '1', 'WH1-B-02-01-1'),
   (1, 'C', '03', '01', '1', 'WH1-C-03-01-1');

-- 3. THÊM 10 SẢN PHẨM
INSERT INTO Products (Sku, Barcode, Name, BaseUnit, CategoryId, Weight, Length, Width, Height, StorageTemp, SafetyStock, IsFragile, ImageUrl, Status) VALUES
 ('MILK-1L', '89301', N'Sữa tươi Vinamilk 1L', N'Hộp', 1, 1.05, 10, 7, 20, N'Bình thường', 500, 0, 'https://placehold.co/600/e0f2fe/0369a1?text=Sua+Vinamilk', 'ACTIVE'),
 ('CHINSU-1', '89302', N'Nước mắm Chinsu 500ml', N'Chai', 1, 0.6, 6, 6, 25, N'Bình thường', 300, 1, 'https://placehold.co/600/fee2e2/991b1b?text=Chinsu', 'ACTIVE'),
 ('TV-65', '89303', N'Smart TV Samsung 65"', N'Cái', 3, 25.0, 145, 15, 85, N'Bình thường', 10, 1, 'https://placehold.co/600/1e3a8a/eff6ff?text=TV+Samsung', 'ACTIVE'),
 ('PORK-CP', '89304', N'Thịt heo CP (Khay 500g)', N'Khay', 4, 0.5, 20, 15, 3, N'Kho Lạnh', 100, 0, 'https://placehold.co/600/fecdd3/be123c?text=Thit+Heo', 'ACTIVE'),
 ('MILK-180', '89305', N'Sữa tươi Vinamilk 180ml', N'Lốc', 1, 0.8, 15, 10, 12, N'Bình thường', 200, 0, 'https://placehold.co/600/e0f2fe/0369a1?text=Sua+180ml', 'ACTIVE'),
 ('NOODLE-O', '89306', N'Mì Omachi (Thùng 30 gói)', N'Thùng', 2, 2.5, 40, 30, 20, N'Bình thường', 400, 0, 'https://placehold.co/600/fef08a/854d0e?text=Omachi', 'ACTIVE'),
 ('EGG-CP', '89307', N'Trứng gà CP (Vỉ 10)', N'Vỉ', 4, 0.6, 25, 10, 7, N'Bình thường', 100, 1, 'https://placehold.co/600/fefce8/a16207?text=Trung+Ga', 'ACTIVE'),
 ('PHONE-SS', '89308', N'Samsung Galaxy S24', N'Cái', 3, 0.2, 15, 7, 1, N'Bình thường', 50, 1, 'https://placehold.co/600/374151/f3f4f6?text=Galaxy+S24', 'ACTIVE'),
 ('SAUSAGE', '89309', N'Xúc xích CP tiệt trùng', N'Gói', 4, 0.2, 10, 5, 2, N'Kho Mát', 150, 0, 'https://placehold.co/600/fecdd3/be123c?text=Xuc+Xich', 'ACTIVE'),
 ('TUNA-01', '89310', N'Cá ngừ đóng hộp', N'Hộp', 1, 0.2, 8, 8, 4, N'Bình thường', 300, 0, 'https://placehold.co/600/bfdbfe/1e40af?text=Ca+Ngu', 'INACTIVE');

-- 4. LIÊN KẾT NHÀ CUNG CẤP (N-N)
INSERT INTO ProductSuppliers (ProductId, SupplierId) VALUES
   (1, 1), (5, 1), -- Vinamilk
   (2, 2), (6, 2), -- Masan
   (3, 3), (8, 3), -- Samsung
   (4, 4), (7, 4), (9, 4), -- C.P
   (10, 2);

-- 5. TẠO LÔ HÀNG ĐẦY ĐỦ CHO TẤT CẢ SẢN PHẨM (Nhiều hạn sử dụng)
INSERT INTO Batches (ProductId, BatchCode, ManufactureDate, ExpiryDate) VALUES
    (1, 'LOT-M1-OLD', '2023-01-01', '2023-07-01'), -- SP1: Sữa 1L (Đã hết hạn)
    (1, 'LOT-M1-NEW', '2024-01-01', '2024-07-01'), -- SP1: Sữa 1L (Còn hạn)
    (2, 'LOT-C1-001', '2023-12-01', '2024-12-01'), -- SP2: Chinsu
    (3, 'LOT-TV-001', '2024-01-10', '2034-01-10'), -- SP3: TV
    (4, 'LOT-P-001', '2024-03-01', '2024-03-15'),  -- SP4: Thịt heo (Sắp hết hạn)
    (5, 'LOT-M180-A', '2024-02-01', '2024-08-01'), -- SP5: Sữa 180ml
    (5, 'LOT-M180-B', '2024-03-01', '2024-09-01'), -- SP5: Sữa 180ml
    (6, 'LOT-OMC-1', '2024-01-01', '2024-10-01'),  -- SP6: Omachi
    (7, 'LOT-EGG-1', '2024-04-01', '2024-04-20'),  -- SP7: Trứng gà
    (8, 'LOT-S24-1', '2024-02-15', '2034-02-15'),  -- SP8: Điện thoại
    (9, 'LOT-XX-1', '2024-01-20', '2024-06-20'),   -- SP9: Xúc xích
    (10,'LOT-TUN-1','2023-10-01', '2026-10-01');   -- SP10: Cá ngừ (Ngừng kinh doanh nhưng vẫn còn tồn)

-- 6. TỒN KHO THỰC TẾ & HÀNG ĐANG GIỮ CHỖ (QuantityAllocated)
-- Lưu ý: Cột cuối cùng là QuantityAllocated (Số lượng đang bị giữ chờ xuất kho)
INSERT INTO Inventory (ProductId, LocationId, BatchId, QuantityOnHand, QuantityAllocated) VALUES
    (1, 1, 1, 100, 0),   -- 100 hộp sữa hết hạn (Không giữ chỗ)
    (1, 2, 2, 500, 50),  -- 500 hộp sữa mới -> ĐANG GIỮ CHỖ 50 hộp
    (2, 1, 3, 300, 100), -- 300 chai Chinsu -> ĐANG GIỮ CHỖ 100 chai
    (3, 3, 4, 20, 2),    -- 20 cái TV -> ĐANG GIỮ CHỖ 2 cái
    (4, 2, 5, 50, 0),    -- 50 khay thịt (Không giữ)
    (5, 1, 6, 200, 0),   -- 200 lốc sữa 180ml (Lô A)
    (5, 2, 7, 300, 20),  -- 300 lốc sữa 180ml (Lô B) -> ĐANG GIỮ CHỖ 20
    (6, 1, 8, 400, 0),   -- 400 thùng Omachi
    (7, 2, 9, 80, 15),   -- 80 vỉ trứng -> ĐANG GIỮ CHỖ 15
    (8, 3, 10, 45, 5),   -- 45 cái S24 -> ĐANG GIỮ CHỖ 5
    (9, 1, 11, 150, 0),  -- 150 gói xúc xích
    (10, 2, 12, 200, 0); -- 200 hộp cá ngừ

-- 7. GHI LOG PHIẾU NHẬP (Tạo nguồn gốc hàng hóa)
INSERT INTO InboundOrders (ReceiptCode, SupplierId, Status, ReceiptDate) VALUES
     ('RC-2401-001', 1, 'COMPLETED', '2024-01-05'),
     ('RC-2402-002', 2, 'COMPLETED', '2024-02-10');

INSERT INTO InventoryTransactions (ProductId, LocationId, BatchId, TransactionType, QuantityChange)
SELECT ProductId, LocationId, BatchId, 'INBOUND', QuantityOnHand FROM Inventory;

-- 8. TẠO PHIẾU XUẤT KHO (Làm rõ lý do tại sao lại có hàng "Giữ chỗ")
-- Trạng thái 'ALLOCATED' nghĩa là hệ thống đã khóa tồn kho nhưng chưa đem ra khỏi cửa
INSERT INTO OutboundOrders (IssueCode, CustomerId, Status, IssueDate) VALUES
    ('OUT-2404-W01', 1, 'ALLOCATED', GETDATE());

-- Chi tiết phiếu xuất (Khớp chính xác với số lượng Allocated ở bảng Inventory bên trên)
INSERT INTO OutboundOrderDetails (OutboundOrderId, ProductId, BatchId, LocationId, Quantity) VALUES
       (1, 1, 2, 2, 50),   -- Xuất 50 Sữa 1L (Lô M1-NEW)
       (1, 2, 3, 1, 100),  -- Xuất 100 Chinsu
       (1, 3, 4, 3, 2),    -- Xuất 2 TV
       (1, 5, 7, 2, 20),   -- Xuất 20 Sữa 180ml
       (1, 7, 9, 2, 15),   -- Xuất 15 Trứng
       (1, 8, 10, 3, 5);   -- Xuất 5 Điện thoại

--
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