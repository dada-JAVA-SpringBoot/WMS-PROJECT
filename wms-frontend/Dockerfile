# Stage 1: Build với Node.js 20 (Yêu cầu của Vite 8)
FROM node:20-alpine AS build
WORKDIR /app

# Tách riêng phần cài đặt thư viện để tối ưu cache Docker
COPY package*.json ./
RUN npm install

# Copy code và biên dịch
COPY . .
RUN npm run build

# Stage 2: Chạy với Nginx
FROM nginx:stable-alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
