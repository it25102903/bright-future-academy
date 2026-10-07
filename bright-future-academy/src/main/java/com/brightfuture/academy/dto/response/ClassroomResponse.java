package com.brightfuture.academy.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ClassroomResponse {
    private Long id;
    private String roomNumber;
    private String name;
    private String building;
    private Integer floor;
    private Integer capacity;
    private String roomType;
    private String facilities;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
