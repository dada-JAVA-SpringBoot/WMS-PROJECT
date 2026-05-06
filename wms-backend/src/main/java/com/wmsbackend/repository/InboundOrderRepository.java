package com.wmsbackend.repository;

import com.wmsbackend.entity.InboundOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InboundOrderRepository extends JpaRepository<InboundOrder, Long> {
    List<InboundOrder> findByStatusIn(List<String> statuses);
    long countByStatus(String status);
}
