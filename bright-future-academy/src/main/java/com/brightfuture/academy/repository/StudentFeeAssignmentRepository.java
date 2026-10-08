package com.brightfuture.academy.repository;

import com.brightfuture.academy.entity.StudentFeeAssignment;
import com.brightfuture.academy.enums.FeeStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.math.BigDecimal;
import java.util.List;

@Repository
public interface StudentFeeAssignmentRepository extends JpaRepository<StudentFeeAssignment, Long> {
    List<StudentFeeAssignment> findByStudentId(Long studentId);
    List<StudentFeeAssignment> findByStudentIdAndFeeStatus(Long studentId, FeeStatus status);

    @Query("SELECT sfa FROM StudentFeeAssignment sfa " +
           "WHERE (:studentId IS NULL OR sfa.student.id = :studentId) " +
           "AND (:status IS NULL OR sfa.feeStatus = :status) " +
           "AND (:search IS NULL OR LOWER(sfa.student.user.firstName) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "     OR LOWER(sfa.student.user.lastName) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "     OR LOWER(sfa.student.studentIdNumber) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "     OR LOWER(sfa.feeStructure.name) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "ORDER BY sfa.createdAt DESC")
    List<StudentFeeAssignment> findWithFilters(
            @Param("studentId") Long studentId,
            @Param("status") FeeStatus status,
            @Param("search") String search);

    @Query("SELECT COALESCE(SUM(sfa.assignedAmount - sfa.discountAmount - sfa.totalPaid), 0) " +
           "FROM StudentFeeAssignment sfa WHERE sfa.student.id = :studentId " +
           "AND sfa.feeStatus != 'PAID' AND sfa.feeStatus != 'WAIVED'")
    BigDecimal calculateOutstandingBalance(@Param("studentId") Long studentId);

    @Query("SELECT COALESCE(SUM(sfa.assignedAmount - sfa.discountAmount - sfa.totalPaid), 0) " +
           "FROM StudentFeeAssignment sfa WHERE sfa.feeStatus != 'PAID' AND sfa.feeStatus != 'WAIVED'")
    BigDecimal calculateTotalOutstanding();
}

