package com.example.graduationproject.payment.repository;

import com.example.graduationproject.entity.Coupon;
import com.example.graduationproject.entity.enums.CouponStatus;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Pattern;

public class CouponRepositoryImpl implements CouponRepositoryCustom {

    @Autowired
    private MongoTemplate mongoTemplate;

    @Override
    public Page<Coupon> searchAdminCoupons(String keyword, CouponStatus status, Pageable pageable) {
        Query query = new Query();
        List<Criteria> criteriaList = new ArrayList<>();

        if (keyword != null && !keyword.isBlank()) {
            Pattern keywordPattern = Pattern.compile(Pattern.quote(keyword.trim()), Pattern.CASE_INSENSITIVE);
            criteriaList.add(new Criteria().orOperator(
                    Criteria.where("code").regex(keywordPattern),
                    Criteria.where("description").regex(keywordPattern)
            ));
        }
        if (status != null) {
            criteriaList.add(Criteria.where("status").is(status.name()));
        }
        if (!criteriaList.isEmpty()) {
            query.addCriteria(new Criteria().andOperator(criteriaList.toArray(new Criteria[0])));
        }

        long total = mongoTemplate.count(query, Coupon.class);
        query.with(pageable);
        return new PageImpl<>(mongoTemplate.find(query, Coupon.class), pageable, total);
    }
}
