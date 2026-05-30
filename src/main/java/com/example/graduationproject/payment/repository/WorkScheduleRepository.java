package com.example.graduationproject.payment.repository;

import com.example.graduationproject.entity.WorkSchedule;
import com.example.graduationproject.entity.enums.SchedulePublishStatus;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import java.time.LocalDate;
import java.util.List;

public interface WorkScheduleRepository extends MongoRepository<WorkSchedule, String> {

    @Query("{ 'workDate': { $gte: ?0, $lte: ?1 } }")
    List<WorkSchedule> findSchedulesBetweenDates(LocalDate startDate, LocalDate endDate);

    boolean existsByUserIdAndShiftIdAndWorkDate(String userId, String shiftId, LocalDate workDate);
    
    List<WorkSchedule> findByUserIdAndWorkDateBetweenOrderByWorkDateAsc(String userId, LocalDate startDate, LocalDate endDate);

    long countByShiftIdAndWorkDate(String shiftId, LocalDate workDate);

    boolean existsByShiftId(String shiftId);

    List<WorkSchedule> findByWorkDateBetweenAndPublishStatusOrderByWorkDateAsc(LocalDate startDate,
                                                                                LocalDate endDate,
                                                                                SchedulePublishStatus publishStatus);
}
