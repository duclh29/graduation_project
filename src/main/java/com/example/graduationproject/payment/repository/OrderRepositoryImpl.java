package com.example.graduationproject.payment.repository;

import com.example.graduationproject.entity.enums.OrderStatus;
import org.bson.Document;
import org.bson.types.Decimal128;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.aggregation.Aggregation;
import org.springframework.data.mongodb.core.aggregation.AggregationResults;
import org.springframework.data.mongodb.core.query.Criteria;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Pattern;

public class OrderRepositoryImpl implements OrderRepositoryCustom {

    @Autowired
    private MongoTemplate mongoTemplate;

    @Override
    public Long sumSoldQuantityByOrderStatus(OrderStatus status) {
        Aggregation aggregation = Aggregation.newAggregation(
            Aggregation.lookup("orders", "order", "_id", "order_doc"),
            Aggregation.unwind("order_doc"),
            Aggregation.match(Criteria.where("order_doc.status").is(status.name())),
            Aggregation.group().sum("quantity").as("totalQuantity")
        );

        AggregationResults<Document> results = mongoTemplate.aggregate(aggregation, "order_items", Document.class);
        Document uniqueResult = results.getUniqueMappedResult();
        if (uniqueResult != null && uniqueResult.get("totalQuantity") != null) {
            return ((Number) uniqueResult.get("totalQuantity")).longValue();
        }
        return 0L;
    }

    @Override
    public List<Object[]> findTopSellingProducts(OrderStatus status, Pageable pageable) {
        Aggregation aggregation = Aggregation.newAggregation(
            Aggregation.lookup("orders", "order", "_id", "order_doc"),
            Aggregation.unwind("order_doc"),
            Aggregation.match(Criteria.where("order_doc.status").is(status.name())),
            
            Aggregation.lookup("variants", "variant", "_id", "variant_doc"),
            Aggregation.unwind("variant_doc"),
            
            Aggregation.lookup("products", "variant_doc.product", "_id", "product_doc"),
            Aggregation.unwind("product_doc"),
            context -> new Document("$addFields", new Document("totalPriceNumber", decimalConversion("$totalPrice"))),
            
            Aggregation.group("product_doc._id")
                .first("product_doc.name").as("productName")
                .sum("quantity").as("soldQuantity")
                .sum("totalPriceNumber").as("revenue")
                .first("product_doc.imageUrl").as("imageUrl"),
                
            Aggregation.sort(org.springframework.data.domain.Sort.Direction.DESC, "soldQuantity"),
            Aggregation.skip(pageable.getOffset()),
            Aggregation.limit(pageable.getPageSize())
        );

        AggregationResults<Document> results = mongoTemplate.aggregate(aggregation, "order_items", Document.class);
        List<Object[]> list = new ArrayList<>();
        for (Document doc : results.getMappedResults()) {
            Object[] row = new Object[5];
            row[0] = doc.get("_id") != null ? doc.get("_id").toString() : null;
            row[1] = doc.get("productName");
            row[2] = doc.get("soldQuantity") != null ? ((Number) doc.get("soldQuantity")).longValue() : 0L;
            
            Object rev = doc.get("revenue");
            if (rev instanceof Decimal128 d128) {
                row[3] = d128.bigDecimalValue();
            } else if (rev instanceof BigDecimal bd) {
                row[3] = bd;
            } else if (rev instanceof Number num) {
                row[3] = BigDecimal.valueOf(num.doubleValue());
            } else {
                row[3] = BigDecimal.ZERO;
            }
            
            row[4] = doc.get("imageUrl");
            list.add(row);
        }
        return list;
    }

