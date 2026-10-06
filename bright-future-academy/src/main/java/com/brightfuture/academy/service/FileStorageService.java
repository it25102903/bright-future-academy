package com.brightfuture.academy.service;

import com.brightfuture.academy.exception.BadRequestException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.*;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@Service
@Slf4j
public class FileStorageService {

    private final Path uploadDir;
    private static final List<String> ALLOWED_IMAGE_TYPES = Arrays.asList(
            "image/jpeg", "image/jpg", "image/png", "image/webp"
    );
    private static final List<String> ALLOWED_EXTENSIONS = Arrays.asList(
            "jpg", "jpeg", "png", "webp"
    );
    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

    public FileStorageService(@Value("${app.storage.upload-dir:./uploads}") String uploadDir) {
        this.uploadDir = Paths.get(uploadDir).toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.uploadDir);
        } catch (IOException ex) {
            throw new RuntimeException("Could not initialize file storage directory", ex);
        }
    }

    public String storeProfilePhoto(MultipartFile file, Long userId) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("Please select an image file to upload");
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new BadRequestException("Profile photo must not exceed 5MB in size");
        }

        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_IMAGE_TYPES.contains(contentType.toLowerCase())) {
            throw new BadRequestException("Invalid file type. Allowed formats: JPG, JPEG, PNG, WEBP");
        }

        String originalFilename = StringUtils.cleanPath(
                file.getOriginalFilename() != null ? file.getOriginalFilename() : "photo.jpg"
        );
        String extension = "";
        int dotIndex = originalFilename.lastIndexOf('.');
        if (dotIndex > 0) {
            extension = originalFilename.substring(dotIndex + 1).toLowerCase();
        }
        if (!ALLOWED_EXTENSIONS.contains(extension)) {
            throw new BadRequestException("Invalid file extension: " + extension);
        }

        try {
            Path photosDir = this.uploadDir.resolve("profile-photos");
            if (!Files.exists(photosDir)) {
                Files.createDirectories(photosDir);
            }

            String filename = "user-" + userId + "-" + UUID.randomUUID() + "." + extension;
            Path targetLocation = photosDir.resolve(filename).normalize();

            // Safety check against path traversal
            if (!targetLocation.startsWith(photosDir)) {
                throw new BadRequestException("Invalid target file path");
            }

            try (InputStream inputStream = file.getInputStream()) {
                Files.copy(inputStream, targetLocation, StandardCopyOption.REPLACE_EXISTING);
            }

            log.info("Stored profile photo for user {} at {}", userId, targetLocation);
            return "/uploads/profile-photos/" + filename;
        } catch (IOException ex) {
            log.error("Failed to store profile photo for user {}", userId, ex);
            throw new RuntimeException("Could not store image file. Please try again.", ex);
        }
    }

    public void deleteFile(String fileUrl) {
        if (fileUrl == null || !fileUrl.startsWith("/uploads/")) {
            return;
        }

        try {
            String relativePath = fileUrl.substring("/uploads/".length());
            Path filePath = this.uploadDir.resolve(relativePath).normalize();

            if (filePath.startsWith(this.uploadDir) && Files.exists(filePath)) {
                Files.delete(filePath);
                log.info("Deleted file at {}", filePath);
            }
        } catch (IOException ex) {
            log.warn("Could not delete file {}: {}", fileUrl, ex.getMessage());
        }
    }
}
