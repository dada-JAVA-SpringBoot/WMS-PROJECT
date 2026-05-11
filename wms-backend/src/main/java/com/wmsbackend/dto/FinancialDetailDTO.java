package com.wmsbackend.dto;

import java.math.BigDecimal;
import java.util.List;

public class FinancialDetailDTO {

    private List<String>     labels;
    private List<BigDecimal> costData;
    private List<BigDecimal> revenueData;
    private List<BigDecimal> lossData;   // Dữ liệu thất thoát
    private List<BigDecimal> profitData;

    public FinancialDetailDTO() {}

    public FinancialDetailDTO(List<String> labels,
                              List<BigDecimal> costData,
                              List<BigDecimal> revenueData,
                              List<BigDecimal> lossData,
                              List<BigDecimal> profitData) {
        this.labels      = labels;
        this.costData    = costData;
        this.revenueData = revenueData;
        this.lossData    = lossData;
        this.profitData  = profitData;
    }

    public List<String>     getLabels()      { return labels; }
    public List<BigDecimal> getCostData()    { return costData; }
    public List<BigDecimal> getRevenueData() { return revenueData; }
    public List<BigDecimal> getLossData()    { return lossData; }
    public List<BigDecimal> getProfitData()  { return profitData; }

    public void setLabels(List<String> labels)           { this.labels = labels; }
    public void setCostData(List<BigDecimal> costData)   { this.costData = costData; }
    public void setRevenueData(List<BigDecimal> rev)     { this.revenueData = rev; }
    public void setLossData(List<BigDecimal> loss)       { this.lossData = loss; }
    public void setProfitData(List<BigDecimal> profit)   { this.profitData = profit; }
}