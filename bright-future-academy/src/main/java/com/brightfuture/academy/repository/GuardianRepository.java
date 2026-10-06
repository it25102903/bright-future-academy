package com.brightfuture.academy.repository;

import com.brightfuture.academy.entity.Guardian;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface GuardianRepository extends JpaRepository<Guardian, Long> {
    Optional<Guardian> findByUserId(Long userId);

    @Query("SELECT g FROM Guardian g WHERE " +
           "(:search IS NULL OR LOWER(g.firstName) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(g.lastName) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(g.phone) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(g.email) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "AND (:status IS NULL OR g.status = :status)")
    Page<Guardian> findAllWithFilters(@Param("search") String search,
                                     @Param("status") String status,
                                     Pageable pageable);
}

