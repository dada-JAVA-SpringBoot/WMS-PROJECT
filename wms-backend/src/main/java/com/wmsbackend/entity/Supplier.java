package com.wmsbackend.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "Suppliers")
public class Supplier {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "SupplierCode", unique = true, nullable = false, length = 50)
    private String supplierCode;

    @Column(name = "Name", nullable = false, length = 255)
    private String name;

    @Column(name = "Phone", length = 20)
    private String phone;

    @Column(name = "Address", length = 500)
    private String address;

    // Getter Setter

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getSupplierCode() {
        return supplierCode;
    }

    public void setSupplierCode(String supplierCode) {
        this.supplierCode = supplierCode;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }
}