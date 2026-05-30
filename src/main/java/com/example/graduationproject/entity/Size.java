package com.example.graduationproject.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.ReadOnlyProperty;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.DocumentReference;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

import java.util.HashSet;
import java.util.Set;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "sizes")
@ToString
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class Size {

    @Id
    @EqualsAndHashCode.Include
    private String id;

    private String name;

    @Builder.Default
    @ToString.Exclude
    @ReadOnlyProperty
    @DocumentReference(lazy = true, lookup = "{'size':?#{#self._id}}")
    private Set<Variant> variants = new HashSet<>();
}
