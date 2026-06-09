package com.wmsbackend.service;

import com.wmsbackend.dto.InventoryTransferRequestDTO;

public interface InventoryService {
    void transferInventory(InventoryTransferRequestDTO request);
}
