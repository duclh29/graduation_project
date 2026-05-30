package com.example.graduationproject.admin.schedule;

import com.example.graduationproject.entity.OpenShift;
import com.example.graduationproject.entity.ScheduleChangeLog;
import com.example.graduationproject.entity.WorkSchedule;
import com.example.graduationproject.payment.repository.ScheduleChangeLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ScheduleAuditService {

    private final ScheduleChangeLogRepository scheduleChangeLogRepository;

    public void record(WorkSchedule schedule, String action, String oldValueJson, String newValueJson) {
        scheduleChangeLogRepository.save(ScheduleChangeLog.builder()
                .schedule(schedule)
                .action(action)
                .actor(currentActor())
                .oldValueJson(oldValueJson)
                .newValueJson(newValueJson)
                .build());
    }

    public void record(OpenShift openShift, String action, String oldValueJson, String newValueJson) {
        scheduleChangeLogRepository.save(ScheduleChangeLog.builder()
                .openShift(openShift)
                .action(action)
                .actor(currentActor())
                .oldValueJson(oldValueJson)
                .newValueJson(newValueJson)
                .build());
    }

    public void recordDetached(String action, String oldValueJson, String newValueJson) {
        scheduleChangeLogRepository.save(ScheduleChangeLog.builder()
                .action(action)
                .actor(currentActor())
                .oldValueJson(oldValueJson)
                .newValueJson(newValueJson)
                .build());
    }

    private String currentActor() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getName() == null) {
            return "SYSTEM";
        }
        return authentication.getName();
    }
}
