package com.brightfuture.academy.repository;

import com.brightfuture.academy.entity.Announcement;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface AnnouncementRepository extends JpaRepository<Announcement, Long> {
    @Query("SELECT a FROM Announcement a WHERE a.status = 'PUBLISHED' " +
           "AND (a.targetAudience = 'ALL' OR a.targetAudience = :audience " +
           "OR (:classId IS NOT NULL AND a.targetAudience = 'SPECIFIC_CLASS' AND a.targetClass.id = :classId)) " +
           "AND (a.expiresAt IS NULL OR a.expiresAt > CURRENT_TIMESTAMP) " +
           "ORDER BY a.publishedAt DESC")
    Page<Announcement> findPublishedForAudience(@Param("audience") String audience,
                                                 @Param("classId") Long classId,
                                                 Pageable pageable);

    @Query("SELECT a FROM Announcement a WHERE (a.status = 'PUBLISHED' " +
           "AND (a.expiresAt IS NULL OR a.expiresAt > CURRENT_TIMESTAMP)) " +
           "OR a.createdBy.id = :userId " +
           "ORDER BY a.createdAt DESC")
    Page<Announcement> findPublishedOrCreatedBy(@Param("userId") Long userId, Pageable pageable);

    Page<Announcement> findAllByOrderByCreatedAtDesc(Pageable pageable);
}
