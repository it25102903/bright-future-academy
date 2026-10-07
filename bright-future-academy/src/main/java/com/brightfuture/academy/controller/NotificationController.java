package com.brightfuture.academy.controller;

import com.brightfuture.academy.dto.common.ApiResponse;
import com.brightfuture.academy.dto.response.NotificationResponse;
import com.brightfuture.academy.security.CurrentUser;
import com.brightfuture.academy.security.UserPrincipal;
import com.brightfuture.academy.service.NotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@Tag(name = "Notifications", description = "Notification management operations")
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    @Operation(summary = "List Notifications", description = "Get paginated list of notifications for the current user.")
    public ResponseEntity<ApiResponse<List<NotificationResponse>>> getNotifications(
            @RequestParam(required = false) Boolean unreadOnly,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @CurrentUser UserPrincipal currentUser) {

        Pageable pageable = PageRequest.of(page, size);
        Page<NotificationResponse> notifPage = notificationService.getUserNotifications(
                currentUser.getId(), unreadOnly, pageable);

        ApiResponse<List<NotificationResponse>> response = ApiResponse.<List<NotificationResponse>>builder()
                .success(true)
                .message("Notifications retrieved successfully")
                .data(notifPage.getContent())
                .pagination(ApiResponse.PageInfo.builder()
                        .page(notifPage.getNumber())
                        .size(notifPage.getSize())
                        .totalElements(notifPage.getTotalElements())
                        .totalPages(notifPage.getTotalPages())
                        .last(notifPage.isLast())
                        .build())
                .build();

        return ResponseEntity.ok(response);
    }

    @GetMapping("/unread-count")
    @Operation(summary = "Get Unread Count", description = "Get count of unread notifications.")
    public ResponseEntity<ApiResponse<Map<String, Long>>> getUnreadCount(@CurrentUser UserPrincipal currentUser) {
        long count = notificationService.getUnreadCount(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Unread count retrieved",
                Map.of("unreadCount", count)));
    }

    @PatchMapping("/{id}/read")
    @Operation(summary = "Mark as Read", description = "Mark a notification as read.")
    public ResponseEntity<ApiResponse<NotificationResponse>> markAsRead(
            @PathVariable Long id,
            @CurrentUser UserPrincipal currentUser) {
        NotificationResponse response = notificationService.markAsRead(id, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Notification marked as read", response));
    }

    @PatchMapping("/read-all")
    @Operation(summary = "Mark All as Read", description = "Mark all notifications as read for the current user.")
    public ResponseEntity<ApiResponse<Void>> markAllAsRead(@CurrentUser UserPrincipal currentUser) {
        notificationService.markAllAsRead(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("All notifications marked as read"));
    }
}
