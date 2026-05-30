package com.example.graduationproject.payment.repository;

import com.example.graduationproject.entity.Promotion;
import com.example.graduationproject.entity.enums.PromotionStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface PromotionRepositoryCustom {
    Page<Promotion> searchAdminPromotions(String keyword, PromotionStatus status, Pageable pageable);
}
