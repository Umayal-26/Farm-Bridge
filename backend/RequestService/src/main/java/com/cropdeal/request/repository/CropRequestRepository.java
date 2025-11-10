package com.cropdeal.request.repository;

import com.cropdeal.request.entity.CropRequest;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CropRequestRepository extends JpaRepository<CropRequest, Long> {
    List<CropRequest> findByFarmerId(Long farmerId);
    List<CropRequest> findByDealerId(Long dealerId);
}
