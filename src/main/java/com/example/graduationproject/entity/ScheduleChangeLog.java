package com.example.graduationproject.entity;

import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.DocumentReference;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import lombok.experimental.SuperBuilder;

@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "schedule_change_logs")
@ToString(callSuper = true)
@EqualsAndHashCode(callSuper = true, onlyExplicitlyIncluded = true)
public class ScheduleChangeLog extends BaseEntity {

    @ToString.Exclude
    @DocumentReference(lazy = true)
    private WorkSchedule schedule;

    @ToString.Exclude
    @DocumentReference(lazy = true)
    private OpenShift openShift;

    private String action;

    private String actor;

    private String oldValueJson;

    private String newValueJson;
}
