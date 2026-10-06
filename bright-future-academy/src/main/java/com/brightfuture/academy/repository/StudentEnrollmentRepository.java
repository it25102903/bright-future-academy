package com.brightfuture.academy.repository;

import com.brightfuture.academy.entity.StudentEnrollment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface StudentEnrollmentRepository extends JpaRepository<StudentEnrollment, Long> {
    List<StudentEnrollment> findByStudentId(Long studentId);
    List<StudentEnrollment> findByClassEntityId(Long classId);
    List<StudentEnrollment> findByClassEntityIdAndStatus(Long classId, String status);

    Optional<StudentEnrollment> findByStudentIdAndClassEntityIdAndAcademicYear(
            Long studentId, Long classId, Integer academicYear);

    boolean existsByStudentIdAndClassEntityIdAndAcademicYear(
            Long studentId, Long classId, Integer academicYear);

    @Query("SELECT COUNT(se) FROM StudentEnrollment se WHERE se.classEntity.id = :classId AND se.status = 'ACTIVE'")
    long countActiveByClassId(@Param("classId") Long classId);

    @Query("SELECT se FROM StudentEnrollment se WHERE se.student.id = :studentId AND se.status = 'ACTIVE'")
    List<StudentEnrollment> findActiveByStudentId(@Param("studentId") Long studentId);

    boolean existsByStudentIdAndClassEntityIdAndStatus(Long studentId, Long classId, String status);
}
