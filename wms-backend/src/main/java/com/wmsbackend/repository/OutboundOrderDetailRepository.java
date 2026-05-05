package com.wmsbackend.repository;

import com.wmsbackend.entity.OutboundOrderDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface OutboundOrderDetailRepository extends JpaRepository<OutboundOrderDetail, Long> {
    List<OutboundOrderDetail> findByOutboundOrderId(Long outboundOrderId);
}
