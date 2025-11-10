package com.cropdeal.payment.repository;

import com.cropdeal.payment.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface PaymentRepository extends JpaRepository<Payment, Long> {

    List<Payment> findByPaymentDateBetween(LocalDateTime from, LocalDateTime to);

    // Optional helpers if you need dashboards later:
    List<Payment> findByDealerId(Long dealerId);
    List<Payment> findByFarmerId(Long farmerId);
    
}
