package com.example.graduationproject.controller;

import com.example.graduationproject.common.api.ApiResponse;
import com.example.graduationproject.service.AddressService;
import com.example.graduationproject.service.dto.AddressResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/addresses")
@RequiredArgsConstructor
public class AddressController {

    private final AddressService addressService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<AddressResponse>>> getUserAddresses(@RequestParam String userId) {
        return ResponseEntity.ok(ApiResponse.success("Addresses fetched successfully", addressService.getUserAddresses(userId)));
    }
}

