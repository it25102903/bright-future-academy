package com.brightfuture.academy.service;

import com.brightfuture.academy.dto.common.ApiResponse;
import com.brightfuture.academy.entity.*;
import com.brightfuture.academy.exception.*;
import com.brightfuture.academy.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class TimetableService {

    private final TimetableRepository timetableRepository;
    private final ClassRepository classRepository;
    private final SubjectRepository subjectRepository;
    private final TeacherRepository teacherRepository;
    private final ClassroomRepository classroomRepository;
    private final AuditLogService auditLogService;

    @Transactional
    public Timetable createTimetable(Long classId, Long subjectId, Long teacherId, Long classroomId,
                                      String dayOfWeek, LocalTime startTime, LocalTime endTime,
                                      Integer academicYear, Long createdByUserId) {
        // Validate time range
        if (!startTime.isBefore(endTime)) {
            throw new BadRequestException("Start time must be before end time");
        }

        ClassEntity classEntity = classRepository.findById(classId)
                .orElseThrow(() -> new ResourceNotFoundException("Class", "id", classId));
        Subject subject = subjectRepository.findById(subjectId)
                .orElseThrow(() -> new ResourceNotFoundException("Subject", "id", subjectId));
        Teacher teacher = teacherRepository.findById(teacherId)
                .orElseThrow(() -> new ResourceNotFoundException("Teacher", "id", teacherId));
        Classroom classroom = classroomRepository.findById(classroomId)
                .orElseThrow(() -> new ResourceNotFoundException("Classroom", "id", classroomId));

        // Check teacher conflicts
        List<Timetable> teacherConflicts = timetableRepository.findTeacherConflicts(
                teacherId, dayOfWeek, startTime, endTime, null);
        if (!teacherConflicts.isEmpty()) {
            Timetable conflict = teacherConflicts.get(0);
            throw new ConflictException(String.format(
                    "Teacher %s %s is already scheduled on %s from %s to %s for class %s",
                    teacher.getUser().getFirstName(), teacher.getUser().getLastName(),
                    dayOfWeek, conflict.getStartTime(), conflict.getEndTime(),
                    conflict.getClassEntity().getClassName()));
        }

        // Check classroom conflicts
        List<Timetable> roomConflicts = timetableRepository.findClassroomConflicts(
                classroomId, dayOfWeek, startTime, endTime, null);
        if (!roomConflicts.isEmpty()) {
            Timetable conflict = roomConflicts.get(0);
            throw new ConflictException(String.format(
                    "Classroom %s is already booked on %s from %s to %s for class %s",
                    classroom.getRoomNumber(), dayOfWeek,
                    conflict.getStartTime(), conflict.getEndTime(),
                    conflict.getClassEntity().getClassName()));
        }

        Timetable timetable = Timetable.builder()
                .classEntity(classEntity)
                .subject(subject)
                .teacher(teacher)
                .classroom(classroom)
                .dayOfWeek(dayOfWeek.toUpperCase())
                .startTime(startTime)
                .endTime(endTime)
                .academicYear(academicYear)
                .status("ACTIVE")
                .build();

        timetable = timetableRepository.save(timetable);

        auditLogService.log(createdByUserId, "CREATE_TIMETABLE", "TIMETABLE", timetable.getId(),
                "Created timetable: " + classEntity.getClassName() + " " + subject.getName() + " " + dayOfWeek);

        return timetable;
    }

    @Transactional(readOnly = true)
    public List<Timetable> getClassTimetable(Long classId) {
        return timetableRepository.findByClassEntityIdAndStatus(classId, "ACTIVE");
    }

    @Transactional(readOnly = true)
    public List<Timetable> getTeacherTimetable(Long teacherId) {
        return timetableRepository.findByTeacherIdAndStatus(teacherId, "ACTIVE");
    }

    @Transactional(readOnly = true)
    public List<Timetable> getClassroomTimetable(Long classroomId) {
        return timetableRepository.findByClassroomIdAndStatus(classroomId, "ACTIVE");
    }

    @Transactional(readOnly = true)
    public List<Timetable> getStudentTimetable(Long studentId) {
        return timetableRepository.findByStudentId(studentId);
    }

    @Transactional
    public void deleteTimetable(Long id, Long userId) {
        Timetable timetable = timetableRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Timetable", "id", id));
        timetable.setStatus("CANCELLED");
        timetableRepository.save(timetable);
        auditLogService.log(userId, "DELETE_TIMETABLE", "TIMETABLE", id, "Cancelled timetable entry");
    }
}
