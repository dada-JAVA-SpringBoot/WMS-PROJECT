package com.wmsbackend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Paths;

@Configuration
public class MvcConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Lấy đường dẫn tuyệt đối đến thư mục uploads ở gốc project
        String uploadPath = Paths.get("uploads").toAbsolutePath().toUri().toString();
        
        // Cấu hình: Mọi URL bắt đầu bằng /uploads/ sẽ được trỏ tới thư mục uploads vật lý
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations(uploadPath);
    }
}
