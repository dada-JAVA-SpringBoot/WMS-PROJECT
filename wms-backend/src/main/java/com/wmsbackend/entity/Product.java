package com.wmsbackend.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "Products")
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "Sku", length = 50, unique = true, nullable = false)
    private String sku;

    @Column(name = "Barcode", length = 100)
    private String barcode;

    @Column(name = "Name", length = 255, nullable = false)
    private String name;

    @Column(name = "BaseUnit", length = 50)
    private String baseUnit;

    @Column(name = "CategoryId")
    private Integer categoryId;

    @Column(name = "ImageUrl", columnDefinition = "NVARCHAR(MAX)")
    private String imageUrl;

    @Column(name = "Status", length = 20)
    private String status = "ACTIVE";

    // SỬ DỤNG @Formula ĐỂ TỰ ĐỘNG GỘP NHÀ CUNG CẤP (KHÔNG CẦN CỘT VẬT LÝ)
    @org.hibernate.annotations.Formula("(SELECT STRING_AGG(CAST(s.SupplierCode AS VARCHAR(MAX)), ', ') FROM ProductSuppliers ps JOIN Suppliers s ON ps.SupplierId = s.Id WHERE ps.ProductId = Id)")
    private String supplierCodes;

    // Logistics
    @Column(name = "Weight")
    private BigDecimal weight;

    @Column(name = "Length")
    private BigDecimal length;

    @Column(name = "Width")
    private BigDecimal width;

    @Column(name = "Height")
    private BigDecimal height;

    @Column(name = "StorageTemp", length = 50)
    private String storageTemp;

    @Column(name = "SafetyStock")
    private Integer safetyStock;

    @Column(name = "IsFragile")
    private Boolean isFragile = false;

    @Column(name = "CreatedAt", insertable = false, updatable = false)
    private LocalDateTime createdAt;

    // THÊM DANH SÁCH QUY ĐỔI ĐƠN VỊ (One-to-Many)
    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JoinColumn(name = "ProductId")
    private List<ProductUnitConversion> conversions = new ArrayList<>();

    // Getter Setter

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getSku() {
        return sku;
    }

    public void setSku(String sku) {
        this.sku = sku;
    }

    public String getBarcode() {
        return barcode;
    }

    public void setBarcode(String barcode) {
        this.barcode = barcode;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getBaseUnit() {
        return baseUnit;
    }

    public void setBaseUnit(String baseUnit) {
        this.baseUnit = baseUnit;
    }

    public Integer getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(Integer categoryId) {
        this.categoryId = categoryId;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getSupplierCodes() {
        return supplierCodes;
    }

    public BigDecimal getWeight() {
        return weight;
    }

    public void setWeight(BigDecimal weight) {
        this.weight = weight;
    }

    public BigDecimal getLength() {
        return length;
    }

    public void setLength(BigDecimal length) {
        this.length = length;
    }

    public BigDecimal getWidth() {
        return width;
    }

    public void setWidth(BigDecimal width) {
        this.width = width;
    }

    public BigDecimal getHeight() {
        return height;
    }

    public void setHeight(BigDecimal height) {
        this.height = height;
    }

    public String getStorageTemp() {
        return storageTemp;
    }

    public void setStorageTemp(String storageTemp) {
        this.storageTemp = storageTemp;
    }

    public Integer getSafetyStock() {
        return safetyStock;
    }

    public void setSafetyStock(Integer safetyStock) {
        this.safetyStock = safetyStock;
    }

    public Boolean getFragile() {
        return isFragile;
    }

    public void setFragile(Boolean fragile) {
        isFragile = fragile;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public List<ProductUnitConversion> getConversions() {
        return conversions;
    }

    public void setConversions(List<ProductUnitConversion> conversions) {
        this.conversions = conversions;
    }
}
