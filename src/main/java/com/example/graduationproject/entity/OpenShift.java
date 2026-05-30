package com.example.graduationproject.entity;

import com.example.graduationproject.entity.enums.OpenShiftStatus;
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
@Document(collection = "open_shifts")
@ToString(callSuper = true)
@EqualsAndHashCode(callSuper = true, onlyExplicitlyIncluded = true)
public class OpenShift extends BaseEntity {

    @ToString.Exclude
    @DocumentReference(lazy = true)
    private Shift shift;

    private LocalDate workDate;

    private LocalDateTime plannedStartAt;

    private LocalDateTime plannedEndAt;

    @Builder.Default
    private OpenShiftStatus status = OpenShiftStatus.OPEN;

    @ToString.Exclude
    @DocumentReference(lazy = true)
    private User assignedUser;

    @ToString.Exclude
    @DocumentReference(lazy = true)
    private WorkSchedule schedule;

    private String note;

    private LocalDateTime assignedAt;
}
