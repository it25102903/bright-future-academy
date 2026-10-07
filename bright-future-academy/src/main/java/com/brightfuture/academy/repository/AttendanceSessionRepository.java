package com.brightfuture.academy.repository;

import com.brightfuture.academy.entity.AttendanceSession;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface AttendanceSessionRepository extends JpaRepository<AttendanceSession, Long> {
    List<AttendanceSession> findByClassEntityIdAndSessionDate(Long classId, LocalDate date);

    @Query("SELECT s FROM AttendanceSession s WHERE " +
           "(:classId IS NULL OR s.classEntity.id = :classId) " +
           "AND (:teacherId IS NULL OR s.teacher.id = :teacherId) " +
           "AND (:dateFrom IS NULL OR s.sessionDate >= :dateFrom) " +
           "AND (:dateTo IS NULL OR s.sessionDate <= :dateTo) " +
           "ORDER BY s.sessionDate DESC, s.startTime DESC")
    Page<AttendanceSession> findWithFilters(@Param("classId") Long classId,
                                             @Param("teacherId") Long teacherId,
                                             @Param("dateFrom") LocalDate dateFrom,
                                             @Param("dateTo") LocalDate dateTo,
                                             Pageable pageable);

    // For NFC: find open sessions for a class right now
    @Query("SELECT s FROM AttendanceSession s WHERE s.classEntity.id = :classId " +
           "AND s.sessionDate = :date AND s.status = 'OPEN'")
    List<AttendanceSession> findOpenSessionsForClass(@Param("classId") Long classId,
                                                      @Param("date") LocalDate date);
}
