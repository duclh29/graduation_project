package com.example.graduationproject.payment.config;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableConfigurationProperties({VnpayProperties.class, MomoProperties.class})
public class PaymentPropertiesConfig {
}
