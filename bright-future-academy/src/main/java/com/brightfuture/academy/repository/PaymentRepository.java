package com.brightfuture.academy.repository;

import com.brightfuture.academy.entity.Payment;
import com.brightfuture.academy.enums.PaymentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    Optional<Payment> findByPaymentReference(String reference);
    List<Payment> findByStudentIdAndStatusOrderByPaymentDateDesc(Long studentId, PaymentStatus status);

    @Query("SELECT p FROM Payment p WHERE " +
           "(:studentId IS NULL OR p.student.id = :studentId) " +
           "AND (:status IS NULL OR p.status = :status) " +
           "AND (:dateFrom IS NULL OR p.paymentDate >= :dateFrom) " +
           "AND (:dateTo IS NULL OR p.paymentDate <= :dateTo) " +
           "ORDER BY p.paymentDate DESC")
    Page<Payment> findWithFilters(@Param("studentId") Long studentId,
                                   @Param("status") PaymentStatus status,
                                   @Param("dateFrom") LocalDate dateFrom,
                                   @Param("dateTo") LocalDate dateTo,
                                   Pageable pageable);

    @Query("SELECT COALESCE(SUM(p.amount), 0) FROM Payment p WHERE p.status = 'COMPLETED' " +
           "AND (:dateFrom IS NULL OR p.paymentDate >= :dateFrom) " +
           "AND (:dateTo IS NULL OR p.paymentDate <= :dateTo)")
    BigDecimal sumCompletedPayments(@Param("dateFrom") LocalDate dateFrom,
                                    @Param("dateTo") LocalDate dateTo);

    @Query("SELECT MAX(CAST(SUBSTRING(p.paymentReference, 10) AS int)) FROM Payment p " +
           "WHERE p.paymentReference LIKE CONCAT('PAY-', :year, '-%')")
    Integer findMaxPaymentSequenceForYear(@Param("year") String year);

    @Query("SELECT COALESCE(SUM(p.amount), 0) FROM Payment p WHERE p.status = 'COMPLETED'")
    BigDecimal calculateTotalRevenue();
}