    @Override
    public BigDecimal sumFinalPriceByStatus(OrderStatus status) {
        Aggregation aggregation = Aggregation.newAggregation(
            Aggregation.match(Criteria.where("status").is(status.name())),
            context -> new Document("$addFields", new Document("finalPriceNumber", decimalConversion("$finalPrice"))),
            Aggregation.group().sum("finalPriceNumber").as("total")
        );

        AggregationResults<Document> results = mongoTemplate.aggregate(aggregation, "orders", Document.class);
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

    @Override
    public BigDecimal sumFinalPriceByStatusAndCreatedAtBetween(OrderStatus status, LocalDateTime from, LocalDateTime to) {
        Aggregation aggregation = Aggregation.newAggregation(
            Aggregation.match(Criteria.where("status").is(status.name()).and("createdAt").gte(from).lt(to)),
            context -> new Document("$addFields", new Document("finalPriceNumber", decimalConversion("$finalPrice"))),
            Aggregation.group().sum("finalPriceNumber").as("total")
        );

        AggregationResults<Document> results = mongoTemplate.aggregate(aggregation, "orders", Document.class);
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

    @Override
    public BigDecimal sumRevenueByStatusAndBusinessDateBetween(OrderStatus status, LocalDateTime from, LocalDateTime to) {
        Aggregation aggregation = Aggregation.newAggregation(
            Aggregation.match(Criteria.where("status").is(status.name())),
            Aggregation.lookup("payments", "_id", "order", "payment_doc"),
            Aggregation.unwind("payment_doc", true),
            Aggregation.lookup("shippings", "_id", "order", "shipping_doc"),
            Aggregation.unwind("shipping_doc", true),
            context -> new Document("$addFields", new Document("revenueAt",
                    new Document("$ifNull", List.of(
                            "$payment_doc.paidAt",
                            new Document("$ifNull", List.of("$shipping_doc.deliveredAt", "$createdAt"))
                    ))
            )),
            Aggregation.match(Criteria.where("revenueAt").gte(from).lt(to)),
            context -> new Document("$addFields", new Document("finalPriceNumber", decimalConversion("$finalPrice"))),
            Aggregation.group().sum("finalPriceNumber").as("total")
        );

        AggregationResults<Document> results = mongoTemplate.aggregate(aggregation, "orders", Document.class);
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

    private Document decimalConversion(String fieldPath) {
        return new Document("$convert", new Document("input", fieldPath)
                .append("to", "decimal")
                .append("onError", BigDecimal.ZERO)
                .append("onNull", BigDecimal.ZERO));
    }

    @Override
    public long countDistinctUsersByStatusNot(OrderStatus status) {
        Aggregation aggregation = Aggregation.newAggregation(
            Aggregation.match(Criteria.where("status").ne(status.name())),
            Aggregation.group("user"),
            Aggregation.count().as("userCount")
        );

        AggregationResults<Document> results = mongoTemplate.aggregate(aggregation, "orders", Document.class);
        Document uniqueResult = results.getUniqueMappedResult();
        if (uniqueResult != null && uniqueResult.get("userCount") != null) {
            return ((Number) uniqueResult.get("userCount")).longValue();
        }
        return 0L;
    }

    @Override
    public org.springframework.data.domain.Page<com.example.graduationproject.entity.Order> searchAdminOrders(String keyword, OrderStatus status, Pageable pageable) {
        org.springframework.data.mongodb.core.query.Query query = new org.springframework.data.mongodb.core.query.Query();
        List<Criteria> criteriaList = new ArrayList<>();

        if (keyword != null && !keyword.isBlank()) {
            Pattern keywordPattern = Pattern.compile(Pattern.quote(keyword.trim()), Pattern.CASE_INSENSITIVE);
            criteriaList.add(Criteria.where("orderCode").regex(keywordPattern));
        }
        if (status != null) {
            criteriaList.add(Criteria.where("status").is(status.name()));
        }
        if (!criteriaList.isEmpty()) {
            query.addCriteria(new Criteria().andOperator(criteriaList.toArray(new Criteria[0])));
        }

        long total = mongoTemplate.count(query, com.example.graduationproject.entity.Order.class);
        query.with(pageable);
        List<com.example.graduationproject.entity.Order> list = mongoTemplate.find(query, com.example.graduationproject.entity.Order.class);
        return new org.springframework.data.domain.PageImpl<>(list, pageable, total);
    }

    @Override
    public org.springframework.data.domain.Page<com.example.graduationproject.entity.Order> searchPosOrdersCustom(String keyword, org.springframework.data.domain.Pageable pageable) {
        org.springframework.data.mongodb.core.query.Query payQuery = new org.springframework.data.mongodb.core.query.Query(
                org.springframework.data.mongodb.core.query.Criteria.where("provider").is("POS")
        );
        java.util.List<String> orderIds = mongoTemplate.find(payQuery, com.example.graduationproject.entity.Payment.class).stream()
                .map(p -> p.getOrder() != null ? p.getOrder().getId() : null)
                .filter(java.util.Objects::nonNull)
                .toList();

        org.springframework.data.mongodb.core.query.Query query = new org.springframework.data.mongodb.core.query.Query();
        org.springframework.data.mongodb.core.query.Criteria criteria = org.springframework.data.mongodb.core.query.Criteria.where("id").in(orderIds);

        if (keyword != null && !keyword.isBlank()) {
            criteria.and("orderCode").regex(keyword, "i");
        }

        query.addCriteria(criteria);

        long total = mongoTemplate.count(query, com.example.graduationproject.entity.Order.class);
        query.with(pageable);
        java.util.List<com.example.graduationproject.entity.Order> list = mongoTemplate.find(query, com.example.graduationproject.entity.Order.class);
        return new org.springframework.data.domain.PageImpl<>(list, pageable, total);
    }
}
