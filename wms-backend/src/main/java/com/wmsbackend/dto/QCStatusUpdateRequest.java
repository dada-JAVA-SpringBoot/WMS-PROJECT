package com.wmsbackend.dto;

import com.wmsbackend.entity.InboundOrderDetail;
import java.util.List;

public class QCStatusUpdateRequest {
    private String status;
    private List<InboundOrderDetail> details;

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public List<InboundOrderDetail> getDetails() { return details; }
    public void setDetails(List<InboundOrderDetail> details) { this.details = details; }
}
