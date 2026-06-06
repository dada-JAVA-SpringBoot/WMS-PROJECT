package com.wmsbackend.controller;

import com.wmsbackend.service.MockDataService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/auth/mock-data")
public class MockDataController {

    @Autowired
    private MockDataService mockDataService;

    @PostMapping("/generate")
    public ResponseEntity<Map<String, Object>> generateMockData() {
        try {
            Map<String, Object> report = mockDataService.generateMockData();
            return ResponseEntity.ok(report);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(Map.of(
                    "status", "Error generating mock data",
                    "error", e.getMessage()
            ));
        }
    }
}
