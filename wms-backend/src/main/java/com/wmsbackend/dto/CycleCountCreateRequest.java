package com.wmsbackend.dto;

import lombok.Data;
import java.util.List;

@Data
public class CycleCountCreateRequest {
    private String zone;
    private List<Integer> productCategoryIds;
    private String note;
    private Integer assignedTo;
}
