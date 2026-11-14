package com.trpg_printalbe_pdf_maker.trpg_printable_pdf_maker.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry){
        registry.addMapping("/**")
            .allowedOriginPatterns("http://localhost:*", "http://127.0.0.1:*", "https://www.trpg-printable-pdf-maker.com", "http://www.trpg-printable-pdf-maker.com", "https://trpg-printable-pdf-maker.com", "http://trpg-printable-pdf-maker.com")
            .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
            .allowedHeaders("*")
                .allowCredentials(true);
    }
}
