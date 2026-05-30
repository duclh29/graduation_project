package com.example.graduationproject.payment.repository;

import com.example.graduationproject.entity.AttendanceRecord;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface AttendanceRecordRepository extends MongoRepository<AttendanceRecord, String> {
    Optional<AttendanceRecord> findByScheduleId(String scheduleId);

    void deleteByScheduleId(String scheduleId);
}
