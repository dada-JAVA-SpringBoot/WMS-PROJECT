package com.wmsbackend.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "Products")
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "Sku", unique = true, nullable = false)
    private String sku;

    @Column(name = "Barcode")
    private String barcode;

    @Column(name = "Name", nullable = false)
    private String name;

    @Column(name = "BaseUnit", nullable = false)
    private String baseUnit;

    @Column(name = "CategoryId")
    private Integer categoryId;

    // --- CÁC HÀM GETTER VÀ SETTER ---

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

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
}