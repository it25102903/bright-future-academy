package com.brightfuture.academy.repository;

import com.brightfuture.academy.entity.Receipt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface ReceiptRepository extends JpaRepository<Receipt, Long> {
    Optional<Receipt> findByPaymentId(Long paymentId);
    Optional<Receipt> findByReceiptNumber(String receiptNumber);

    @Query("SELECT MAX(CAST(SUBSTRING(r.receiptNumber, 10) AS int)) FROM Receipt r " +
           "WHERE r.receiptNumber LIKE CONCAT('RCP-', :year, '-%')")
    Integer findMaxReceiptSequenceForYear(@Param("year") String year);
}
