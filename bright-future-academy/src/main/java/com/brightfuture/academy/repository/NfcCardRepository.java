package com.brightfuture.academy.repository;

import com.brightfuture.academy.entity.NfcCard;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface NfcCardRepository extends JpaRepository<NfcCard, Long> {
    Optional<NfcCard> findByCardUidAndStatus(String cardUid, String status);
    Optional<NfcCard> findByStudentIdAndStatus(Long studentId, String status);
    boolean existsByCardUid(String cardUid);
}
