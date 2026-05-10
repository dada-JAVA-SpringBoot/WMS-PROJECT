# Stage 1: Build với Maven và Java 21 (Eclipse Temurin)
FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app

# Copy file pom.xml để cache dependencies
COPY pom.xml .
RUN mvn dependency:go-offline

# Copy toàn bộ code bên trong thư mục backend và build
COPY . .
RUN mvn clean package -DskipTests

# Stage 2: Chạy với JRE 21 cho nhẹ và bảo mật
FROM eclipse-temurin:21-jre-jammy
WORKDIR /app
# Đảm bảo lấy đúng file jar từ thư mục target
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080

# Sử dụng định dạng JSON cho ENTRYPOINT
ENTRYPOINT ["java", "-jar", "app.jar"]
