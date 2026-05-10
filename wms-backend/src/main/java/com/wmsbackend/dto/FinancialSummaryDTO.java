package com.wmsbackend.dto;

import java.math.BigDecimal;

public class FinancialSummaryDTO {

    private BigDecimal totalCost;
    private BigDecimal totalRevenue;
    private BigDecimal profit;

    public FinancialSummaryDTO() {}

    public FinancialSummaryDTO(BigDecimal totalCost, BigDecimal totalRevenue) {
        this.totalCost    = totalCost;
        this.totalRevenue = totalRevenue;
        this.profit       = totalRevenue.subtract(totalCost);
    }

    public BigDecimal getTotalCost()    { return totalCost; }
    public BigDecimal getTotalRevenue() { return totalRevenue; }
    public BigDecimal getProfit()       { return profit; }

    public void setTotalCost(BigDecimal totalCost)       { this.totalCost = totalCost; }
    public void setTotalRevenue(BigDecimal totalRevenue) { this.totalRevenue = totalRevenue; }
    public void setProfit(BigDecimal profit)             { this.profit = profit; }
}