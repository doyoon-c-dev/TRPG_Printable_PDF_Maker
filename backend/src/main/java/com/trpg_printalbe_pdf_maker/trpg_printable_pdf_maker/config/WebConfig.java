package com.trpg_printalbe_pdf_maker.trpg_printable_pdf_maker.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry){
        registry.addMapping("/**")
            .allowedOriginPatterns("http://localhost:*", "http://127.0.0.1:*", "https://trpg-printable-pdf-maker.vercel.app/")
            .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
            .allowedHeaders("*")
                .allowCredentials(true);
    }
}
