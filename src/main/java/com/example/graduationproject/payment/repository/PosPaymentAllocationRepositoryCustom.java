package com.example.graduationproject.payment.repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public interface PosPaymentAllocationRepositoryCustom {
    BigDecimal sumCashAmountBetween(LocalDateTime from, LocalDateTime to);
}
