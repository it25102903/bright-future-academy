package com.brightfuture.academy.repository;

import com.brightfuture.academy.entity.StudentGuardian;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface StudentGuardianRepository extends JpaRepository<StudentGuardian, Long> {
    List<StudentGuardian> findByStudentId(Long studentId);
    List<StudentGuardian> findByGuardianId(Long guardianId);
    Optional<StudentGuardian> findByStudentIdAndGuardianId(Long studentId, Long guardianId);
    boolean existsByStudentIdAndGuardianId(Long studentId, Long guardianId);
    boolean existsByGuardianUserIdAndStudentId(Long guardianUserId, Long studentId);
}
