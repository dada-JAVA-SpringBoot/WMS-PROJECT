package com.wmsbackend.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

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

    // CONSTRUCTOR QUAN TRỌNG (Dùng cho JPQL)
    public ProductDTO(Integer id, String sku, String barcode, String name, String baseUnit,
                      Integer categoryId, String imageUrl, String status, String supplierCodes,
                      LocalDateTime createdAt, BigDecimal weight, BigDecimal length,
                      BigDecimal width, BigDecimal height, String storageTemp,
                      Integer safetyStock, Boolean isFragile, BigDecimal totalStock) {
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
    }

    // Getter

    public Integer getId() {
        return id;
    }

    public String getSku() {
        return sku;
    }

    public String getBarcode() {
        return barcode;
    }

    public String getName() {
        return name;
    }

    public String getBaseUnit() {
        return baseUnit;
    }

    public Integer getCategoryId() {
        return categoryId;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public String getStatus() {
        return status;
    }

    public String getSupplierCodes() {
        return supplierCodes;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public BigDecimal getWeight() {
        return weight;
    }

    public BigDecimal getLength() {
        return length;
    }

    public BigDecimal getWidth() {
        return width;
    }

    public BigDecimal getHeight() {
        return height;
    }

    public String getStorageTemp() {
        return storageTemp;
    }

    public Integer getSafetyStock() {
        return safetyStock;
    }

    public Boolean getFragile() {
        return isFragile;
    }

    public BigDecimal getTotalStock() {
        return totalStock;
    }
}