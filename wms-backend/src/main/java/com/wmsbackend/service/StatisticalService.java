package com.wmsbackend.service;

import com.wmsbackend.dto.DashboardDTO;
import com.wmsbackend.dto.InventoryStatsDTO;

import java.time.LocalDate;

public interface StatisticalService {

    /**
     * Tổng hợp dữ liệu cho trang Dashboard Overview
     */
    DashboardDTO getDashboard();

    /**
     * Tổng hợp dữ liệu tồn kho & phân tích ABC theo kỳ
     *
     * @param startDate ngày bắt đầu kỳ
     * @param endDate   ngày kết thúc kỳ
     */
    InventoryStatsDTO getInventoryStats(LocalDate startDate, LocalDate endDate);
}
