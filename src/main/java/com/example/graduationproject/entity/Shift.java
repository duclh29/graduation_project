package com.example.graduationproject.entity;

import com.example.graduationproject.entity.enums.ShiftStatus;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import lombok.experimental.SuperBuilder;

import java.time.LocalTime;

@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "shifts")
@ToString(callSuper = true)
@EqualsAndHashCode(callSuper = true, onlyExplicitlyIncluded = true)
public class Shift extends BaseEntity {

    @Indexed(unique = true)
    private String code;

    private String name;

    private LocalTime startTime;

    private LocalTime endTime;

    @Builder.Default
    private Boolean crossDay = false;

    @Builder.Default
    private Integer breakMinutes = 0;

    @Builder.Default
    private Integer paidBreakMinutes = 0;

    @Builder.Default
    private Integer minStaff = 1;

    @Builder.Default
    private Integer maxStaff = 1;

    @Builder.Default
    private ShiftStatus status = ShiftStatus.ACTIVE;

    private String description;
}
