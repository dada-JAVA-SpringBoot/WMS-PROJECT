-- Tạo Database WMS nếu chưa có
CREATE DATABASE WMS_DB;
GO

USE WMS_DB;
GO

-- Tạo bảng mẫu
-- 1. Bảng Khách hàng & Nhà cung cấp
CREATE TABLE Suppliers (
Id INT IDENTITY(1,1) PRIMARY KEY,
SupplierCode VARCHAR(50) UNIQUE NOT NULL,
Name NVARCHAR(255) NOT NULL,
Phone VARCHAR(20),
Address NVARCHAR(500)
);

CREATE TABLE Customers (
Id INT IDENTITY(1,1) PRIMARY KEY,
CustomerCode VARCHAR(50) UNIQUE NOT NULL,
Name NVARCHAR(255) NOT NULL,
Phone VARCHAR(20),
Address NVARCHAR(500)
);

-- 2. Bảng Sản phẩm (Products)
CREATE TABLE Products (
Id INT IDENTITY(1,1) PRIMARY KEY,
Sku VARCHAR(50) UNIQUE NOT NULL,
Barcode VARCHAR(100),
Name NVARCHAR(255) NOT NULL,
BaseUnit NVARCHAR(50) NOT NULL, -- Ví dụ: Hộp, Thùng, Cái
CategoryId INT,
CreatedAt DATETIME2 DEFAULT GETDATE()
);

-- 3. Bảng Quản lý Số Lô (Batches) - Cực kỳ quan trọng cho FEFO
CREATE TABLE Batches (
Id INT IDENTITY(1,1) PRIMARY KEY,
ProductId INT NOT NULL FOREIGN KEY REFERENCES Products(Id),
BatchCode VARCHAR(100) NOT NULL,
ManufactureDate DATE,
ExpiryDate DATE NOT NULL, -- Dùng để Sort khi xuất FEFO
CreatedAt DATETIME2 DEFAULT GETDATE(),
CONSTRAINT UQ_Product_Batch UNIQUE (ProductId, BatchCode) -- 1 SP không trùng mã Lô
);
-- 4. Bảng Kho Tổng (Warehouses)
CREATE TABLE Warehouses (
Id INT IDENTITY(1,1) PRIMARY KEY,
WarehouseCode VARCHAR(50) UNIQUE NOT NULL,
Name NVARCHAR(255) NOT NULL,
Address NVARCHAR(500)
);

-- 5. Bảng Vị trí chi tiết (Locations / Bins)
CREATE TABLE Locations (
Id INT IDENTITY(1,1) PRIMARY KEY,
WarehouseId INT NOT NULL FOREIGN KEY REFERENCES Warehouses(Id),
Zone NVARCHAR(50),  -- Khu vực
Aisle NVARCHAR(50), -- Dãy
Rack NVARCHAR(50),  -- Kệ
Level NVARCHAR(50), -- Tầng
BinCode VARCHAR(50) UNIQUE NOT NULL -- Mã định danh ô kệ (VD: WH1-A-01)
);
-- 6. Bảng Tồn kho tức thời (Inventory)
-- Lưu ý: Gom nhóm theo Product + Location + Batch
CREATE TABLE Inventory (
Id BIGINT IDENTITY(1,1) PRIMARY KEY,
ProductId INT NOT NULL FOREIGN KEY REFERENCES Products(Id),
LocationId INT NOT NULL FOREIGN KEY REFERENCES Locations(Id),
BatchId INT NOT NULL FOREIGN KEY REFERENCES Batches(Id),
QuantityOnHand DECIMAL(18,2) DEFAULT 0, -- Số lượng thực tế (Dùng Decimal phòng trường hợp hàng cân ký)
QuantityAllocated DECIMAL(18,2) DEFAULT 0, -- Số lượng giữ chỗ chờ xuất
LastUpdated DATETIME2 DEFAULT GETDATE(),
CONSTRAINT UQ_Inventory_Stock UNIQUE (ProductId, LocationId, BatchId)
);

