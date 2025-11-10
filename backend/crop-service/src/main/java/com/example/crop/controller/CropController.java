// crop-service/src/main/java/com/example/crop/controller/CropController.java
package com.example.crop.controller;

import com.example.crop.entity.Crop;
import com.example.crop.service.CropService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/crops")
@RequiredArgsConstructor
public class CropController {

    private final CropService cropService;

    // Add crop (matches Angular FormData)
    @PostMapping(value = "/add", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> addCrop(
            @ModelAttribute Crop crop,
            @RequestPart(required = false) MultipartFile image,
            @RequestHeader("Authorization") String authHeader) {
        return ResponseEntity.ok(cropService.addCropWithImage(crop, image, authHeader));
    }

    // "My crops"
    @GetMapping("/my")
    public ResponseEntity<?> getMyCrops(@RequestHeader("Authorization") String authHeader) {
        return ResponseEntity.ok(cropService.getCropsForUser(authHeader));
    }

    // Public browsing (Authorization optional)
    @GetMapping("/all")
    public ResponseEntity<?> getAll(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        return ResponseEntity.ok(cropService.getVisibleCrops(authHeader));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable Long id) {
        Crop crop = cropService.getById(id);
        return crop != null ? ResponseEntity.ok(crop) : ResponseEntity.notFound().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateCrop(@PathVariable Long id,
                                        @RequestBody Crop crop,
                                        @RequestHeader("Authorization") String authHeader) {
        crop.setId(id);
        return ResponseEntity.ok(
                Map.of("message", "Crop updated",
                       "data", cropService.updateCrop(crop, authHeader))
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCrop(@PathVariable Long id,
                                        @RequestHeader("Authorization") String authHeader) {
        cropService.deleteCrop(id, authHeader);
        return ResponseEntity.ok(Map.of("message", "Crop deleted successfully"));
    }

    // Pageable list (/crops?page=&size=&sort=createdAt,desc)
    @GetMapping
    public ResponseEntity<?> list(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            org.springframework.data.domain.Pageable pageable) {
        return ResponseEntity.ok(cropService.findVisible(pageable, authHeader));
    }

    // Pageable search (/crops/search?q=)
    @GetMapping("/search")
    public ResponseEntity<?> search(
            @RequestParam(name = "q", required = false) String q,
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            org.springframework.data.domain.Pageable pageable) {
        if (q == null || q.isBlank()) {
            return ResponseEntity.ok(cropService.findVisible(pageable, authHeader));
        }
        return ResponseEntity.ok(cropService.searchVisible(q.trim(), pageable, authHeader));
    }

    // ---------------------------
    // NEW: reduce quantity endpoint
    // ---------------------------
    /**
     * Reduce crop quantity by a given amount.
     * Example: POST /crops/11/reduce?qty=5.5
     *
     * This endpoint is intentionally simple so internal services (request-service) can call it.
     * It returns updated crop object in success case.
     */
    @PostMapping("/{id}/reduce")
    public ResponseEntity<?> reduceQuantity(@PathVariable Long id,
                                            @RequestParam("qty") double qty) {
        Crop updated = cropService.reduceQuantity(id, qty);
        return ResponseEntity.ok(Map.of("message", "Quantity reduced", "crop", updated));
    }
}
