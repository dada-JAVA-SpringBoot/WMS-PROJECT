package com.wmsbackend.dto;

public class SupplierDTO {
    private Integer id;
    private String supplierCode;
    private String name;
    private String phone;
    private String address;
    private Integer totalImportQuantity;

    public SupplierDTO() {}

    public SupplierDTO(Integer id, String supplierCode, String name, String phone, String address, Integer totalImportQuantity) {
        this.id = id;
        this.supplierCode = supplierCode;
        this.name = name;
        this.phone = phone;
        this.address = address;
        this.totalImportQuantity = totalImportQuantity;
    }

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public String getSupplierCode() { return supplierCode; }
    public void setSupplierCode(String supplierCode) { this.supplierCode = supplierCode; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public Integer getTotalImportQuantity() { return totalImportQuantity; }
    public void setTotalImportQuantity(Integer totalImportQuantity) { this.totalImportQuantity = totalImportQuantity; }
}