-- 7. Bảng Sổ kho / Thẻ kho (Inventory Transactions) - Audit Log
CREATE TABLE InventoryTransactions (
Id BIGINT IDENTITY(1,1) PRIMARY KEY,
ProductId INT NOT NULL FOREIGN KEY REFERENCES Products(Id),
LocationId INT NOT NULL FOREIGN KEY REFERENCES Locations(Id),
BatchId INT NOT NULL FOREIGN KEY REFERENCES Batches(Id),
TransactionType VARCHAR(20) NOT NULL, -- INBOUND, OUTBOUND, TRANSFER, ADJUSTMENT
QuantityChange DECIMAL(18,2) NOT NULL, -- Số lượng thay đổi (+ hoặc -)
ReferenceId BIGINT, -- ID của chi tiết phiếu nhập/xuất tương ứng
CreatedBy INT, -- ID nhân viên thao tác
CreatedAt DATETIME2 DEFAULT GETDATE()
);
-- 8. Phiếu Nhập kho (Inbound Orders)
CREATE TABLE InboundOrders (
Id BIGINT IDENTITY(1,1) PRIMARY KEY,
ReceiptCode VARCHAR(50) UNIQUE NOT NULL,
SupplierId INT FOREIGN KEY REFERENCES Suppliers(Id),
Status VARCHAR(20) DEFAULT 'DRAFT', -- DRAFT, COMPLETED, CANCELLED
ReceiptDate DATETIME2,
CreatedBy INT,
CreatedAt DATETIME2 DEFAULT GETDATE()
);

-- 9. Chi tiết Phiếu Nhập
CREATE TABLE InboundOrderDetails (
Id BIGINT IDENTITY(1,1) PRIMARY KEY,
InboundOrderId BIGINT NOT NULL FOREIGN KEY REFERENCES InboundOrders(Id),
ProductId INT NOT NULL FOREIGN KEY REFERENCES Products(Id),
BatchId INT NOT NULL FOREIGN KEY REFERENCES Batches(Id),
LocationId INT NOT NULL FOREIGN KEY REFERENCES Locations(Id), -- Cất vào ô nào
Quantity DECIMAL(18,2) NOT NULL
);

-- 10. Phiếu Xuất kho (Outbound Orders)
CREATE TABLE OutboundOrders (
Id BIGINT IDENTITY(1,1) PRIMARY KEY,
IssueCode VARCHAR(50) UNIQUE NOT NULL,
CustomerId INT FOREIGN KEY REFERENCES Customers(Id),
Status VARCHAR(20) DEFAULT 'DRAFT', -- DRAFT, ALLOCATED, PICKED, SHIPPED
IssueDate DATETIME2,
CreatedBy INT,
CreatedAt DATETIME2 DEFAULT GETDATE()
);

-- 11. Chi tiết Phiếu Xuất
CREATE TABLE OutboundOrderDetails (
Id BIGINT IDENTITY(1,1) PRIMARY KEY,
OutboundOrderId BIGINT NOT NULL FOREIGN KEY REFERENCES OutboundOrders(Id),
ProductId INT NOT NULL FOREIGN KEY REFERENCES Products(Id),
BatchId INT NOT NULL FOREIGN KEY REFERENCES Batches(Id), -- Lấy từ lô nào
LocationId INT NOT NULL FOREIGN KEY REFERENCES Locations(Id), -- Lấy từ ô kệ nào
Quantity DECIMAL(18,2) NOT NULL
);
CREATE NONCLUSTERED INDEX IX_Batches_ExpiryDate ON Batches(ExpiryDate ASC);
CREATE NONCLUSTERED INDEX IX_Inventory_Lookup ON Inventory(ProductId, LocationId, BatchId);
GO

-- Thêm dữ liệu mẫu
-- 1. Thêm Nhà cung cấp
INSERT INTO Suppliers (SupplierCode, Name, Phone, Address) VALUES
('SUP-VNM', N'Công ty Cổ phần Sữa Việt Nam (Vinamilk)', '19001568', N'Quận 7, TP.HCM'),
('SUP-ORION', N'Công ty TNHH Thực phẩm Orion Vina', '0274356789', N'Bến Cát, Bình Dương');

-- 2. Thêm Khách hàng
INSERT INTO Customers (CustomerCode, Name, Phone, Address) VALUES
('CUS-WINMART', N'Chuỗi siêu thị WinMart', '19008888', N'Hai Bà Trưng, Hà Nội'),
('CUS-COOP', N'Siêu thị Co.opmart', '19005555', N'Quận 1, TP.HCM');

