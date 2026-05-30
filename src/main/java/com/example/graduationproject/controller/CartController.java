package com.example.graduationproject.controller;

import com.example.graduationproject.common.api.ApiResponse;
import com.example.graduationproject.service.CartService;
import com.example.graduationproject.service.dto.AddToCartRequest;
import com.example.graduationproject.service.dto.CartSummaryResponse;
import com.example.graduationproject.service.dto.MessageResponse;
import com.example.graduationproject.service.dto.UpdateCartItemQuantityRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;

    @PostMapping("/add")
    public ResponseEntity<ApiResponse<CartSummaryResponse>> addToCart(@Valid @RequestBody AddToCartRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Cart updated successfully", cartService.addToCart(request)));
    }

    @PatchMapping("/items")
    public ResponseEntity<ApiResponse<CartSummaryResponse>> updateItemQuantity(@Valid @RequestBody UpdateCartItemQuantityRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Cart item updated successfully", cartService.updateItemQuantity(request)));
    }

    @DeleteMapping("/items/{variantId}")
    public ResponseEntity<ApiResponse<CartSummaryResponse>> removeItem(@PathVariable String variantId,
                                                                       @RequestParam String userId,
                                                                       @RequestParam(required = false) String couponCode) {
        return ResponseEntity.ok(ApiResponse.success("Cart item removed successfully", cartService.removeItem(userId, variantId, couponCode)));
    }

    @DeleteMapping
    public ResponseEntity<ApiResponse<MessageResponse>> clearCart(@RequestParam String userId) {
        return ResponseEntity.ok(ApiResponse.success("Cart cleared successfully", cartService.clearCart(userId)));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<CartSummaryResponse>> getCartSummary(@RequestParam String userId,
                                                                           @RequestParam(required = false) String couponCode) {
        return ResponseEntity.ok(ApiResponse.success("Cart fetched successfully", cartService.getCartSummary(userId, couponCode)));
    }
}
