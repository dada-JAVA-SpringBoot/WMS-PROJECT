package com.wmsbackend.repository;

import com.wmsbackend.entity.InboundOrderDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface InboundOrderDetailRepository extends JpaRepository<InboundOrderDetail, Long> {
    List<InboundOrderDetail> findByInboundOrderId(Long inboundOrderId);
    List<InboundOrderDetail> findByInboundOrderIdIn(List<Long> inboundOrderIds);
}
