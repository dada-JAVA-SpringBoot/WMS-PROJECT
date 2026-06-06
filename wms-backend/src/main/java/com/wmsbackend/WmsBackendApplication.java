package com.wmsbackend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.boot.CommandLineRunner;
import jakarta.annotation.PostConstruct;
import java.util.TimeZone;
import java.util.Map;

@SpringBootApplication
public class WmsBackendApplication {

    @PostConstruct
    public void init() {
        // Thiết lập múi giờ mặc định cho toàn bộ ứng dụng là UTC+7 (Việt Nam)
        TimeZone.setDefault(TimeZone.getTimeZone("Asia/Ho_Chi_Minh"));
    }

    public static void main(String[] args) {
        SpringApplication.run(WmsBackendApplication.class, args);
    }

    @Bean
    public CommandLineRunner autoSeedRunner(
            com.wmsbackend.repository.ProductRepository productRepo,
            com.wmsbackend.service.MockDataService mockDataService) {
        return args -> {
            if (productRepo.count() == 0) {
                System.out.println(">>> DATABASE IS EMPTY! STARTING AUTOMATIC MOCK DATA SEEDING...");
                try {
                    Map<String, Object> result = mockDataService.generateMockData();
                    System.out.println(">>> AUTOMATIC SEEDING COMPLETED SUCCESSFULY: " + result);
                } catch (Exception e) {
                    System.err.println(">>> ERROR DURING AUTOMATIC SEEDING: " + e.getMessage());
                    e.printStackTrace();
                }
            } else {
                System.out.println(">>> DATABASE ALREADY CONTAINS DATA. SKIPPING AUTO-SEED.");
            }
        };
    }
}
