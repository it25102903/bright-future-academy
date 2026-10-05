package com.brightfuture.academy;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class BrightFutureAcademyApplication {

    public static void main(String[] args) {
        SpringApplication.run(BrightFutureAcademyApplication.class, args);
    }
}
