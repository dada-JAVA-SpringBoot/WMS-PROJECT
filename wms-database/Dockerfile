# Sử dụng image MS SQL Server 2022 chính chủ
FROM mcr.microsoft.com/mssql/server:2022-latest

# Chuyển sang quyền root để copy file và cấp quyền
USER root

# Copy 2 file script vào bên trong container
COPY setup.sql setup.sql
COPY entrypoint.sh entrypoint.sh

# Cấp quyền thực thi cho file entrypoint.sh
RUN chmod +x entrypoint.sh

# Khi bật container, chạy file entrypoint này đầu tiên
CMD /bin/bash ./entrypoint.sh