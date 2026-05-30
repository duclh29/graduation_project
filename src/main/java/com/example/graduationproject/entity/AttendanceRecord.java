package com.example.graduationproject.entity;

import com.example.graduationproject.entity.enums.AttendanceSource;
import com.example.graduationproject.entity.enums.AttendanceStatus;
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

import java.time.LocalDateTime;

@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "attendance_records")
@ToString(callSuper = true)
@EqualsAndHashCode(callSuper = true, onlyExplicitlyIncluded = true)
public class AttendanceRecord extends BaseEntity {

    @ToString.Exclude
    @DocumentReference(lazy = true)
    private WorkSchedule schedule;

    private LocalDateTime checkInAt;

    private LocalDateTime checkOutAt;

    @Builder.Default
    private Integer actualWorkMinutes = 0;

    @Builder.Default
    private Integer lateMinutes = 0;

    @Builder.Default
    private Integer earlyLeaveMinutes = 0;

    @Builder.Default
    private Integer overtimeMinutes = 0;

    @Builder.Default
    private AttendanceStatus status = AttendanceStatus.SCHEDULED;

    @Builder.Default
    private AttendanceSource source = AttendanceSource.ADMIN;

    private String note;

    private LocalDateTime approvedAt;
}
