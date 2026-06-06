#!/bin/bash

# 1. Bật SQL Server ngầm ở background
/opt/mssql/bin/sqlservr &

# 2. Chờ cho đến khi SQL Server thực sự sẵn sàng
echo "Đang chờ SQL Server khởi động..."
for i in {1..60};
do
    /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "$MSSQL_SA_PASSWORD" -Q "SELECT 1" -C -t 1 > /dev/null 2>&1
    if [ $? -eq 0 ]; then
        echo "SQL Server đã sẵn sàng!"
        break
    fi
    echo "Đang thử lại ($i/60)..."
    sleep 2
done

# 3. Chạy file setup.sql bằng công cụ sqlcmd
echo "Đang khởi tạo cấu trúc Bảng và Dữ liệu mẫu..."
/opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "$MSSQL_SA_PASSWORD" -d master -i setup.sql -C

if [ $? -eq 0 ]; then
    echo "Khởi tạo Database thành công!"
else
    echo "LỖI: Khởi tạo Database thất bại!"
fi

# 4. Giữ cho container tiếp tục sống
wait
