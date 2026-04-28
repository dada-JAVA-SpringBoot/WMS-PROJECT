package com.wmsbackend.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "Warehouses")
public class Warehouse {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "WarehouseCode", unique = true, nullable = false, length = 50)
    private String warehouseCode;

    @Column(name = "Name", nullable = false, length = 255)
    private String name;

    @Column(name = "Address", length = 500)
    private String address;

    // Getter Setter

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getWarehouseCode() {
        return warehouseCode;
    }

    public void setWarehouseCode(String warehouseCode) {
        this.warehouseCode = warehouseCode;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }
}