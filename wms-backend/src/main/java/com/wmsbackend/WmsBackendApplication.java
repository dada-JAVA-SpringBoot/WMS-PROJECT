package com.wmsbackend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.boot.CommandLineRunner;
import org.springframework.data.web.config.EnableSpringDataWebSupport;
import jakarta.annotation.PostConstruct;
import javax.sql.DataSource;
import java.util.TimeZone;
import java.util.Map;
import java.sql.DatabaseMetaData;
import java.sql.Connection;

@SpringBootApplication
@EnableSpringDataWebSupport(pageSerializationMode = EnableSpringDataWebSupport.PageSerializationMode.VIA_DTO)
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
            DataSource dataSource,
            com.wmsbackend.repository.InboundOrderRepository inboundOrderRepo,
            com.wmsbackend.service.MockDataService mockDataService) {
        return args -> {
            try {
                if (!tableExists(dataSource, "InboundOrders")) {
                    System.out.println(">>> DATABASE SCHEMA IS NOT READY. SKIPPING AUTO-SEED UNTIL TABLES ARE CREATED.");
                    return;
                }

                if (inboundOrderRepo.count() == 0) {
                    System.out.println(">>> TRANSACTION DATA IS EMPTY! STARTING AUTOMATIC MOCK DATA SEEDING...");
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
            } catch (Exception e) {
                System.err.println(">>> ERROR CHECKING DATABASE STATUS: " + e.getMessage());
                e.printStackTrace();
            }
        };
    }

    private boolean tableExists(DataSource dataSource, String tableName) throws Exception {
        try (Connection connection = dataSource.getConnection()) {
            DatabaseMetaData metaData = connection.getMetaData();
            try (var rs = metaData.getTables(connection.getCatalog(), null, tableName, new String[] { "TABLE" })) {
                return rs.next();
            }
        }
    }
}
