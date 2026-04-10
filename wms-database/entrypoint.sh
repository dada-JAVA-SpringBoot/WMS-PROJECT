#!/bin/bash

# 1. Bật SQL Server ngầm ở background
/opt/mssql/bin/sqlservr &

# 2. Đợi 15 giây để SQL Server khởi động hoàn tất
echo "Đang chờ SQL Server khởi động..."
sleep 15s

# 3. Chạy file setup.sql bằng công cụ sqlcmd
echo "Đang khởi tạo cấu trúc Bảng và Dữ liệu mẫu..."
/opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "$MSSQL_SA_PASSWORD" -d master -i setup.sql -C

echo "Khởi tạo Database thành công!"

# 4. Giữ cho container tiếp tục sống
wait