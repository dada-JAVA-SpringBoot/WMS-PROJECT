package com.wmsbackend.dto;

import java.math.BigDecimal;

public class FinancialSummaryDTO {

    private BigDecimal totalCost;
    private BigDecimal totalRevenue;
    private BigDecimal totalLoss; // Thất thoát/Hao hụt
    private BigDecimal profit;
    private BigDecimal totalCogs;
    private BigDecimal actualProfit;

    public FinancialSummaryDTO() {}

    public FinancialSummaryDTO(BigDecimal totalCost, BigDecimal totalRevenue, BigDecimal totalLoss) {
        this.totalCost    = totalCost;
        this.totalRevenue = totalRevenue;
        this.totalLoss    = totalLoss;
        this.totalCogs    = totalCost; // fallback
        this.profit       = totalRevenue.subtract(totalCost).subtract(totalLoss);
        this.actualProfit = this.profit; // fallback
    }

    public FinancialSummaryDTO(BigDecimal totalCost, BigDecimal totalRevenue, BigDecimal totalLoss, BigDecimal totalCogs) {
        this.totalCost    = totalCost;
        this.totalRevenue = totalRevenue;
        this.totalLoss    = totalLoss;
        this.totalCogs    = totalCogs;
        this.profit       = totalRevenue.subtract(totalCost).subtract(totalLoss);
        this.actualProfit = totalRevenue.subtract(totalCogs).subtract(totalLoss);
    }

    public BigDecimal getTotalCost()    { return totalCost; }
    public BigDecimal getTotalRevenue() { return totalRevenue; }
    public BigDecimal getTotalLoss()    { return totalLoss; }
    public BigDecimal getProfit()       { return profit; }
    public BigDecimal getTotalCogs()    { return totalCogs; }
    public BigDecimal getActualProfit() { return actualProfit; }

    public void setTotalCost(BigDecimal totalCost)       { this.totalCost = totalCost; }
    public void setTotalRevenue(BigDecimal totalRevenue) { this.totalRevenue = totalRevenue; }
    public void setTotalLoss(BigDecimal totalLoss)       { this.totalLoss = totalLoss; }
    public void setProfit(BigDecimal profit)             { this.profit = profit; }
    public void setTotalCogs(BigDecimal totalCogs)       { this.totalCogs = totalCogs; }
    public void setActualProfit(BigDecimal actualProfit) { this.actualProfit = actualProfit; }
}