# Use official Microsoft SQL Server 2022 image
FROM mcr.microsoft.com/mssql/server:2022-latest

# Switch to root for file operations
USER root

# Copy initialization scripts
COPY setup.sql setup.sql
COPY entrypoint.sh entrypoint.sh

# Clean Windows CRLF line endings and set executable permission
RUN sed -i -e 's/\r$//' entrypoint.sh && \
    sed -i -e 's/\r$//' setup.sql && \
    chmod +x entrypoint.sh

# Run as the mssql user (default user in base image)
USER mssql

# Set entrypoint script
CMD ["/bin/bash", "./entrypoint.sh"]