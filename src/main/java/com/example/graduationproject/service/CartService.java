package com.example.graduationproject.service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import com.example.graduationproject.entity.Cart;
import com.example.graduationproject.entity.CartItem;
import com.example.graduationproject.entity.User;
import com.example.graduationproject.entity.Variant;
import com.example.graduationproject.entity.enums.CartStatus;
import com.example.graduationproject.exception.BadRequestException;
import com.example.graduationproject.exception.NotFoundException;
import com.example.graduationproject.payment.repository.CartItemRepository;
import com.example.graduationproject.payment.repository.CartRepository;
import com.example.graduationproject.payment.repository.UserRepository;
import com.example.graduationproject.payment.repository.VariantRepository;
import com.example.graduationproject.service.dto.AddToCartRequest;
import com.example.graduationproject.service.dto.CartSummaryResponse;
import com.example.graduationproject.service.dto.MessageResponse;
import com.example.graduationproject.service.dto.OrderPricingResult;
import com.example.graduationproject.service.dto.UpdateCartItemQuantityRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
public class CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final UserRepository userRepository;
    private final VariantRepository variantRepository;
    private final OrderService orderService;

    @Transactional
    public CartSummaryResponse addToCart(AddToCartRequest request) {
        User user = getUserById(request.getUserId());
        Variant variant = getVariantById(request.getVariantId());
        Cart cart = getOrCreateActiveCart(user);

        // Ensure cart is saved to get an ID if it's new
        if (cart.getId() == null) {
            cart = cartRepository.save(cart);
        }

        Optional<CartItem> existingItem = cart.getItems().stream()
                .filter(item -> item.getVariant().getId().equals(variant.getId()))
                .findFirst();

        int newQuantity = existingItem.map(item -> item.getQuantity() + request.getQuantity())
                .orElse(request.getQuantity());

        validateStock(variant, newQuantity);

        BigDecimal baseUnitPrice = variant.getProduct().getBasePrice().add(variant.getAdditionalPrice());
        if (existingItem.isPresent()) {
            CartItem cartItem = existingItem.get();
            cartItem.setQuantity(newQuantity);
            cartItem.setUnitPrice(baseUnitPrice);
            cartItemRepository.save(cartItem);
        } else {
            CartItem cartItem = CartItem.builder()
                    .cart(cart)
                    .variant(variant)
                    .quantity(request.getQuantity())
                    .unitPrice(baseUnitPrice)
                    .build();
            CartItem savedItem = cartItemRepository.save(cartItem);
            cart.getItems().add(savedItem);
        }

        return recalculateAndSaveCart(cart, user, request.getCouponCode());
    }

    @Transactional
    public CartSummaryResponse updateItemQuantity(UpdateCartItemQuantityRequest request) {
        User user = getUserById(request.getUserId());
        Cart cart = getActiveCart(user.getId());
        CartItem cartItem = cart.getItems().stream()
                .filter(item -> item.getVariant().getId().equals(request.getVariantId()))
                .findFirst()
                .orElseThrow(() -> new NotFoundException("Cart item not found"));

        Variant variant = getVariantById(request.getVariantId());
        validateStock(variant, request.getQuantity());

        cartItem.setQuantity(request.getQuantity());
        cartItem.setUnitPrice(variant.getProduct().getBasePrice().add(variant.getAdditionalPrice()));
        cartItemRepository.save(cartItem);

        return recalculateAndSaveCart(cart, user, request.getCouponCode());
    }

    @Transactional
    public CartSummaryResponse removeItem(String userId, String variantId, String couponCode) {
        User user = getUserById(userId);
        Cart cart = getActiveCart(userId);

        Optional<CartItem> itemToRemove = cart.getItems().stream()
                .filter(item -> item.getVariant().getId().equals(variantId))
                .findFirst();
        if (itemToRemove.isPresent()) {
            cartItemRepository.delete(itemToRemove.get());
            cart.getItems().remove(itemToRemove.get());
        } else {
            throw new NotFoundException("Cart item not found");
        }

        return recalculateAndSaveCart(cart, user, couponCode);
    }

    @Transactional
    public MessageResponse clearCart(String userId) {
        Cart cart = getActiveCart(userId);
        cartItemRepository.deleteByCartId(cart.getId());
        cart.getItems().clear();
        cart.setCoupon(null);
        cart.setTotalPrice(BigDecimal.ZERO);
        cartRepository.save(cart);

        return MessageResponse.builder()
                .message("Cart cleared successfully")
                .build();
    }

    @Transactional(readOnly = true)
    public CartSummaryResponse getCartSummary(String userId, String couponCode) {
        Cart cart = getActiveCartReadOnly(userId);

        String effectiveCouponCode = StringUtils.hasText(couponCode)
                ? couponCode
                : cart.getCoupon() != null ? cart.getCoupon().getCode() : null;

        OrderPricingResult pricingResult = orderService.calculateCartPricing(cart.getUser(), cart.getItems(), effectiveCouponCode);
        return mapCartSummary(cart, pricingResult);
    }

    private CartSummaryResponse recalculateAndSaveCart(Cart cart, User user, String couponCode) {
        if (cart.getItems().isEmpty()) {
            cart.setCoupon(null);
            cart.setTotalPrice(BigDecimal.ZERO);
            Cart savedCart = cartRepository.save(cart);
            return CartSummaryResponse.builder()
                    .cartId(savedCart.getId())
                    .userId(savedCart.getUser().getId())
                    .couponCode(null)
                    .subtotal(BigDecimal.ZERO)
                    .promotionDiscount(BigDecimal.ZERO)
                    .couponDiscount(BigDecimal.ZERO)
                    .finalPrice(BigDecimal.ZERO)
                    .items(List.of())
                    .build();
        }

        String effectiveCouponCode = StringUtils.hasText(couponCode)
                ? couponCode
                : cart.getCoupon() != null ? cart.getCoupon().getCode() : null;

        OrderPricingResult pricingResult = orderService.calculateCartPricing(user, cart.getItems(), effectiveCouponCode);
        cart.setCoupon(pricingResult.getAppliedCoupon());
        cart.setTotalPrice(pricingResult.getFinalPrice());

        Cart savedCart = cartRepository.save(cart);
        return mapCartSummary(savedCart, pricingResult);
    }

    private User getUserById(String userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found"));
    }

    private Variant getVariantById(String variantId) {
        // Cart operations may run under read-only transactions (pricing/preview), so don't use FOR UPDATE here.
        return variantRepository.findReadOnlyWithProductById(variantId)
                .orElseThrow(() -> new NotFoundException("Variant not found"));
    }

    private Cart getOrCreateActiveCart(User user) {
        return cartRepository.findByUserIdAndStatus(user.getId(), CartStatus.ACTIVE)
                .orElseGet(() -> Cart.builder()
                        .user(user)
                        .status(CartStatus.ACTIVE)
                        .totalPrice(BigDecimal.ZERO)
                        .build());
    }

    private Cart getActiveCart(String userId) {
        return cartRepository.findByUserIdAndStatus(userId, CartStatus.ACTIVE)
                .orElseThrow(() -> new NotFoundException("Active cart not found"));
    }

    private Cart getActiveCartReadOnly(String userId) {
        return cartRepository.findWithDetailsByUserIdAndStatus(userId, CartStatus.ACTIVE)
                .orElseThrow(() -> new NotFoundException("Active cart not found"));
    }

    private void validateStock(Variant variant, int quantity) {
        int effectiveStock = resolveEffectiveStock(variant);

        if (quantity <= 0) {
            throw new BadRequestException("Quantity must be greater than 0");
        }
        if (quantity > effectiveStock) {
            throw new BadRequestException("Requested quantity exceeds available stock (" + effectiveStock + ")");
        }
    }

    private int resolveEffectiveStock(Variant variant) {
        int variantStock = variant.getStockQuantity() != null ? variant.getStockQuantity() : 0;
        Integer productStockRaw = variant.getProduct() != null ? variant.getProduct().getTotalQuantity() : null;
        if (productStockRaw != null && productStockRaw > 0) {
            return productStockRaw;
        }
        return variantStock;
    }

    private CartSummaryResponse mapCartSummary(Cart cart, OrderPricingResult pricingResult) {
        return CartSummaryResponse.builder()
                .cartId(cart.getId())
                .userId(cart.getUser().getId())
                .couponCode(pricingResult.getAppliedCoupon() != null ? pricingResult.getAppliedCoupon().getCode() : null)
                .subtotal(pricingResult.getSubtotal())
                .promotionDiscount(pricingResult.getPromotionDiscount())
                .couponDiscount(pricingResult.getCouponDiscount())
                .finalPrice(pricingResult.getFinalPrice())
                .items(List.copyOf(pricingResult.getItems()))
                .build();
    }
}
