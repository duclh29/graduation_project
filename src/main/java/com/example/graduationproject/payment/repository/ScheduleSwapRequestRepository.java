package com.example.graduationproject.payment.repository;

import com.example.graduationproject.entity.ScheduleSwapRequest;
import com.example.graduationproject.entity.enums.ScheduleSwapRequestStatus;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface ScheduleSwapRequestRepository extends MongoRepository<ScheduleSwapRequest, String> {
    List<ScheduleSwapRequest> findByStatusOrderByCreatedAtDesc(ScheduleSwapRequestStatus status);

    List<ScheduleSwapRequest> findAllByOrderByCreatedAtDesc();

    void deleteByScheduleId(String scheduleId);
}
