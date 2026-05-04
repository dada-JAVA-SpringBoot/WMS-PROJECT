package com.wmsbackend.service.impl;

import com.wmsbackend.dto.InventoryTransferRequestDTO;
import com.wmsbackend.entity.Inventory;
import com.wmsbackend.entity.InventoryTransaction;
import com.wmsbackend.entity.Product;
import com.wmsbackend.entity.Location;
import com.wmsbackend.repository.InventoryRepository;
import com.wmsbackend.repository.InventoryTransactionRepository;
import com.wmsbackend.repository.ProductRepository;
import com.wmsbackend.repository.LocationRepository;
import com.wmsbackend.service.InventoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
public class InventoryServiceImpl implements InventoryService {

    @Autowired
    private InventoryRepository inventoryRepository;

    @Autowired
    private InventoryTransactionRepository transactionRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private LocationRepository locationRepository;

    @Autowired
    private com.wmsbackend.repository.ProductUnitConversionRepository conversionRepository;

    @Override
    @Transactional
    public void transferInventory(InventoryTransferRequestDTO request) {
        // 1. Kiểm tra tồn kho tại vị trí nguồn
        Inventory sourceInventory = inventoryRepository.findByProductIdAndLocationIdAndBatchId(
                request.getProductId(), request.getFromLocationId(), request.getBatchId());

        if (sourceInventory == null || sourceInventory.getQuantityOnHand().compareTo(request.getQuantity()) < 0) {
            throw new RuntimeException("Số lượng tồn kho tại vị trí nguồn không đủ hoặc không tồn tại.");
        }

        // 2. Kiểm tra ràng buộc đơn vị tính (Chuẩn WMS Slotting)
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new RuntimeException("Sản phẩm không tồn tại."));
        Location destLocation = locationRepository.findById(request.getToLocationId())
                .orElseThrow(() -> new RuntimeException("Vị trí đích không tồn tại."));

        // Lấy loại đơn vị mà vị trí này yêu cầu (ví dụ: PALLET, KHAY, THUNG)
        String requiredContainerType = normalizeUnit(destLocation.getContainerType());
        
        // Kiểm tra xem sản phẩm có cấu hình đóng gói nào khớp với yêu cầu của vị trí không
        String baseUnitNormalized = normalizeUnit(product.getBaseUnit());
        boolean canFit = baseUnitNormalized.equals(requiredContainerType);

        if (!canFit) {
            // Tìm trong danh sách quy đổi xem có đơn vị nào khớp không
            java.util.List<com.wmsbackend.entity.ProductUnitConversion> conversions = conversionRepository.findByProductId(request.getProductId());
            canFit = conversions.stream().anyMatch(c -> normalizeUnit(c.getUnitName()).equals(requiredContainerType));
        }

        if (!canFit) {
            throw new RuntimeException("Vị trí không phù hợp: Vị trí [" + destLocation.getBinCode() + "] chỉ chứa loại [" + 
                                     destLocation.getContainerType() + "], sản phẩm này không có quy cách đóng gói tương ứng.");
        }

        // 3. Cập nhật giảm tồn kho tại vị trí nguồn
        sourceInventory.setQuantityOnHand(sourceInventory.getQuantityOnHand().subtract(request.getQuantity()));
        inventoryRepository.save(sourceInventory);

        // 4. Cập nhật tăng tồn kho tại vị trí đích
        Inventory destInventory = inventoryRepository.findByProductIdAndLocationIdAndBatchId(
                request.getProductId(), request.getToLocationId(), request.getBatchId());

        if (destInventory == null) {
            destInventory = new Inventory();
            destInventory.setProductId(request.getProductId());
            destInventory.setLocationId(request.getToLocationId());
            destInventory.setBatchId(request.getBatchId());
            destInventory.setQuantityOnHand(request.getQuantity());
            destInventory.setQuantityAllocated(BigDecimal.ZERO);
        } else {
            destInventory.setQuantityOnHand(destInventory.getQuantityOnHand().add(request.getQuantity()));
        }
        inventoryRepository.save(destInventory);

        // 5. Lưu lịch sử giao dịch
        InventoryTransaction outTransaction = new InventoryTransaction();
        outTransaction.setProductId(request.getProductId());
        outTransaction.setLocationId(request.getFromLocationId());
        outTransaction.setBatchId(request.getBatchId());
        outTransaction.setTransactionType("TRANSFER_OUT");
        outTransaction.setQuantityChange(request.getQuantity().negate());
        outTransaction.setCreatedBy(request.getUserId());
        transactionRepository.save(outTransaction);

        InventoryTransaction inTransaction = new InventoryTransaction();
        inTransaction.setProductId(request.getProductId());
        inTransaction.setLocationId(request.getToLocationId());
        inTransaction.setBatchId(request.getBatchId());
        inTransaction.setTransactionType("TRANSFER_IN");
        inTransaction.setQuantityChange(request.getQuantity());
        inTransaction.setCreatedBy(request.getUserId());
        transactionRepository.save(inTransaction);
    }

    private String normalizeUnit(String unit) {
        if (unit == null) return "";
        
        // 1. Chuyển sang chữ hoa và xóa khoảng trắng
        String normalized = unit.toUpperCase().trim();
        
        // 2. Xóa tiền tố UNIT- nếu có
        if (normalized.startsWith("UNIT-")) {
            normalized = normalized.substring(5);
        }
        
        // 3. Loại bỏ dấu tiếng Việt tự động
        return removeAccents(normalized);
    }

    private String removeAccents(String text) {
        if (text == null) return "";
        String nfdNormalizedString = java.text.Normalizer.normalize(text, java.text.Normalizer.Form.NFD);
        java.util.regex.Pattern pattern = java.util.regex.Pattern.compile("\\p{InCombiningDiacriticalMarks}+");
        return pattern.matcher(nfdNormalizedString).replaceAll("").replace('Đ', 'D').replace('đ', 'd');
    }
}
