package com.brightfuture.academy.repository;

import com.brightfuture.academy.entity.Exam;
import com.brightfuture.academy.enums.ExamStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ExamRepository extends JpaRepository<Exam, Long> {

    List<Exam> findByTeacherIdOrderByCreatedAtDesc(Long teacherId);

    List<Exam> findByTeacherIdAndStatusOrderByCreatedAtDesc(Long teacherId, ExamStatus status);

    @Query("SELECT e FROM Exam e WHERE e.teacher.id = :teacherId AND " +
           "(:status IS NULL OR e.status = :status) AND " +
           "(:search IS NULL OR LOWER(e.title) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(e.subject.name) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "ORDER BY e.createdAt DESC")
    List<Exam> findTeacherExamsWithFilters(@Param("teacherId") Long teacherId,
                                          @Param("status") ExamStatus status,
                                          @Param("search") String search);

    @Query("SELECT DISTINCT e FROM Exam e " +
           "JOIN ExamAssignment ea ON ea.exam.id = e.id " +
           "WHERE ea.student.id = :studentId " +
           "ORDER BY e.startTime ASC")
    List<Exam> findExamsAssignedToStudent(@Param("studentId") Long studentId);

    @Query("SELECT DISTINCT e FROM Exam e " +
           "JOIN ExamAssignment ea ON ea.exam.id = e.id " +
           "WHERE ea.student.id = :studentId AND e.status = 'PUBLISHED' " +
           "AND :now BETWEEN e.startTime AND e.endTime " +
           "ORDER BY e.endTime ASC")
    List<Exam> findAvailableExamsForStudent(@Param("studentId") Long studentId, @Param("now") LocalDateTime now);

    @Query("SELECT DISTINCT e FROM Exam e " +
           "JOIN ExamAssignment ea ON ea.exam.id = e.id " +
           "WHERE ea.student.id = :studentId AND e.status = 'PUBLISHED' " +
           "AND e.startTime > :now " +
           "ORDER BY e.startTime ASC")
    List<Exam> findUpcomingExamsForStudent(@Param("studentId") Long studentId, @Param("now") LocalDateTime now);
}
