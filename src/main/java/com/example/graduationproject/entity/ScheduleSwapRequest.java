package com.example.graduationproject.entity;

import com.example.graduationproject.entity.enums.ScheduleSwapRequestStatus;
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
@Document(collection = "schedule_swap_requests")
@ToString(callSuper = true)
@EqualsAndHashCode(callSuper = true, onlyExplicitlyIncluded = true)
public class ScheduleSwapRequest extends BaseEntity {

    @ToString.Exclude
    @DocumentReference(lazy = true)
    private WorkSchedule schedule;

    @ToString.Exclude
    @DocumentReference(lazy = true)
    private User fromUser;

    @ToString.Exclude
    @DocumentReference(lazy = true)
    private User targetUser;

    @Builder.Default
    private ScheduleSwapRequestStatus status = ScheduleSwapRequestStatus.PENDING;

    private String note;

    private String reviewNote;

    private LocalDateTime reviewedAt;
}
