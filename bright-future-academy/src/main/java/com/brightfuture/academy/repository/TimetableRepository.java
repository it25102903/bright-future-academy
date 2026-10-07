package com.brightfuture.academy.repository;

import com.brightfuture.academy.entity.Timetable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalTime;
import java.util.List;

@Repository
public interface TimetableRepository extends JpaRepository<Timetable, Long> {

    List<Timetable> findByClassEntityIdAndStatus(Long classId, String status);

    List<Timetable> findByTeacherIdAndStatus(Long teacherId, String status);

    List<Timetable> findByClassroomIdAndStatus(Long classroomId, String status);

    // Detect teacher conflicts: same teacher, same day, overlapping time
    @Query("SELECT t FROM Timetable t WHERE t.teacher.id = :teacherId " +
           "AND t.dayOfWeek = :dayOfWeek AND t.status = 'ACTIVE' " +
           "AND t.startTime < :endTime AND t.endTime > :startTime " +
           "AND (:excludeId IS NULL OR t.id != :excludeId)")
    List<Timetable> findTeacherConflicts(@Param("teacherId") Long teacherId,
                                          @Param("dayOfWeek") String dayOfWeek,
                                          @Param("startTime") LocalTime startTime,
                                          @Param("endTime") LocalTime endTime,
                                          @Param("excludeId") Long excludeId);

    // Detect classroom conflicts: same room, same day, overlapping time
    @Query("SELECT t FROM Timetable t WHERE t.classroom.id = :classroomId " +
           "AND t.dayOfWeek = :dayOfWeek AND t.status = 'ACTIVE' " +
           "AND t.startTime < :endTime AND t.endTime > :startTime " +
           "AND (:excludeId IS NULL OR t.id != :excludeId)")
    List<Timetable> findClassroomConflicts(@Param("classroomId") Long classroomId,
                                            @Param("dayOfWeek") String dayOfWeek,
                                            @Param("startTime") LocalTime startTime,
                                            @Param("endTime") LocalTime endTime,
                                            @Param("excludeId") Long excludeId);

    // Find active session for NFC attendance validation
    @Query("SELECT t FROM Timetable t WHERE t.dayOfWeek = :dayOfWeek AND t.status = 'ACTIVE' " +
           "AND t.startTime <= :currentTime AND t.endTime >= :currentTime")
    List<Timetable> findActiveSessionsNow(@Param("dayOfWeek") String dayOfWeek,
                                           @Param("currentTime") LocalTime currentTime);

    // Find timetable entries for a student's active class enrollments
    @Query("SELECT DISTINCT t FROM Timetable t " +
           "JOIN FETCH t.classEntity " +
           "JOIN FETCH t.subject " +
           "JOIN FETCH t.teacher te " +
           "JOIN FETCH te.user " +
           "JOIN FETCH t.classroom " +
           "JOIN StudentEnrollment se ON se.classEntity = t.classEntity " +
           "WHERE se.student.id = :studentId AND se.status = 'ACTIVE' AND t.status = 'ACTIVE'")
    List<Timetable> findByStudentId(@Param("studentId") Long studentId);
}