-- 3. Thêm Sản phẩm
INSERT INTO Products (Sku, Barcode, Name, BaseUnit, CategoryId) VALUES
('MILK-1L', '8934567890123', N'Sữa tươi tiệt trùng Vinamilk 1L', N'Hộp', 1),
('CHOCOPIE-12', '8938765432109', N'Bánh Chocopie hộp 12 cái', N'Hộp', 2);

-- 4. Thêm Số Lô (Giả lập lô sữa cận date và lô date xa)
INSERT INTO Batches (ProductId, BatchCode, ManufactureDate, ExpiryDate) VALUES
(1, 'LOT-M-001', '2023-10-01', '2024-04-01'), -- ID=1: Sữa Lô 1 (Cận Date)
(1, 'LOT-M-002', '2023-12-01', '2024-06-01'), -- ID=2: Sữa Lô 2 (Date xa)
(2, 'LOT-C-001', '2023-11-01', '2024-11-01'); -- ID=3: Bánh Lô 1

-- 5. Thêm Kho Tổng
INSERT INTO Warehouses (WarehouseCode, Name, Address) VALUES
    ('WH-HN', N'Kho Tổng Miền Bắc', N'KCN Tiên Sơn, Bắc Ninh');

-- 6. Thêm Vị trí lưu trữ (Ô kệ)
INSERT INTO Locations (WarehouseId, Zone, Aisle, Rack, Level, BinCode) VALUES
(1, 'A', '01', '01', '1', 'WH1-A-01-01-1'), -- ID=1: Khu A, Kệ 1, Tầng 1
(1, 'A', '01', '01', '2', 'WH1-A-01-01-2'), -- ID=2: Khu A, Kệ 1, Tầng 2
(1, 'B', '02', '01', '1', 'WH1-B-02-01-1'); -- ID=3: Khu B, Kệ 2, Tầng 1
-- 7. Khởi tạo Tồn kho ban đầu
-- Giả sử cất 2 lô sữa ở 2 tầng khác nhau, bánh để ở khu B
INSERT INTO Inventory (ProductId, LocationId, BatchId, QuantityOnHand, QuantityAllocated) VALUES
(1, 1, 1, 500.00, 0.00),  -- Sữa Lô 1 (Cận date) để ở Tầng 1: Tồn 500 hộp
(1, 2, 2, 1000.00, 0.00), -- Sữa Lô 2 (Date xa) để ở Tầng 2: Tồn 1000 hộp
(2, 3, 3, 2000.00, 0.00); -- Bánh để ở Khu B: Tồn 2000 hộp

-- 8. Ghi log Sổ kho cho đợt tồn kho ban đầu (Audit Log)
INSERT INTO InventoryTransactions (ProductId, LocationId, BatchId, TransactionType, QuantityChange, ReferenceId, CreatedBy) VALUES
(1, 1, 1, 'INBOUND', 500.00, NULL, 1),
(1, 2, 2, 'INBOUND', 1000.00, NULL, 1),
(2, 3, 3, 'INBOUND', 2000.00, NULL, 1);

-- 9. Giả lập tạo 1 Phiếu Xuất (Khách hàng Winmart mua 700 hộp sữa)
INSERT INTO OutboundOrders (IssueCode, CustomerId, Status, IssueDate, CreatedBy) VALUES
('OUT-202401-001', 1, 'DRAFT', GETDATE(), 1);

-- 10. Giả lập Backend chạy thuật toán FEFO để tạo Chi tiết Phiếu Xuất
-- Backend thấy Winmart cần 700 hộp. Lô 1 cận date chỉ còn 500 hộp -> Lấy hết Lô 1.
-- Còn thiếu 200 hộp -> Lấy tiếp từ Lô 2.
INSERT INTO OutboundOrderDetails (OutboundOrderId, ProductId, BatchId, LocationId, Quantity) VALUES
(1, 1, 1, 1, 500.00), -- Lệnh nhặt 500 hộp từ Lô 1, Tầng 1
(1, 1, 2, 2, 200.00); -- Lệnh nhặt 200 hộp từ Lô 2, Tầng 2
GO