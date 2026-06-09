package com.wmsbackend.entity;

import jakarta.persistence.*;
import java.io.Serializable;

@Entity
@Table(name = "ProductSuppliers")
public class ProductSupplier {

    @EmbeddedId
    private ProductSupplierId id;

    @Column(name = "IsDefault")
    private Boolean isDefault = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("productId")
    @JoinColumn(name = "ProductId")
    private Product product;

    @ManyToOne(fetch = FetchType.EAGER)
    @MapsId("supplierId")
    @JoinColumn(name = "SupplierId")
    private Supplier supplier;

    public ProductSupplierId getId() {
        return id;
    }

    public void setId(ProductSupplierId id) {
        this.id = id;
    }

    public Boolean getIsDefault() {
        return isDefault;
    }

    public void setIsDefault(Boolean isDefault) {
        this.isDefault = isDefault;
    }

    public Product getProduct() {
        return product;
    }

    public void setProduct(Product product) {
        this.product = product;
    }

    public Supplier getSupplier() {
        return supplier;
    }

    public void setSupplier(Supplier supplier) {
        this.supplier = supplier;
    }

    @Embeddable
    public static class ProductSupplierId implements Serializable {
        private Integer productId;
        private Integer supplierId;

        public ProductSupplierId() {}
        public ProductSupplierId(Integer productId, Integer supplierId) {
            this.productId = productId;
            this.supplierId = supplierId;
        }

        public Integer getProductId() { return productId; }
        public void setProductId(Integer productId) { this.productId = productId; }
        public Integer getSupplierId() { return supplierId; }
        public void setSupplierId(Integer supplierId) { this.supplierId = supplierId; }

        @Override
        public boolean equals(Object o) {
            if (this == o) return true;
            if (!(o instanceof ProductSupplierId)) return false;
            ProductSupplierId that = (ProductSupplierId) o;
            return java.util.Objects.equals(productId, that.productId) &&
                   java.util.Objects.equals(supplierId, that.supplierId);
        }

        @Override
        public int hashCode() {
            return java.util.Objects.hash(productId, supplierId);
        }
    }
}
