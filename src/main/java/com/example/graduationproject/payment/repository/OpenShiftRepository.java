package com.example.graduationproject.payment.repository;

import com.example.graduationproject.entity.OpenShift;
import com.example.graduationproject.entity.enums.OpenShiftStatus;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface OpenShiftRepository extends MongoRepository<OpenShift, String> {
    List<OpenShift> findByWorkDateBetweenOrderByWorkDateAsc(LocalDate startDate, LocalDate endDate);

    List<OpenShift> findByWorkDateBetweenAndStatusOrderByWorkDateAsc(LocalDate startDate,
                                                                     LocalDate endDate,
                                                                     OpenShiftStatus status);

    Optional<OpenShift> findByScheduleId(String scheduleId);
}
