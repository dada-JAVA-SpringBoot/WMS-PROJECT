package com.wmsbackend.dto;

import lombok.Data;

@Data
public class MobileScannerRequest {
    private String sessionId;
    private String pairingCode;
    private String scannedData;
}
