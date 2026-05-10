package com.wmsbackend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DailyFlowDTO {
    private String date;       // "2024-05-01"
    private String label;      // "Thứ 2", "Thứ 3", ...
    private double inbound;    // Tổng SL nhập trong ngày
    private double outbound;   // Tổng SL xuất trong ngày
}
