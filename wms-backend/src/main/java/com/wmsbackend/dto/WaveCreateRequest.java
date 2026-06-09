package com.wmsbackend.dto;

import lombok.Data;
import java.util.List;

@Data
public class WaveCreateRequest {
    private List<Long> orderIds;
    private String note;
}
