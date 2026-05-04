package com.wmsbackend.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "Locations")
public class Location {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "WarehouseId", nullable = false)
    private Integer warehouseId;

    @Column(name = "Zone", length = 50)
    private String zone;

    @Column(name = "Aisle", length = 50)
    private String aisle;

    @Column(name = "Rack", length = 50)
    private String rack;

    @Column(name = "Level", length = 50)
    private String level;

    @Column(name = "BinCode", unique = true, nullable = false, length = 50)
    private String binCode;

    @Column(name = "Capacity")
    private Integer capacity;

    @Column(name = "StorageType", length = 20)
    private String storageType;

    @Column(name = "ContainerType", length = 20)
    private String containerType;

    // Getter Setter

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public Integer getWarehouseId() {
        return warehouseId;
    }

    public void setWarehouseId(Integer warehouseId) {
        this.warehouseId = warehouseId;
    }

    public String getZone() {
        return zone;
    }

    public void setZone(String zone) {
        this.zone = zone;
    }

    public String getAisle() {
        return aisle;
    }

    public void setAisle(String aisle) {
        this.aisle = aisle;
    }

    public String getRack() {
        return rack;
    }

    public void setRack(String rack) {
        this.rack = rack;
    }

    public String getLevel() {
        return level;
    }

    public void setLevel(String level) {
        this.level = level;
    }

    public String getBinCode() {
        return binCode;
    }

    public void setBinCode(String binCode) {
        this.binCode = binCode;
    }

    public Integer getCapacity() {
        return capacity;
    }

    public void setCapacity(Integer capacity) {
        this.capacity = capacity;
    }

    public String getStorageType() {
        return storageType;
    }

    public void setStorageType(String storageType) {
        this.storageType = storageType;
    }

    public String getContainerType() { return containerType; }

    public void setContainerType(String containerType) { this.containerType = containerType; }
}
