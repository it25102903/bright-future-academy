package com.brightfuture.academy.service;

import com.brightfuture.academy.dto.request.ClassroomCreateRequest;
import com.brightfuture.academy.dto.response.ClassroomResponse;
import com.brightfuture.academy.entity.Classroom;
import com.brightfuture.academy.exception.*;
import com.brightfuture.academy.repository.ClassroomRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class ClassroomService {

    private final ClassroomRepository classroomRepository;
    private final AuditLogService auditLogService;

    @Transactional
    public ClassroomResponse createClassroom(ClassroomCreateRequest request, Long createdByUserId) {
        if (classroomRepository.existsByRoomNumber(request.getRoomNumber())) {
            throw new ConflictException("A classroom with room number '" + request.getRoomNumber() + "' already exists");
        }

        Classroom classroom = Classroom.builder()
                .roomNumber(request.getRoomNumber())
                .name(request.getName())
                .building(request.getBuilding())
                .floor(request.getFloor())
                .capacity(request.getCapacity() != null ? request.getCapacity() : 40)
                .roomType(request.getRoomType() != null ? request.getRoomType() : "GENERAL")
                .facilities(request.getFacilities())
                .status("AVAILABLE")
                .build();

        classroom = classroomRepository.save(classroom);

        auditLogService.log(createdByUserId, "CREATE_CLASSROOM", "CLASSROOM", classroom.getId(),
                "Created classroom " + classroom.getRoomNumber());

        return mapToResponse(classroom);
    }

    @Transactional(readOnly = true)
    public ClassroomResponse getClassroomById(Long id) {
        Classroom classroom = classroomRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Classroom", "id", id));
        return mapToResponse(classroom);
    }

    @Transactional(readOnly = true)
    public Page<ClassroomResponse> getAllClassrooms(String search, String status, Pageable pageable) {
        return classroomRepository.findAllWithFilters(search, status, pageable)
                .map(this::mapToResponse);
    }

    @Transactional
    public ClassroomResponse updateClassroom(Long id, ClassroomCreateRequest request, Long updatedByUserId) {
        Classroom classroom = classroomRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Classroom", "id", id));

        classroom.setRoomNumber(request.getRoomNumber());
        classroom.setName(request.getName());
        classroom.setBuilding(request.getBuilding());
        classroom.setFloor(request.getFloor());
        if (request.getCapacity() != null) {
            classroom.setCapacity(request.getCapacity());
        }
        if (request.getRoomType() != null) {
            classroom.setRoomType(request.getRoomType());
        }
        classroom.setFacilities(request.getFacilities());

        classroom = classroomRepository.save(classroom);

        auditLogService.log(updatedByUserId, "UPDATE_CLASSROOM", "CLASSROOM", classroom.getId(),
                "Updated classroom " + classroom.getRoomNumber());

        return mapToResponse(classroom);
    }

    @Transactional
    public void deleteClassroom(Long id, Long userId) {
        Classroom classroom = classroomRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Classroom", "id", id));
        classroom.setStatus("UNAVAILABLE");
        classroomRepository.save(classroom);

        auditLogService.log(userId, "DELETE_CLASSROOM", "CLASSROOM", id,
                "Marked classroom " + classroom.getRoomNumber() + " as unavailable");
    }

    private ClassroomResponse mapToResponse(Classroom classroom) {
        return ClassroomResponse.builder()
                .id(classroom.getId())
                .roomNumber(classroom.getRoomNumber())
                .name(classroom.getName())
                .building(classroom.getBuilding())
                .floor(classroom.getFloor())
                .capacity(classroom.getCapacity())
                .roomType(classroom.getRoomType())
                .facilities(classroom.getFacilities())
                .status(classroom.getStatus())
                .createdAt(classroom.getCreatedAt())
                .updatedAt(classroom.getUpdatedAt())
                .build();
    }
}
