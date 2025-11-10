package com.example.crop.controller;

import com.example.crop.entity.Crop;
import com.example.crop.entity.CropStatus;
import com.example.crop.repository.CropRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/crops/admin")
@RequiredArgsConstructor
public class AdminController {

    private final CropRepository repo;

    @GetMapping("/pending")
    public List<Crop> pending() {
        return repo.findAll().stream()
                .filter(c -> c.getStatus() == CropStatus.PENDING)
                .toList();
    }

    @PutMapping("/{id}/approve")
    public ResponseEntity<?> approve(@PathVariable Long id) {
        var crop = repo.findById(id).orElse(null);
        if (crop == null) return ResponseEntity.notFound().build();

        crop.setStatus(CropStatus.APPROVED);
        repo.save(crop);
        return ResponseEntity.ok(Map.of("message", "Approved", "id", id));
    }

    @PutMapping("/{id}/reject")
    public ResponseEntity<?> reject(@PathVariable Long id) {
        var crop = repo.findById(id).orElse(null);
        if (crop == null) return ResponseEntity.notFound().build();

        crop.setStatus(CropStatus.REJECTED);
        repo.save(crop);
        return ResponseEntity.ok(Map.of("message", "Rejected", "id", id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        if (!repo.existsById(id)) return ResponseEntity.notFound().build();

        repo.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Deleted", "id", id));
    }
}
