package com.example.graduationproject.payment.repository;

import com.example.graduationproject.entity.Shift;
import com.example.graduationproject.entity.enums.ShiftStatus;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface ShiftRepository extends MongoRepository<Shift, String> {
    boolean existsByCodeIgnoreCase(String code);

    boolean existsByCodeIgnoreCaseAndIdNot(String code, String id);

    List<Shift> findByStatusOrderByStartTimeAsc(ShiftStatus status);
}
