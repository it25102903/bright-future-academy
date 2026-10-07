package com.brightfuture.academy.repository;

import com.brightfuture.academy.entity.AttendanceRecord;
import com.brightfuture.academy.enums.AttendanceStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface AttendanceRecordRepository extends JpaRepository<AttendanceRecord, Long> {
    List<AttendanceRecord> findByAttendanceSessionId(Long sessionId);

    boolean existsByAttendanceSessionIdAndStudentId(Long sessionId, Long studentId);

    @Query("SELECT ar FROM AttendanceRecord ar " +
           "JOIN FETCH ar.student stu " +
           "JOIN FETCH stu.user " +
           "LEFT JOIN FETCH ar.attendanceSession s " +
           "LEFT JOIN FETCH s.classEntity " +
           "LEFT JOIN FETCH s.subject " +
           "LEFT JOIN FETCH s.teacher t " +
           "LEFT JOIN FETCH t.user " +
           "WHERE ar.student.id = :studentId " +
           "AND ar.attendanceSession.sessionDate BETWEEN :dateFrom AND :dateTo")
    List<AttendanceRecord> findByStudentAndDateRange(@Param("studentId") Long studentId,
                                                      @Param("dateFrom") LocalDate dateFrom,
                                                      @Param("dateTo") LocalDate dateTo);

    @Query("SELECT COUNT(ar) FROM AttendanceRecord ar WHERE ar.student.id = :studentId " +
           "AND ar.attendanceSession.sessionDate BETWEEN :dateFrom AND :dateTo")
    long countByStudentAndDateRange(@Param("studentId") Long studentId,
                                    @Param("dateFrom") LocalDate dateFrom,
                                    @Param("dateTo") LocalDate dateTo);

    @Query("SELECT COUNT(ar) FROM AttendanceRecord ar WHERE ar.student.id = :studentId " +
           "AND ar.status = :status " +
           "AND ar.attendanceSession.sessionDate BETWEEN :dateFrom AND :dateTo")
    long countByStudentStatusAndDateRange(@Param("studentId") Long studentId,
                                          @Param("status") AttendanceStatus status,
                                          @Param("dateFrom") LocalDate dateFrom,
                                          @Param("dateTo") LocalDate dateTo);

    @Query("SELECT COUNT(ar) FROM AttendanceRecord ar WHERE ar.attendanceSession.classEntity.id = :classId " +
           "AND ar.attendanceSession.sessionDate = :date AND ar.status = :status")
    long countByClassDateAndStatus(@Param("classId") Long classId,
                                    @Param("date") LocalDate date,
                                    @Param("status") AttendanceStatus status);

    @Query("SELECT COUNT(ar) FROM AttendanceRecord ar " +
           "WHERE ar.attendanceSession.sessionDate BETWEEN :dateFrom AND :dateTo")
    long countByDateRange(@Param("dateFrom") LocalDate dateFrom,
                          @Param("dateTo") LocalDate dateTo);

    @Query("SELECT COUNT(ar) FROM AttendanceRecord ar WHERE ar.status = :status " +
           "AND ar.attendanceSession.sessionDate BETWEEN :dateFrom AND :dateTo")
    long countByStatusAndDateRange(@Param("status") AttendanceStatus status,
                                   @Param("dateFrom") LocalDate dateFrom,
                                   @Param("dateTo") LocalDate dateTo);
}
