package com.brightfuture.academy.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "classrooms")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Classroom {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "room_number", nullable = false, unique = true, length = 20)
    private String roomNumber;

    @Column(length = 100)
    private String name;

    @Column(length = 100)
    private String building;

    private Integer floor;

    @Column(nullable = false)
    private Integer capacity = 40;

    @Column(name = "room_type", nullable = false, columnDefinition = "ENUM('LECTURE_HALL', 'LAB', 'SEMINAR_ROOM', 'AUDITORIUM', 'GENERAL')")
    private String roomType = "GENERAL";

    @Column(columnDefinition = "TEXT")
    private String facilities;

    @Column(nullable = false, columnDefinition = "ENUM('AVAILABLE', 'OCCUPIED', 'UNDER_MAINTENANCE', 'INACTIVE')")
    private String status = "AVAILABLE";

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
