// ===== Supplier.java (Entity) =====
package com.wmsbackend.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "Suppliers")
public class Supplier {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "SupplierCode", unique = true, nullable = false)
    private String supplierCode;

    @Column(name = "Name", nullable = false)
    private String name;

    @Column(name = "Phone")
    private String phone;

    @Column(name = "Address")
    private String address;

    @Column(name = "TotalImportQuantity")
    private Integer totalImportQuantity = 0;

    @Column(name = "CompanyId")
    private Integer companyId;

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

    public Integer getCompanyId() { return companyId; }
    public void setCompanyId(Integer companyId) { this.companyId = companyId; }
}
 
