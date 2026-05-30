package com.example.graduationproject.controller;

import com.example.graduationproject.auth.service.AuthService;
import com.example.graduationproject.config.SecurityConfig;
import com.example.graduationproject.product.ProductController;
import com.example.graduationproject.product.ProductService;
import com.example.graduationproject.product.dto.ProductResponse;
import com.example.graduationproject.security.CustomUserDetailsService;
import com.example.graduationproject.security.JwtAuthenticationEntryPoint;
import com.example.graduationproject.security.JwtAuthenticationFilter;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.mongodb.core.mapping.MongoMappingContext;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(ProductController.class)
@AutoConfigureMockMvc(addFilters = false)
@Import(SecurityConfig.class)
class ProductControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ProductService productService;

    @MockBean
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @MockBean
    private JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint;

    @MockBean
    private CustomUserDetailsService customUserDetailsService;

    @MockBean
    private AuthService authService;

    @MockBean(name = "mongoMappingContext")
    private MongoMappingContext mongoMappingContext;

    @Test
    void shouldReturnPaginatedProducts() throws Exception {
        when(productService.searchProducts(any(), any(), any(), any(), any(), any(), any(), any())).thenReturn(new PageImpl<>(List.of(
                ProductResponse.builder().id("1").name("Shoe A").slug("shoe-a").brand("Nike").category("Sneaker").description("desc").basePrice(BigDecimal.valueOf(100)).build()
        ), PageRequest.of(0, 10), 1));

        mockMvc.perform(get("/api/products").accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.content[0].name").value("Shoe A"));
    }
}
