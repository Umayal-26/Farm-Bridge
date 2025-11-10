package com.cropdeal.notification.repository;

import com.cropdeal.notification.domain.DealerSubscription;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DealerSubscriptionRepository extends JpaRepository<DealerSubscription, Long> {
    List<DealerSubscription> findByCropNameIgnoreCase(String cropName);
    List<DealerSubscription> findByDealerId(Long dealerId);
    boolean existsByDealerIdAndCropNameIgnoreCase(Long dealerId, String cropName);
}
