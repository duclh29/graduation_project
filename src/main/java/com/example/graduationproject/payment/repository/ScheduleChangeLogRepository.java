package com.example.graduationproject.payment.repository;

import com.example.graduationproject.entity.ScheduleChangeLog;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface ScheduleChangeLogRepository extends MongoRepository<ScheduleChangeLog, String> {
    List<ScheduleChangeLog> findByScheduleId(String scheduleId);
}
