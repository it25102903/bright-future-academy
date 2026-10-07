package com.brightfuture.academy.repository;

import com.brightfuture.academy.entity.ExamAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ExamAssignmentRepository extends JpaRepository<ExamAssignment, Long> {

    List<ExamAssignment> findByExamId(Long examId);

    List<ExamAssignment> findByStudentId(Long studentId);

    boolean existsByExamIdAndStudentId(Long examId, Long studentId);

    Optional<ExamAssignment> findByExamIdAndStudentId(Long examId, Long studentId);

    long countByExamId(Long examId);

    void deleteByExamId(Long examId);

    @Query("SELECT ea.student.id FROM ExamAssignment ea WHERE ea.exam.id = :examId")
    List<Long> findAssignedStudentIds(@Param("examId") Long examId);
}
