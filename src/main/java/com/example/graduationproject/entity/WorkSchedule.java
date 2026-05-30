package com.example.graduationproject.entity;

import com.example.graduationproject.entity.enums.AttendanceStatus;
import com.example.graduationproject.entity.enums.SchedulePublishStatus;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.DocumentReference;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import lombok.experimental.SuperBuilder;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "work_schedules")
@CompoundIndex(name = "ws_user_shift_date_idx", def = "{'user': 1, 'shift': 1, 'workDate': 1}", unique = true)
@ToString(callSuper = true)
@EqualsAndHashCode(callSuper = true, onlyExplicitlyIncluded = true)
public class WorkSchedule extends BaseEntity {

    @ToString.Exclude
    @DocumentReference(lazy = true)
    private User user;

    @ToString.Exclude
    @DocumentReference(lazy = true)
    private Shift shift;

    private LocalDate workDate;

    private LocalDateTime plannedStartAt;

    private LocalDateTime plannedEndAt;

    @Builder.Default
    private AttendanceStatus status = AttendanceStatus.SCHEDULED;

    @Builder.Default
    private SchedulePublishStatus publishStatus = SchedulePublishStatus.DRAFT;

    private String note;

    private LocalDateTime publishedAt;

    private LocalDateTime lockedAt;
}
