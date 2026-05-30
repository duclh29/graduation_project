package com.example.graduationproject.security;

import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Date;
import java.util.Map;
import java.util.function.Function;

import com.example.graduationproject.exception.UnauthorizedException;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.UnsupportedJwtException;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.security.SecurityException;
import jakarta.annotation.PostConstruct;
import javax.crypto.SecretKey;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

@Component
public class JwtUtil {

    @Value("${jwt.secret}")
    private String accessSecret;

    @Value("${jwt.refresh-secret}")
    private String refreshSecret;

    @Value("${jwt.expiration}")
    private long accessExpiration;

    @Value("${jwt.refresh-expiration}")
    private long refreshExpiration;

    private SecretKey accessSigningKey;
    private SecretKey refreshSigningKey;

    @PostConstruct
    void init() {
        accessSigningKey = Keys.hmacShaKeyFor(accessSecret.getBytes(StandardCharsets.UTF_8));
        refreshSigningKey = Keys.hmacShaKeyFor(refreshSecret.getBytes(StandardCharsets.UTF_8));
    }

    public String generateAccessToken(UserDetails userDetails) {
        return generateToken(userDetails, accessSigningKey, accessExpiration, Map.of(
                "roles", userDetails.getAuthorities().stream().map(Object::toString).toList(),
                "type", "access"
        ));
    }

    public String generateRefreshToken(UserDetails userDetails) {
        return generateToken(userDetails, refreshSigningKey, refreshExpiration, Map.of("type", "refresh"));
    }

    public String extractUsernameFromAccessToken(String token) {
        return extractClaim(token, Claims::getSubject, accessSigningKey);
    }

    public String extractUsernameFromRefreshToken(String token) {
        return extractClaim(token, Claims::getSubject, refreshSigningKey);
    }

    public LocalDateTime extractAccessExpiration(String token) {
        return toLocalDateTime(extractClaim(token, Claims::getExpiration, accessSigningKey));
    }

    public LocalDateTime extractRefreshExpiration(String token) {
        return toLocalDateTime(extractClaim(token, Claims::getExpiration, refreshSigningKey));
    }

    public boolean isAccessTokenValid(String token, UserDetails userDetails) {
        return userDetails.getUsername().equals(extractUsernameFromAccessToken(token)) && !isExpired(token, accessSigningKey);
    }

    public boolean isRefreshTokenValid(String token, UserDetails userDetails) {
        return userDetails.getUsername().equals(extractUsernameFromRefreshToken(token)) && !isExpired(token, refreshSigningKey);
    }

    public long getAccessExpiration() {
        return accessExpiration;
    }

    private String generateToken(UserDetails userDetails, SecretKey secretKey, long expiration, Map<String, Object> claims) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + expiration);
        return Jwts.builder()
                .subject(userDetails.getUsername())
                .claims(claims)
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(secretKey)
                .compact();
    }

    private <T> T extractClaim(String token, Function<Claims, T> resolver, SecretKey secretKey) {
        return resolver.apply(extractAllClaims(token, secretKey));
    }

    private Claims extractAllClaims(String token, SecretKey secretKey) {
        if (!StringUtils.hasText(token)) {
            throw new UnauthorizedException("JWT token is missing");
        }

        try {
            return Jwts.parser()
                    .verifyWith(secretKey)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
        } catch (MalformedJwtException ex) {
            throw new UnauthorizedException("Malformed JWT token");
        } catch (ExpiredJwtException ex) {
            throw new UnauthorizedException("JWT token has expired");
        } catch (UnsupportedJwtException ex) {
            throw new UnauthorizedException("Unsupported JWT token");
        } catch (SecurityException ex) {
            throw new UnauthorizedException("Invalid JWT signature");
        } catch (IllegalArgumentException ex) {
            throw new UnauthorizedException("JWT token is invalid");
        }
    }

    private boolean isExpired(String token, SecretKey secretKey) {
        return extractClaim(token, Claims::getExpiration, secretKey).before(new Date());
    }

    private LocalDateTime toLocalDateTime(Date date) {
        return date.toInstant().atZone(ZoneId.systemDefault()).toLocalDateTime();
    }
}
