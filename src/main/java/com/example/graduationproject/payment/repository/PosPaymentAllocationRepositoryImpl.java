package com.example.graduationproject.payment.repository;

import org.bson.Document;
import org.bson.types.Decimal128;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.aggregation.Aggregation;
import org.springframework.data.mongodb.core.aggregation.AggregationResults;
import org.springframework.data.mongodb.core.query.Criteria;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class PosPaymentAllocationRepositoryImpl implements PosPaymentAllocationRepositoryCustom {

    @Autowired
    private MongoTemplate mongoTemplate;

    @Override
    public BigDecimal sumCashAmountBetween(LocalDateTime from, LocalDateTime to) {
        Aggregation aggregation = Aggregation.newAggregation(
            Aggregation.match(Criteria.where("method").is("COD").and("createdAt").gte(from).lt(to)),
            Aggregation.group().sum("amount").as("total")
        );

        AggregationResults<Document> results = mongoTemplate.aggregate(aggregation, "pos_payment_allocations", Document.class);
        Document uniqueResult = results.getUniqueMappedResult();
        if (uniqueResult != null && uniqueResult.get("total") != null) {
            Object total = uniqueResult.get("total");
            if (total instanceof Decimal128 d128) {
                return d128.bigDecimalValue();
            } else if (total instanceof BigDecimal bd) {
                return bd;
            } else if (total instanceof Number num) {
                return BigDecimal.valueOf(num.doubleValue());
            }
        }
        return BigDecimal.ZERO;
    }
}
