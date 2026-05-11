package com.wmsbackend.dto;

import java.math.BigDecimal;

public class FinancialSummaryDTO {

    private BigDecimal totalCost;
    private BigDecimal totalRevenue;
    private BigDecimal totalLoss; // Thất thoát/Hao hụt
    private BigDecimal profit;

    public FinancialSummaryDTO() {}

    public FinancialSummaryDTO(BigDecimal totalCost, BigDecimal totalRevenue, BigDecimal totalLoss) {
        this.totalCost    = totalCost;
        this.totalRevenue = totalRevenue;
        this.totalLoss    = totalLoss;
        // Lợi nhuận thực tế = Doanh thu - Chi phí nhập - Thất thoát
        this.profit       = totalRevenue.subtract(totalCost).subtract(totalLoss);
    }

    public BigDecimal getTotalCost()    { return totalCost; }
    public BigDecimal getTotalRevenue() { return totalRevenue; }
    public BigDecimal getTotalLoss()    { return totalLoss; }
    public BigDecimal getProfit()       { return profit; }

    public void setTotalCost(BigDecimal totalCost)       { this.totalCost = totalCost; }
    public void setTotalRevenue(BigDecimal totalRevenue) { this.totalRevenue = totalRevenue; }
    public void setTotalLoss(BigDecimal totalLoss)       { this.totalLoss = totalLoss; }
    public void setProfit(BigDecimal profit)             { this.profit = profit; }
}