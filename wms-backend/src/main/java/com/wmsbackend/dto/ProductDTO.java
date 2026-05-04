package com.wmsbackend.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import com.wmsbackend.entity.ProductUnitConversion;

public class ProductDTO {
    private Integer id;
    private String sku;
    private String barcode;
    private String name;
    private String baseUnit;
    private Integer categoryId;
    private String imageUrl;
    private String status;
    private String supplierCodes;
    private LocalDateTime createdAt;
    private BigDecimal weight;
    private BigDecimal length;
    private BigDecimal width;
    private BigDecimal height;
    private String storageTemp;
    private Integer safetyStock;
    private Boolean isFragile;
    private BigDecimal totalStock; // Trường tính toán từ bảng Inventory
    private BigDecimal allocatedStock;
    private BigDecimal availableStock;
    private BigDecimal incomingStock;
    private LocalDate nearestBatchExpiryDate;
    
    // Thêm danh sách quy đổi đơn vị
    private List<ProductUnitConversion> conversions;

    // CONSTRUCTOR QUAN TRỌNG (Dùng cho JPQL)
    public ProductDTO(Integer id, String sku, String barcode, String name, String baseUnit,
                      Integer categoryId, String imageUrl, String status, String supplierCodes,
                      LocalDateTime createdAt, BigDecimal weight, BigDecimal length,
                      BigDecimal width, BigDecimal height, String storageTemp,
                      Integer safetyStock, Boolean isFragile, BigDecimal totalStock,
                      BigDecimal allocatedStock, BigDecimal availableStock, BigDecimal incomingStock,
                      LocalDate nearestBatchExpiryDate) {
        this.id = id;
        this.sku = sku;
        this.barcode = barcode;
        this.name = name;
        this.baseUnit = baseUnit;
        this.categoryId = categoryId;
        this.imageUrl = imageUrl;
        this.status = status;
        this.supplierCodes = supplierCodes;
        this.createdAt = createdAt;
        this.weight = weight;
        this.length = length;
        this.width = width;
        this.height = height;
        this.storageTemp = storageTemp;
        this.safetyStock = safetyStock;
        this.isFragile = isFragile;
        this.totalStock = totalStock;
        this.allocatedStock = allocatedStock;
        this.availableStock = availableStock;
        this.incomingStock = incomingStock;
        this.nearestBatchExpiryDate = nearestBatchExpiryDate;
    }

    // Getters and Setters

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public String getSku() { return sku; }
    public void setSku(String sku) { this.sku = sku; }

    public String getBarcode() { return barcode; }
    public void setBarcode(String barcode) { this.barcode = barcode; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getBaseUnit() { return baseUnit; }
    public void setBaseUnit(String baseUnit) { this.baseUnit = baseUnit; }

    public Integer getCategoryId() { return categoryId; }
    public void setCategoryId(Integer categoryId) { this.categoryId = categoryId; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getSupplierCodes() { return supplierCodes; }
    public void setSupplierCodes(String supplierCodes) { this.supplierCodes = supplierCodes; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public BigDecimal getWeight() { return weight; }
    public void setWeight(BigDecimal weight) { this.weight = weight; }

    public BigDecimal getLength() { return length; }
    public void setLength(BigDecimal length) { this.length = length; }

    public BigDecimal getWidth() { return width; }
    public void setWidth(BigDecimal width) { this.width = width; }

    public BigDecimal getHeight() { return height; }
    public void setHeight(BigDecimal height) { this.height = height; }

    public String getStorageTemp() { return storageTemp; }
    public void setStorageTemp(String storageTemp) { this.storageTemp = storageTemp; }

    public Integer getSafetyStock() { return safetyStock; }
    public void setSafetyStock(Integer safetyStock) { this.safetyStock = safetyStock; }

    public Boolean getFragile() { return isFragile; }
    public void setFragile(Boolean fragile) { isFragile = fragile; }

    public BigDecimal getTotalStock() { return totalStock; }
    public void setTotalStock(BigDecimal totalStock) { this.totalStock = totalStock; }

    public BigDecimal getAllocatedStock() { return allocatedStock; }
    public void setAllocatedStock(BigDecimal allocatedStock) { this.allocatedStock = allocatedStock; }

    public BigDecimal getAvailableStock() { return availableStock; }
    public void setAvailableStock(BigDecimal availableStock) { this.availableStock = availableStock; }

    public BigDecimal getIncomingStock() { return incomingStock; }
    public void setIncomingStock(BigDecimal incomingStock) { this.incomingStock = incomingStock; }

    public LocalDate getNearestBatchExpiryDate() { return nearestBatchExpiryDate; }
    public void setNearestBatchExpiryDate(LocalDate nearestBatchExpiryDate) { this.nearestBatchExpiryDate = nearestBatchExpiryDate; }

    public List<ProductUnitConversion> getConversions() { return conversions; }
    public void setConversions(List<ProductUnitConversion> conversions) { this.conversions = conversions; }
}
