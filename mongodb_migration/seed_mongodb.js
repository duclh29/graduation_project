// MongoDB Migration Seed Script for shoe_store
// Run using: mongosh "mongodb://localhost:27017/shoe_store" seed_mongodb.js

db = db.getSiblingDB('shoe_store');

// Clear existing collections
const collections = [
  'brands', 'categories', 'sizes', 'roles', 'users', 'coupons', 'products', 'variants', 'promotions',
  'addresses', 'shifts', 'work_schedules', 'attendance_records', 'open_shifts', 'carts', 'cart_items',
  'orders', 'order_items', 'order_status_histories', 'payments', 'pos_payment_allocations', 'shippings',
  'cashier_sessions', 'pos_return_exchange_logs', 'saved_coupons', 'schedule_swap_requests', 'schedule_change_logs',
  'blacklisted_tokens', 'refresh_tokens', 'coupon_usages', 'coupon_users', 'saved_coupons'
];
collections.forEach(c => {
    db.getCollection(c).drop();
    print("Dropped collection: " + c);
});

print("Inserting Roles...");
db.roles.insertMany([
  {
    "_id": "60b9b3e1f0e4b85c1c8a00000001",
    "createdAt": ISODate("2026-05-22T08:14:59.461Z"),
    "updatedAt": ISODate("2026-05-22T08:14:59.461Z"),
    "description": "System Role: ADMIN",
    "name": "ADMIN"
  },
  {
    "_id": "60b9b3e1f0e4b85c1c8a00000002",
    "createdAt": ISODate("2026-05-22T08:14:59.504Z"),
    "updatedAt": ISODate("2026-05-22T08:14:59.504Z"),
    "description": "System Role: STAFF",
    "name": "STAFF"
  },
  {
    "_id": "60b9b3e1f0e4b85c1c8a00000003",
    "createdAt": ISODate("2026-05-22T08:14:59.510Z"),
    "updatedAt": ISODate("2026-05-22T08:14:59.510Z"),
    "description": "System Role: CUSTOMER",
    "name": "CUSTOMER"
  }
]);

print("Inserting Users...");
db.users.insertMany([
  {
    "_id": "60b9b3e1f0e4b85c1c8b00000001",
    "createdAt": ISODate("2026-05-22T08:14:59.633Z"),
    "updatedAt": ISODate("2026-05-22T08:14:59.633Z"),
    "avatarUrl": null,
    "email": "admin@admin.com",
    "fullName": "System Admin",
    "password": "$2a$10$GjEr7RKZEu.6CTwWoxYAhukOHkGy0RQWun8iZg4cKMislQ1ROV8ya",
    "phoneNumber": 123456789,
    "status": "ACTIVE",
    "roles": [
      {
        "$ref": "roles",
        "$id": "60b9b3e1f0e4b85c1c8a00000001"
      }
    ]
  },
  {
    "_id": "60b9b3e1f0e4b85c1c8b00000002",
    "createdAt": ISODate("2026-05-22T08:14:59.745Z"),
    "updatedAt": ISODate("2026-05-22T08:14:59.745Z"),
    "avatarUrl": "https://api.dicebear.com/8.x/initials/svg?seed=Nguyen%20Van%20An",
    "email": "staff.an@local.com",
    "fullName": "Nguyen Van An",
    "password": "$2a$10$Fh1GIyM7XS38jPhBvTmHaO90j.QyHOrGMnPWbq0O9BtQQWhEOq/ha",
    "phoneNumber": 901000001,
    "status": "ACTIVE",
    "roles": [
      {
        "$ref": "roles",
        "$id": "60b9b3e1f0e4b85c1c8a00000002"
      }
    ]
  },
  {
    "_id": "60b9b3e1f0e4b85c1c8b00000003",
    "createdAt": ISODate("2026-05-22T08:14:59.847Z"),
    "updatedAt": ISODate("2026-05-22T08:14:59.847Z"),
    "avatarUrl": "https://api.dicebear.com/8.x/initials/svg?seed=Tran%20Thi%20Binh",
    "email": "staff.binh@local.com",
    "fullName": "Tran Thi Binh",
    "password": "$2a$10$dYYZaAivru2HJPg12UHeJ.5msQ/x1UNuHyJCW.gSQMor40WKLfMaS",
    "phoneNumber": 901000002,
    "status": "ACTIVE",
    "roles": [
      {
        "$ref": "roles",
        "$id": "60b9b3e1f0e4b85c1c8a00000002"
      }
    ]
  }
]);

print("Inserting Brands...");
db.brands.insertMany([
  {
    "_id": "60b9b3e1f0e4b85c1c8c00000002",
    "name": "Adidas"
  },
  {
    "_id": "60b9b3e1f0e4b85c1c8c00000005",
    "name": "FILA"
  },
  {
    "_id": "60b9b3e1f0e4b85c1c8c00000007",
    "name": "Jeep"
  },
  {
    "_id": "60b9b3e1f0e4b85c1c8c00000003",
    "name": "MLB"
  },
  {
    "_id": "60b9b3e1f0e4b85c1c8c00000006",
    "name": "New Balance"
  },
  {
    "_id": "60b9b3e1f0e4b85c1c8c00000001",
    "name": "Nike"
  },
  {
    "_id": "60b9b3e1f0e4b85c1c8c00000004",
    "name": "Puma"
  }
]);

print("Inserting Categories...");
db.categories.insertMany([
  {
    "_id": "60b9b3e1f0e4b85c1c8d00000003",
    "name": "Basketball"
  },
  {
    "_id": "60b9b3e1f0e4b85c1c8d00000004",
    "name": "Lifestyle"
  },
  {
    "_id": "60b9b3e1f0e4b85c1c8d00000002",
    "name": "Running"
  },
  {
    "_id": "60b9b3e1f0e4b85c1c8d00000005",
    "name": "Slip-on"
  },
  {
    "_id": "60b9b3e1f0e4b85c1c8d00000001",
    "name": "Sneakers"
  }
]);

print("Inserting Sizes...");
db.sizes.insertMany([
  {
    "_id": "60b9b3e1f0e4b85c1c8e00000001",
    "name": 35
  },
  {
    "_id": "60b9b3e1f0e4b85c1c8e00000002",
    "name": 36
  },
  {
    "_id": "60b9b3e1f0e4b85c1c8e00000003",
    "name": 37
  },
  {
    "_id": "60b9b3e1f0e4b85c1c8e00000004",
    "name": 38
  },
  {
    "_id": "60b9b3e1f0e4b85c1c8e00000005",
    "name": 39
  },
  {
    "_id": "60b9b3e1f0e4b85c1c8e00000006",
    "name": 40
  },
  {
    "_id": "60b9b3e1f0e4b85c1c8e00000007",
    "name": 41
  },
  {
    "_id": "60b9b3e1f0e4b85c1c8e00000008",
    "name": 42
  },
  {
    "_id": "60b9b3e1f0e4b85c1c8e00000009",
    "name": 43
  }
]);

print("Inserting Coupons...");
db.coupons.insertMany([
  {
    "_id": "60b9b3e1f0e4b85c1c8f00000001",
    "createdAt": ISODate("2026-05-22T08:15:00.045Z"),
    "updatedAt": ISODate("2026-05-22T08:15:00.045Z"),
    "code": "GIAM50K",
    "description": "Gi?m 50K cho ??n h?ng t? 500K",
    "discountValue": 50000,
    "endAt": ISODate("2026-06-22T08:15:00.044Z"),
    "maxDiscountValue": null,
    "minimumOrderAmount": 500000,
    "startAt": ISODate("2026-05-21T08:15:00.044Z"),
    "status": "ACTIVE",
    "type": "FIXED_AMOUNT",
    "usageLimit": 100,
    "usedCount": 0
  },
  {
    "_id": "60b9b3e1f0e4b85c1c8f00000002",
    "createdAt": ISODate("2026-05-22T08:15:00.050Z"),
    "updatedAt": ISODate("2026-05-22T08:15:00.050Z"),
    "code": "GIAM10PT",
    "description": "Giảm 10% tối đa 100K",
    "discountValue": 10,
    "endAt": ISODate("2026-06-22T08:15:00.050Z"),
    "maxDiscountValue": 100000,
    "minimumOrderAmount": 0,
    "startAt": ISODate("2026-05-21T08:15:00.050Z"),
    "status": "ACTIVE",
    "type": "PERCENTAGE",
    "usageLimit": 200,
    "usedCount": 0
  },
  {
    "_id": "60b9b3e1f0e4b85c1c8f00000003",
    "createdAt": ISODate("2026-05-22T08:15:00.054Z"),
    "updatedAt": ISODate("2026-05-22T08:15:00.054Z"),
    "code": "FREESHIP",
    "description": "Miễn phí vận chuyển",
    "discountValue": 30000,
    "endAt": ISODate("2026-06-22T08:15:00.053Z"),
    "maxDiscountValue": null,
    "minimumOrderAmount": 1000000,
    "startAt": ISODate("2026-05-21T08:15:00.053Z"),
    "status": "ACTIVE",
    "type": "FREE_SHIPPING",
    "usageLimit": 50,
    "usedCount": 0
  }
]);

print("Inserting Products...");
db.products.insertMany([
  {
    "_id": "60b9b3e1f0e4b85c1c9000000001",
    "createdAt": ISODate("2026-05-22T08:15:00.076Z"),
    "updatedAt": ISODate("2026-05-22T08:15:00.076Z"),
    "basePrice": 1050000,
    "description": "Giày FILA chính hãng chất lượng cao. Thiết kế hiện đại, trẻ trung, phù hợp với mọi hoạt động thể thao và đi chơi.",
    "imageUrl": null,
    "name": "FILA Elite Series 1",
    "sizes": "39,40,41",
    "slug": "elite-series-1-1779437700073",
    "status": "ACTIVE",
    "totalQuantity": 30,
    "brand": {
      "$ref": "brands",
      "$id": "60b9b3e1f0e4b85c1c8c00000005"
    },
    "category": {
      "$ref": "categories",
      "$id": "60b9b3e1f0e4b85c1c8d00000004"
    }
  },
  {
    "_id": "60b9b3e1f0e4b85c1c9000000002",
    "createdAt": ISODate("2026-05-22T08:15:00.085Z"),
    "updatedAt": ISODate("2026-05-22T08:15:00.085Z"),
    "basePrice": 1100000,
    "description": "Giày Jeep chính hãng chất lượng cao. Thiết kế hiện đại, trẻ trung, phù hợp với mọi hoạt động thể thao và đi chơi.",
    "imageUrl": null,
    "name": "Jeep Elite Series 2",
    "sizes": "39,40,41",
    "slug": "elite-series-2-1779437700085",
    "status": "ACTIVE",
    "totalQuantity": 30,
    "brand": {
      "$ref": "brands",
      "$id": "60b9b3e1f0e4b85c1c8c00000007"
    },
    "category": {
      "$ref": "categories",
      "$id": "60b9b3e1f0e4b85c1c8d00000002"
    }
  },
  {
    "_id": "60b9b3e1f0e4b85c1c9000000003",
    "createdAt": ISODate("2026-05-22T08:15:00.097Z"),
    "updatedAt": ISODate("2026-05-22T08:15:00.097Z"),
    "basePrice": 1150000,
    "description": "Giày MLB chính hãng chất lượng cao. Thiết kế hiện đại, trẻ trung, phù hợp với mọi hoạt động thể thao và đi chơi.",
    "imageUrl": null,
    "name": "MLB Elite Series 3",
    "sizes": "39,40,41",
    "slug": "elite-series-3-1779437700095",
    "status": "ACTIVE",
    "totalQuantity": 30,
    "brand": {
      "$ref": "brands",
      "$id": "60b9b3e1f0e4b85c1c8c00000003"
    },
    "category": {
      "$ref": "categories",
      "$id": "60b9b3e1f0e4b85c1c8d00000005"
    }
  },
  {
    "_id": "60b9b3e1f0e4b85c1c9000000004",
    "createdAt": ISODate("2026-05-22T08:15:00.107Z"),
    "updatedAt": ISODate("2026-05-22T08:15:00.107Z"),
    "basePrice": 1200000,
    "description": "Giày New Balance chính hãng chất lượng cao. Thiết kế hiện đại, trẻ trung, phù hợp với mọi hoạt động thể thao và đi chơi.",
    "imageUrl": null,
    "name": "New Balance Elite Series 4",
    "sizes": "39,40,41",
    "slug": "elite-series-4-1779437700106",
    "status": "ACTIVE",
    "totalQuantity": 30,
    "brand": {
      "$ref": "brands",
      "$id": "60b9b3e1f0e4b85c1c8c00000006"
    },
    "category": {
      "$ref": "categories",
      "$id": "60b9b3e1f0e4b85c1c8d00000001"
    }
  },
  {
    "_id": "60b9b3e1f0e4b85c1c9000000005",
    "createdAt": ISODate("2026-05-22T08:15:00.118Z"),
    "updatedAt": ISODate("2026-05-22T08:15:00.118Z"),
    "basePrice": 1250000,
    "description": "Giày Nike chính hãng chất lượng cao. Thiết kế hiện đại, trẻ trung, phù hợp với mọi hoạt động thể thao và đi chơi.",
    "imageUrl": null,
    "name": "Nike Elite Series 5",
    "sizes": "39,40,41",
    "slug": "elite-series-5-1779437700117",
    "status": "ACTIVE",
    "totalQuantity": 30,
    "brand": {
      "$ref": "brands",
      "$id": "60b9b3e1f0e4b85c1c8c00000001"
    },
    "category": {
      "$ref": "categories",
      "$id": "60b9b3e1f0e4b85c1c8d00000003"
    }
  },
  {
    "_id": "60b9b3e1f0e4b85c1c9000000006",
    "createdAt": ISODate("2026-05-22T08:15:00.130Z"),
    "updatedAt": ISODate("2026-05-22T08:15:00.130Z"),
    "basePrice": 1300000,
    "description": "Giày Puma chính hãng chất lượng cao. Thiết kế hiện đại, trẻ trung, phù hợp với mọi hoạt động thể thao và đi chơi.",
    "imageUrl": null,
    "name": "Puma Elite Series 6",
    "sizes": "39,40,41",
    "slug": "elite-series-6-1779437700130",
    "status": "ACTIVE",
    "totalQuantity": 30,
    "brand": {
      "$ref": "brands",
      "$id": "60b9b3e1f0e4b85c1c8c00000004"
    },
    "category": {
      "$ref": "categories",
      "$id": "60b9b3e1f0e4b85c1c8d00000004"
    }
  },
  {
    "_id": "60b9b3e1f0e4b85c1c9000000007",
    "createdAt": ISODate("2026-05-22T08:15:00.140Z"),
    "updatedAt": ISODate("2026-05-22T08:15:00.140Z"),
    "basePrice": 1350000,
    "description": "Giày Adidas chính hãng chất lượng cao. Thiết kế hiện đại, trẻ trung, phù hợp với mọi hoạt động thể thao và đi chơi.",
    "imageUrl": null,
    "name": "Adidas Elite Series 7",
    "sizes": "39,40,41",
    "slug": "elite-series-7-1779437700139",
    "status": "ACTIVE",
    "totalQuantity": 30,
    "brand": {
      "$ref": "brands",
      "$id": "60b9b3e1f0e4b85c1c8c00000002"
    },
    "category": {
      "$ref": "categories",
      "$id": "60b9b3e1f0e4b85c1c8d00000002"
    }
  },
  {
    "_id": "60b9b3e1f0e4b85c1c9000000008",
    "createdAt": ISODate("2026-05-22T08:15:00.154Z"),
    "updatedAt": ISODate("2026-05-22T08:15:00.154Z"),
    "basePrice": 1400000,
    "description": "Giày FILA chính hãng chất lượng cao. Thiết kế hiện đại, trẻ trung, phù hợp với mọi hoạt động thể thao và đi chơi.",
    "imageUrl": null,
    "name": "FILA Elite Series 8",
    "sizes": "39,40,41",
    "slug": "elite-series-8-1779437700153",
    "status": "ACTIVE",
    "totalQuantity": 30,
    "brand": {
      "$ref": "brands",
      "$id": "60b9b3e1f0e4b85c1c8c00000005"
    },
    "category": {
      "$ref": "categories",
      "$id": "60b9b3e1f0e4b85c1c8d00000005"
    }
  },
  {
    "_id": "60b9b3e1f0e4b85c1c9000000009",
    "createdAt": ISODate("2026-05-22T08:15:00.164Z"),
    "updatedAt": ISODate("2026-05-22T08:15:00.164Z"),
    "basePrice": 1450000,
    "description": "Giày Jeep chính hãng chất lượng cao. Thiết kế hiện đại, trẻ trung, phù hợp với mọi hoạt động thể thao và đi chơi.",
    "imageUrl": null,
    "name": "Jeep Elite Series 9",
    "sizes": "39,40,41",
    "slug": "elite-series-9-1779437700164",
    "status": "ACTIVE",
    "totalQuantity": 30,
    "brand": {
      "$ref": "brands",
      "$id": "60b9b3e1f0e4b85c1c8c00000007"
    },
    "category": {
      "$ref": "categories",
      "$id": "60b9b3e1f0e4b85c1c8d00000001"
    }
  },
  {
    "_id": "60b9b3e1f0e4b85c1c900000000a",
    "createdAt": ISODate("2026-05-22T08:15:00.174Z"),
    "updatedAt": ISODate("2026-05-22T08:15:00.174Z"),
    "basePrice": 1500000,
    "description": "Giày MLB chính hãng chất lượng cao. Thiết kế hiện đại, trẻ trung, phù hợp với mọi hoạt động thể thao và đi chơi.",
    "imageUrl": null,
    "name": "MLB Elite Series 10",
    "sizes": "39,40,41",
    "slug": "elite-series-10-1779437700173",
    "status": "ACTIVE",
    "totalQuantity": 30,
    "brand": {
      "$ref": "brands",
      "$id": "60b9b3e1f0e4b85c1c8c00000003"
    },
    "category": {
      "$ref": "categories",
      "$id": "60b9b3e1f0e4b85c1c8d00000003"
    }
  },
  {
    "_id": "60b9b3e1f0e4b85c1c900000000b",
    "createdAt": ISODate("2026-05-22T08:15:00.184Z"),
    "updatedAt": ISODate("2026-05-22T08:15:00.184Z"),
    "basePrice": 1550000,
    "description": "Giày New Balance chính hãng chất lượng cao. Thiết kế hiện đại, trẻ trung, phù hợp với mọi hoạt động thể thao và đi chơi.",
    "imageUrl": null,
    "name": "New Balance Elite Series 11",
    "sizes": "39,40,41",
    "slug": "elite-series-11-1779437700183",
    "status": "ACTIVE",
    "totalQuantity": 30,
    "brand": {
      "$ref": "brands",
      "$id": "60b9b3e1f0e4b85c1c8c00000006"
    },
    "category": {
      "$ref": "categories",
      "$id": "60b9b3e1f0e4b85c1c8d00000004"
    }
  },
  {
    "_id": "60b9b3e1f0e4b85c1c900000000c",
    "createdAt": ISODate("2026-05-22T08:15:00.194Z"),
    "updatedAt": ISODate("2026-05-22T08:15:00.194Z"),
    "basePrice": 1600000,
    "description": "Giày Nike chính hãng chất lượng cao. Thiết kế hiện đại, trẻ trung, phù hợp với mọi hoạt động thể thao và đi chơi.",
    "imageUrl": null,
    "name": "Nike Elite Series 12",
    "sizes": "39,40,41",
    "slug": "elite-series-12-1779437700194",
    "status": "ACTIVE",
    "totalQuantity": 30,
    "brand": {
      "$ref": "brands",
      "$id": "60b9b3e1f0e4b85c1c8c00000001"
    },
    "category": {
      "$ref": "categories",
      "$id": "60b9b3e1f0e4b85c1c8d00000002"
    }
  },
  {
    "_id": "60b9b3e1f0e4b85c1c900000000d",
    "createdAt": ISODate("2026-05-22T08:15:00.201Z"),
    "updatedAt": ISODate("2026-05-22T08:15:00.201Z"),
    "basePrice": 1650000,
    "description": "Giày Puma chính hãng chất lượng cao. Thiết kế hiện đại, trẻ trung, phù hợp với mọi hoạt động thể thao và đi chơi.",
    "imageUrl": null,
    "name": "Puma Elite Series 13",
    "sizes": "39,40,41",
    "slug": "elite-series-13-1779437700201",
    "status": "ACTIVE",
    "totalQuantity": 30,
    "brand": {
      "$ref": "brands",
      "$id": "60b9b3e1f0e4b85c1c8c00000004"
    },
    "category": {
      "$ref": "categories",
      "$id": "60b9b3e1f0e4b85c1c8d00000005"
    }
  },
  {
    "_id": "60b9b3e1f0e4b85c1c900000000e",
    "createdAt": ISODate("2026-05-22T08:15:00.212Z"),
    "updatedAt": ISODate("2026-05-22T08:15:00.212Z"),
    "basePrice": 1700000,
    "description": "Giày Adidas chính hãng chất lượng cao. Thiết kế hiện đại, trẻ trung, phù hợp với mọi hoạt động thể thao và đi chơi.",
    "imageUrl": null,
    "name": "Adidas Elite Series 14",
    "sizes": "39,40,41",
    "slug": "elite-series-14-1779437700211",
    "status": "ACTIVE",
    "totalQuantity": 30,
    "brand": {
      "$ref": "brands",
      "$id": "60b9b3e1f0e4b85c1c8c00000002"
    },
    "category": {
      "$ref": "categories",
      "$id": "60b9b3e1f0e4b85c1c8d00000001"
    }
  },
  {
    "_id": "60b9b3e1f0e4b85c1c900000000f",
    "createdAt": ISODate("2026-05-22T08:15:00.219Z"),
    "updatedAt": ISODate("2026-05-22T08:15:00.219Z"),
    "basePrice": 1750000,
    "description": "Giày FILA chính hãng chất lượng cao. Thiết kế hiện đại, trẻ trung, phù hợp với mọi hoạt động thể thao và đi chơi.",
    "imageUrl": null,
    "name": "FILA Elite Series 15",
    "sizes": "39,40,41",
    "slug": "elite-series-15-1779437700219",
    "status": "ACTIVE",
    "totalQuantity": 30,
    "brand": {
      "$ref": "brands",
      "$id": "60b9b3e1f0e4b85c1c8c00000005"
    },
    "category": {
      "$ref": "categories",
      "$id": "60b9b3e1f0e4b85c1c8d00000003"
    }
  },
  {
    "_id": "60b9b3e1f0e4b85c1c9000000010",
    "createdAt": ISODate("2026-05-22T08:15:00.228Z"),
    "updatedAt": ISODate("2026-05-22T08:15:00.228Z"),
    "basePrice": 1800000,
    "description": "Giày Jeep chính hãng chất lượng cao. Thiết kế hiện đại, trẻ trung, phù hợp với mọi hoạt động thể thao và đi chơi.",
    "imageUrl": null,
    "name": "Jeep Elite Series 16",
    "sizes": "39,40,41",
    "slug": "elite-series-16-1779437700228",
    "status": "ACTIVE",
    "totalQuantity": 30,
    "brand": {
      "$ref": "brands",
      "$id": "60b9b3e1f0e4b85c1c8c00000007"
    },
    "category": {
      "$ref": "categories",
      "$id": "60b9b3e1f0e4b85c1c8d00000004"
    }
  },
  {
    "_id": "60b9b3e1f0e4b85c1c9000000011",
    "createdAt": ISODate("2026-05-22T08:15:00.234Z"),
    "updatedAt": ISODate("2026-05-22T08:15:00.234Z"),
    "basePrice": 1850000,
    "description": "Giày MLB chính hãng chất lượng cao. Thiết kế hiện đại, trẻ trung, phù hợp với mọi hoạt động thể thao và đi chơi.",
    "imageUrl": null,
    "name": "MLB Elite Series 17",
    "sizes": "39,40,41",
    "slug": "elite-series-17-1779437700233",
    "status": "ACTIVE",
    "totalQuantity": 30,
    "brand": {
      "$ref": "brands",
      "$id": "60b9b3e1f0e4b85c1c8c00000003"
    },
    "category": {
      "$ref": "categories",
      "$id": "60b9b3e1f0e4b85c1c8d00000002"
    }
  },
  {
    "_id": "60b9b3e1f0e4b85c1c9000000012",
    "createdAt": ISODate("2026-05-22T08:15:00.243Z"),
    "updatedAt": ISODate("2026-05-22T08:15:00.243Z"),
    "basePrice": 1900000,
    "description": "Giày New Balance chính hãng chất lượng cao. Thiết kế hiện đại, trẻ trung, phù hợp với mọi hoạt động thể thao và đi chơi.",
    "imageUrl": null,
    "name": "New Balance Elite Series 18",
    "sizes": "39,40,41",
    "slug": "elite-series-18-1779437700243",
    "status": "ACTIVE",
    "totalQuantity": 30,
    "brand": {
      "$ref": "brands",
      "$id": "60b9b3e1f0e4b85c1c8c00000006"
    },
    "category": {
      "$ref": "categories",
      "$id": "60b9b3e1f0e4b85c1c8d00000005"
    }
  },
  {
    "_id": "60b9b3e1f0e4b85c1c9000000013",
    "createdAt": ISODate("2026-05-22T08:15:00.251Z"),
    "updatedAt": ISODate("2026-05-22T08:15:00.251Z"),
    "basePrice": 1950000,
    "description": "Giày Nike chính hãng chất lượng cao. Thiết kế hiện đại, trẻ trung, phù hợp với mọi hoạt động thể thao và đi chơi.",
    "imageUrl": null,
    "name": "Nike Elite Series 19",
    "sizes": "39,40,41",
    "slug": "elite-series-19-1779437700251",
    "status": "ACTIVE",
    "totalQuantity": 30,
    "brand": {
      "$ref": "brands",
      "$id": "60b9b3e1f0e4b85c1c8c00000001"
    },
    "category": {
      "$ref": "categories",
      "$id": "60b9b3e1f0e4b85c1c8d00000001"
    }
  },
  {
    "_id": "60b9b3e1f0e4b85c1c9000000014",
    "createdAt": ISODate("2026-05-22T08:15:00.263Z"),
    "updatedAt": ISODate("2026-05-22T08:15:00.263Z"),
    "basePrice": 2000000,
    "description": "Giày Puma chính hãng chất lượng cao. Thiết kế hiện đại, trẻ trung, phù hợp với mọi hoạt động thể thao và đi chơi.",
    "imageUrl": null,
    "name": "Puma Elite Series 20",
    "sizes": "39,40,41",
    "slug": "elite-series-20-1779437700262",
    "status": "ACTIVE",
    "totalQuantity": 30,
    "brand": {
      "$ref": "brands",
      "$id": "60b9b3e1f0e4b85c1c8c00000004"
    },
    "category": {
      "$ref": "categories",
      "$id": "60b9b3e1f0e4b85c1c8d00000003"
    }
  },
  {
    "_id": "60b9b3e1f0e4b85c1c9000000015",
    "createdAt": ISODate("2026-05-22T08:15:00.275Z"),
    "updatedAt": ISODate("2026-05-22T08:15:00.275Z"),
    "basePrice": 2050000,
    "description": "Giày Adidas chính hãng chất lượng cao. Thiết kế hiện đại, trẻ trung, phù hợp với mọi hoạt động thể thao và đi chơi.",
    "imageUrl": null,
    "name": "Adidas Elite Series 21",
    "sizes": "39,40,41",
    "slug": "elite-series-21-1779437700272",
    "status": "ACTIVE",
    "totalQuantity": 30,
    "brand": {
      "$ref": "brands",
      "$id": "60b9b3e1f0e4b85c1c8c00000002"
    },
    "category": {
      "$ref": "categories",
      "$id": "60b9b3e1f0e4b85c1c8d00000004"
    }
  },
  {
    "_id": "60b9b3e1f0e4b85c1c9000000016",
    "createdAt": ISODate("2026-05-22T08:15:00.286Z"),
    "updatedAt": ISODate("2026-05-22T08:15:00.286Z"),
    "basePrice": 2100000,
    "description": "Giày FILA chính hãng chất lượng cao. Thiết kế hiện đại, trẻ trung, phù hợp với mọi hoạt động thể thao và đi chơi.",
    "imageUrl": null,
    "name": "FILA Elite Series 22",
    "sizes": "39,40,41",
    "slug": "elite-series-22-1779437700285",
    "status": "ACTIVE",
    "totalQuantity": 30,
    "brand": {
      "$ref": "brands",
      "$id": "60b9b3e1f0e4b85c1c8c00000005"
    },
    "category": {
      "$ref": "categories",
      "$id": "60b9b3e1f0e4b85c1c8d00000002"
    }
  },
  {
    "_id": "60b9b3e1f0e4b85c1c9000000017",
    "createdAt": ISODate("2026-05-22T08:15:00.298Z"),
    "updatedAt": ISODate("2026-05-22T08:15:00.298Z"),
    "basePrice": 2150000,
    "description": "Giày Jeep chính hãng chất lượng cao. Thiết kế hiện đại, trẻ trung, phù hợp với mọi hoạt động thể thao và đi chơi.",
    "imageUrl": null,
    "name": "Jeep Elite Series 23",
    "sizes": "39,40,41",
    "slug": "elite-series-23-1779437700297",
    "status": "ACTIVE",
    "totalQuantity": 30,
    "brand": {
      "$ref": "brands",
      "$id": "60b9b3e1f0e4b85c1c8c00000007"
    },
    "category": {
      "$ref": "categories",
      "$id": "60b9b3e1f0e4b85c1c8d00000005"
    }
  },
  {
    "_id": "60b9b3e1f0e4b85c1c9000000018",
    "createdAt": ISODate("2026-05-22T08:15:00.307Z"),
    "updatedAt": ISODate("2026-05-22T08:15:00.307Z"),
    "basePrice": 2200000,
    "description": "Giày MLB chính hãng chất lượng cao. Thiết kế hiện đại, trẻ trung, phù hợp với mọi hoạt động thể thao và đi chơi.",
    "imageUrl": null,
    "name": "MLB Elite Series 24",
    "sizes": "39,40,41",
    "slug": "elite-series-24-1779437700306",
    "status": "ACTIVE",
    "totalQuantity": 30,
    "brand": {
      "$ref": "brands",
      "$id": "60b9b3e1f0e4b85c1c8c00000003"
    },
    "category": {
      "$ref": "categories",
      "$id": "60b9b3e1f0e4b85c1c8d00000001"
    }
  },
  {
    "_id": "60b9b3e1f0e4b85c1c9000000019",
    "createdAt": ISODate("2026-05-22T08:15:00.317Z"),
    "updatedAt": ISODate("2026-05-22T08:15:00.317Z"),
    "basePrice": 2250000,
    "description": "Giày New Balance chính hãng chất lượng cao. Thiết kế hiện đại, trẻ trung, phù hợp với mọi hoạt động thể thao và đi chơi.",
    "imageUrl": null,
    "name": "New Balance Elite Series 25",
    "sizes": "39,40,41",
    "slug": "elite-series-25-1779437700317",
    "status": "ACTIVE",
    "totalQuantity": 30,
    "brand": {
      "$ref": "brands",
      "$id": "60b9b3e1f0e4b85c1c8c00000006"
    },
    "category": {
      "$ref": "categories",
      "$id": "60b9b3e1f0e4b85c1c8d00000003"
    }
  },
  {
    "_id": "60b9b3e1f0e4b85c1c900000001a",
    "createdAt": ISODate("2026-05-22T08:15:00.324Z"),
    "updatedAt": ISODate("2026-05-22T08:15:00.324Z"),
    "basePrice": 2300000,
    "description": "Giày Nike chính hãng chất lượng cao. Thiết kế hiện đại, trẻ trung, phù hợp với mọi hoạt động thể thao và đi chơi.",
    "imageUrl": null,
    "name": "Nike Elite Series 26",
    "sizes": "39,40,41",
    "slug": "elite-series-26-1779437700323",
    "status": "ACTIVE",
    "totalQuantity": 30,
    "brand": {
      "$ref": "brands",
      "$id": "60b9b3e1f0e4b85c1c8c00000001"
    },
    "category": {
      "$ref": "categories",
      "$id": "60b9b3e1f0e4b85c1c8d00000004"
    }
  },
  {
    "_id": "60b9b3e1f0e4b85c1c900000001b",
    "createdAt": ISODate("2026-05-22T08:15:00.332Z"),
    "updatedAt": ISODate("2026-05-22T08:15:00.332Z"),
    "basePrice": 2350000,
    "description": "Giày Puma chính hãng chất lượng cao. Thiết kế hiện đại, trẻ trung, phù hợp với mọi hoạt động thể thao và đi chơi.",
    "imageUrl": null,
    "name": "Puma Elite Series 27",
    "sizes": "39,40,41",
    "slug": "elite-series-27-1779437700331",
    "status": "ACTIVE",
    "totalQuantity": 30,
    "brand": {
      "$ref": "brands",
      "$id": "60b9b3e1f0e4b85c1c8c00000004"
    },
    "category": {
      "$ref": "categories",
      "$id": "60b9b3e1f0e4b85c1c8d00000002"
    }
  },
  {
    "_id": "60b9b3e1f0e4b85c1c900000001c",
    "createdAt": ISODate("2026-05-22T08:15:00.341Z"),
    "updatedAt": ISODate("2026-05-22T08:15:00.341Z"),
    "basePrice": 2400000,
    "description": "Giày Adidas chính hãng chất lượng cao. Thiết kế hiện đại, trẻ trung, phù hợp với mọi hoạt động thể thao và đi chơi.",
    "imageUrl": null,
    "name": "Adidas Elite Series 28",
    "sizes": "39,40,41",
    "slug": "elite-series-28-1779437700340",
    "status": "ACTIVE",
    "totalQuantity": 30,
    "brand": {
      "$ref": "brands",
      "$id": "60b9b3e1f0e4b85c1c8c00000002"
    },
    "category": {
      "$ref": "categories",
      "$id": "60b9b3e1f0e4b85c1c8d00000005"
    }
  },
  {
    "_id": "60b9b3e1f0e4b85c1c900000001d",
    "createdAt": ISODate("2026-05-22T08:15:00.349Z"),
    "updatedAt": ISODate("2026-05-22T08:15:00.349Z"),
    "basePrice": 2450000,
    "description": "Giày FILA chính hãng chất lượng cao. Thiết kế hiện đại, trẻ trung, phù hợp với mọi hoạt động thể thao và đi chơi.",
    "imageUrl": null,
    "name": "FILA Elite Series 29",
    "sizes": "39,40,41",
    "slug": "elite-series-29-1779437700348",
    "status": "ACTIVE",
    "totalQuantity": 30,
    "brand": {
      "$ref": "brands",
      "$id": "60b9b3e1f0e4b85c1c8c00000005"
    },
    "category": {
      "$ref": "categories",
      "$id": "60b9b3e1f0e4b85c1c8d00000001"
    }
  },
  {
    "_id": "60b9b3e1f0e4b85c1c900000001e",
    "createdAt": ISODate("2026-05-22T08:15:00.359Z"),
    "updatedAt": ISODate("2026-05-22T08:15:00.359Z"),
    "basePrice": 2500000,
    "description": "Giày Jeep chính hãng chất lượng cao. Thiết kế hiện đại, trẻ trung, phù hợp với mọi hoạt động thể thao và đi chơi.",
    "imageUrl": null,
    "name": "Jeep Elite Series 30",
    "sizes": "39,40,41",
    "slug": "elite-series-30-1779437700358",
    "status": "ACTIVE",
    "totalQuantity": 30,
    "brand": {
      "$ref": "brands",
      "$id": "60b9b3e1f0e4b85c1c8c00000007"
    },
    "category": {
      "$ref": "categories",
      "$id": "60b9b3e1f0e4b85c1c8d00000003"
    }
  }
]);

print("Inserting Variants...");
db.variants.insertMany([
  {
    "_id": "60b9b3e1f0e4b85c1c9100000001",
    "createdAt": ISODate("2026-05-22T08:15:00.081Z"),
    "updatedAt": ISODate("2026-05-22T08:15:00.081Z"),
    "additionalPrice": 0,
    "color": "Black/White",
    "imageUrl": "https://images.unsplash.com/photo-1608231387042-66d1773070a5?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60",
    "sku": "SKU-1-0",
    "status": "ACTIVE",
    "stockQuantity": 10,
    "product": {
      "$ref": "products",
      "$id": "60b9b3e1f0e4b85c1c9000000001"
    },
    "size": {
      "$ref": "sizes",
      "$id": "60b9b3e1f0e4b85c1c8e00000002"
    }
  },
  {
    "_id": "60b9b3e1f0e4b85c1c9100000002",
    "createdAt": ISODate("2026-05-22T08:15:00.091Z"),
    "updatedAt": ISODate("2026-05-22T08:15:00.091Z"),
    "additionalPrice": 0,
    "color": "Black/White",
    "imageUrl": "https://images.unsplash.com/photo-1560769629-975ec94e6a86?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60",
    "sku": "SKU-2-0",
    "status": "ACTIVE",
    "stockQuantity": 10,
    "product": {
      "$ref": "products",
      "$id": "60b9b3e1f0e4b85c1c9000000002"
    },
    "size": {
      "$ref": "sizes",
      "$id": "60b9b3e1f0e4b85c1c8e00000003"
    }
  },
  {
    "_id": "60b9b3e1f0e4b85c1c9100000003",
    "createdAt": ISODate("2026-05-22T08:15:00.101Z"),
    "updatedAt": ISODate("2026-05-22T08:15:00.101Z"),
    "additionalPrice": 0,
    "color": "Black/White",
    "imageUrl": "https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60",
    "sku": "SKU-3-0",
    "status": "ACTIVE",
    "stockQuantity": 10,
    "product": {
      "$ref": "products",
      "$id": "60b9b3e1f0e4b85c1c9000000003"
    },
    "size": {
      "$ref": "sizes",
      "$id": "60b9b3e1f0e4b85c1c8e00000004"
    }
  },
  {
    "_id": "60b9b3e1f0e4b85c1c9100000004",
    "createdAt": ISODate("2026-05-22T08:15:00.112Z"),
    "updatedAt": ISODate("2026-05-22T08:15:00.112Z"),
    "additionalPrice": 0,
    "color": "Black/White",
    "imageUrl": "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60",
    "sku": "SKU-4-0",
    "status": "ACTIVE",
    "stockQuantity": 10,
    "product": {
      "$ref": "products",
      "$id": "60b9b3e1f0e4b85c1c9000000004"
    },
    "size": {
      "$ref": "sizes",
      "$id": "60b9b3e1f0e4b85c1c8e00000005"
    }
  },
  {
    "_id": "60b9b3e1f0e4b85c1c9100000005",
    "createdAt": ISODate("2026-05-22T08:15:00.124Z"),
    "updatedAt": ISODate("2026-05-22T08:15:00.124Z"),
    "additionalPrice": 0,
    "color": "Black/White",
    "imageUrl": "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60",
    "sku": "SKU-5-0",
    "status": "ACTIVE",
    "stockQuantity": 10,
    "product": {
      "$ref": "products",
      "$id": "60b9b3e1f0e4b85c1c9000000005"
    },
    "size": {
      "$ref": "sizes",
      "$id": "60b9b3e1f0e4b85c1c8e00000006"
    }
  },
  {
    "_id": "60b9b3e1f0e4b85c1c9100000006",
    "createdAt": ISODate("2026-05-22T08:15:00.134Z"),
    "updatedAt": ISODate("2026-05-22T08:15:00.134Z"),
    "additionalPrice": 0,
    "color": "Black/White",
    "imageUrl": "https://images.unsplash.com/photo-1605348532760-6753d2c43329?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60",
    "sku": "SKU-6-0",
    "status": "ACTIVE",
    "stockQuantity": 10,
    "product": {
      "$ref": "products",
      "$id": "60b9b3e1f0e4b85c1c9000000006"
    },
    "size": {
      "$ref": "sizes",
      "$id": "60b9b3e1f0e4b85c1c8e00000007"
    }
  },
  {
    "_id": "60b9b3e1f0e4b85c1c9100000007",
    "createdAt": ISODate("2026-05-22T08:15:00.146Z"),
    "updatedAt": ISODate("2026-05-22T08:15:00.146Z"),
    "additionalPrice": 0,
    "color": "Black/White",
    "imageUrl": "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60",
    "sku": "SKU-7-0",
    "status": "ACTIVE",
    "stockQuantity": 10,
    "product": {
      "$ref": "products",
      "$id": "60b9b3e1f0e4b85c1c9000000007"
    },
    "size": {
      "$ref": "sizes",
      "$id": "60b9b3e1f0e4b85c1c8e00000008"
    }
  },
  {
    "_id": "60b9b3e1f0e4b85c1c9100000008",
    "createdAt": ISODate("2026-05-22T08:15:00.160Z"),
    "updatedAt": ISODate("2026-05-22T08:15:00.160Z"),
    "additionalPrice": 0,
    "color": "Black/White",
    "imageUrl": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60",
    "sku": "SKU-8-0",
    "status": "ACTIVE",
    "stockQuantity": 10,
    "product": {
      "$ref": "products",
      "$id": "60b9b3e1f0e4b85c1c9000000008"
    },
    "size": {
      "$ref": "sizes",
      "$id": "60b9b3e1f0e4b85c1c8e00000009"
    }
  },
  {
    "_id": "60b9b3e1f0e4b85c1c9100000009",
    "createdAt": ISODate("2026-05-22T08:15:00.168Z"),
    "updatedAt": ISODate("2026-05-22T08:15:00.168Z"),
    "additionalPrice": 0,
    "color": "Black/White",
    "imageUrl": "https://images.unsplash.com/photo-1608231387042-66d1773070a5?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60",
    "sku": "SKU-9-0",
    "status": "ACTIVE",
    "stockQuantity": 10,
    "product": {
      "$ref": "products",
      "$id": "60b9b3e1f0e4b85c1c9000000009"
    },
    "size": {
      "$ref": "sizes",
      "$id": "60b9b3e1f0e4b85c1c8e00000001"
    }
  },
  {
    "_id": "60b9b3e1f0e4b85c1c910000000a",
    "createdAt": ISODate("2026-05-22T08:15:00.180Z"),
    "updatedAt": ISODate("2026-05-22T08:15:00.180Z"),
    "additionalPrice": 0,
    "color": "Black/White",
    "imageUrl": "https://images.unsplash.com/photo-1560769629-975ec94e6a86?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60",
    "sku": "SKU-10-0",
    "status": "ACTIVE",
    "stockQuantity": 10,
    "product": {
      "$ref": "products",
      "$id": "60b9b3e1f0e4b85c1c900000000a"
    },
    "size": {
      "$ref": "sizes",
      "$id": "60b9b3e1f0e4b85c1c8e00000002"
    }
  },
  {
    "_id": "60b9b3e1f0e4b85c1c910000000b",
    "createdAt": ISODate("2026-05-22T08:15:00.187Z"),
    "updatedAt": ISODate("2026-05-22T08:15:00.187Z"),
    "additionalPrice": 0,
    "color": "Black/White",
    "imageUrl": "https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60",
    "sku": "SKU-11-0",
    "status": "ACTIVE",
    "stockQuantity": 10,
    "product": {
      "$ref": "products",
      "$id": "60b9b3e1f0e4b85c1c900000000b"
    },
    "size": {
      "$ref": "sizes",
      "$id": "60b9b3e1f0e4b85c1c8e00000003"
    }
  },
  {
    "_id": "60b9b3e1f0e4b85c1c910000000c",
    "createdAt": ISODate("2026-05-22T08:15:00.198Z"),
    "updatedAt": ISODate("2026-05-22T08:15:00.198Z"),
    "additionalPrice": 0,
    "color": "Black/White",
    "imageUrl": "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60",
    "sku": "SKU-12-0",
    "status": "ACTIVE",
    "stockQuantity": 10,
    "product": {
      "$ref": "products",
      "$id": "60b9b3e1f0e4b85c1c900000000c"
    },
    "size": {
      "$ref": "sizes",
      "$id": "60b9b3e1f0e4b85c1c8e00000004"
    }
  },
  {
    "_id": "60b9b3e1f0e4b85c1c910000000d",
    "createdAt": ISODate("2026-05-22T08:15:00.206Z"),
    "updatedAt": ISODate("2026-05-22T08:15:00.206Z"),
    "additionalPrice": 0,
    "color": "Black/White",
    "imageUrl": "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60",
    "sku": "SKU-13-0",
    "status": "ACTIVE",
    "stockQuantity": 10,
    "product": {
      "$ref": "products",
      "$id": "60b9b3e1f0e4b85c1c900000000d"
    },
    "size": {
      "$ref": "sizes",
      "$id": "60b9b3e1f0e4b85c1c8e00000005"
    }
  },
  {
    "_id": "60b9b3e1f0e4b85c1c910000000e",
    "createdAt": ISODate("2026-05-22T08:15:00.216Z"),
    "updatedAt": ISODate("2026-05-22T08:15:00.216Z"),
    "additionalPrice": 0,
    "color": "Black/White",
    "imageUrl": "https://images.unsplash.com/photo-1605348532760-6753d2c43329?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60",
    "sku": "SKU-14-0",
    "status": "ACTIVE",
    "stockQuantity": 10,
    "product": {
      "$ref": "products",
      "$id": "60b9b3e1f0e4b85c1c900000000e"
    },
    "size": {
      "$ref": "sizes",
      "$id": "60b9b3e1f0e4b85c1c8e00000006"
    }
  },
  {
    "_id": "60b9b3e1f0e4b85c1c910000000f",
    "createdAt": ISODate("2026-05-22T08:15:00.223Z"),
    "updatedAt": ISODate("2026-05-22T08:15:00.223Z"),
    "additionalPrice": 0,
    "color": "Black/White",
    "imageUrl": "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60",
    "sku": "SKU-15-0",
    "status": "ACTIVE",
    "stockQuantity": 10,
    "product": {
      "$ref": "products",
      "$id": "60b9b3e1f0e4b85c1c900000000f"
    },
    "size": {
      "$ref": "sizes",
      "$id": "60b9b3e1f0e4b85c1c8e00000007"
    }
  },
  {
    "_id": "60b9b3e1f0e4b85c1c9100000010",
    "createdAt": ISODate("2026-05-22T08:15:00.231Z"),
    "updatedAt": ISODate("2026-05-22T08:15:00.231Z"),
    "additionalPrice": 0,
    "color": "Black/White",
    "imageUrl": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60",
    "sku": "SKU-16-0",
    "status": "ACTIVE",
    "stockQuantity": 10,
    "product": {
      "$ref": "products",
      "$id": "60b9b3e1f0e4b85c1c9000000010"
    },
    "size": {
      "$ref": "sizes",
      "$id": "60b9b3e1f0e4b85c1c8e00000008"
    }
  },
  {
    "_id": "60b9b3e1f0e4b85c1c9100000011",
    "createdAt": ISODate("2026-05-22T08:15:00.237Z"),
    "updatedAt": ISODate("2026-05-22T08:15:00.237Z"),
    "additionalPrice": 0,
    "color": "Black/White",
    "imageUrl": "https://images.unsplash.com/photo-1608231387042-66d1773070a5?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60",
    "sku": "SKU-17-0",
    "status": "ACTIVE",
    "stockQuantity": 10,
    "product": {
      "$ref": "products",
      "$id": "60b9b3e1f0e4b85c1c9000000011"
    },
    "size": {
      "$ref": "sizes",
      "$id": "60b9b3e1f0e4b85c1c8e00000009"
    }
  },
  {
    "_id": "60b9b3e1f0e4b85c1c9100000012",
    "createdAt": ISODate("2026-05-22T08:15:00.246Z"),
    "updatedAt": ISODate("2026-05-22T08:15:00.246Z"),
    "additionalPrice": 0,
    "color": "Black/White",
    "imageUrl": "https://images.unsplash.com/photo-1560769629-975ec94e6a86?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60",
    "sku": "SKU-18-0",
    "status": "ACTIVE",
    "stockQuantity": 10,
    "product": {
      "$ref": "products",
      "$id": "60b9b3e1f0e4b85c1c9000000012"
    },
    "size": {
      "$ref": "sizes",
      "$id": "60b9b3e1f0e4b85c1c8e00000001"
    }
  },
  {
    "_id": "60b9b3e1f0e4b85c1c9100000013",
    "createdAt": ISODate("2026-05-22T08:15:00.256Z"),
    "updatedAt": ISODate("2026-05-22T08:15:00.256Z"),
    "additionalPrice": 0,
    "color": "Black/White",
    "imageUrl": "https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60",
    "sku": "SKU-19-0",
    "status": "ACTIVE",
    "stockQuantity": 10,
    "product": {
      "$ref": "products",
      "$id": "60b9b3e1f0e4b85c1c9000000013"
    },
    "size": {
      "$ref": "sizes",
      "$id": "60b9b3e1f0e4b85c1c8e00000002"
    }
  },
  {
    "_id": "60b9b3e1f0e4b85c1c9100000014",
    "createdAt": ISODate("2026-05-22T08:15:00.268Z"),
    "updatedAt": ISODate("2026-05-22T08:15:00.268Z"),
    "additionalPrice": 0,
    "color": "Black/White",
    "imageUrl": "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60",
    "sku": "SKU-20-0",
    "status": "ACTIVE",
    "stockQuantity": 10,
    "product": {
      "$ref": "products",
      "$id": "60b9b3e1f0e4b85c1c9000000014"
    },
    "size": {
      "$ref": "sizes",
      "$id": "60b9b3e1f0e4b85c1c8e00000003"
    }
  },
  {
    "_id": "60b9b3e1f0e4b85c1c9100000015",
    "createdAt": ISODate("2026-05-22T08:15:00.281Z"),
    "updatedAt": ISODate("2026-05-22T08:15:00.281Z"),
    "additionalPrice": 0,
    "color": "Black/White",
    "imageUrl": "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60",
    "sku": "SKU-21-0",
    "status": "ACTIVE",
    "stockQuantity": 10,
    "product": {
      "$ref": "products",
      "$id": "60b9b3e1f0e4b85c1c9000000015"
    },
    "size": {
      "$ref": "sizes",
      "$id": "60b9b3e1f0e4b85c1c8e00000004"
    }
  },
  {
    "_id": "60b9b3e1f0e4b85c1c9100000016",
    "createdAt": ISODate("2026-05-22T08:15:00.293Z"),
    "updatedAt": ISODate("2026-05-22T08:15:00.293Z"),
    "additionalPrice": 0,
    "color": "Black/White",
    "imageUrl": "https://images.unsplash.com/photo-1605348532760-6753d2c43329?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60",
    "sku": "SKU-22-0",
    "status": "ACTIVE",
    "stockQuantity": 10,
    "product": {
      "$ref": "products",
      "$id": "60b9b3e1f0e4b85c1c9000000016"
    },
    "size": {
      "$ref": "sizes",
      "$id": "60b9b3e1f0e4b85c1c8e00000005"
    }
  },
  {
    "_id": "60b9b3e1f0e4b85c1c9100000017",
    "createdAt": ISODate("2026-05-22T08:15:00.302Z"),
    "updatedAt": ISODate("2026-05-22T08:15:00.302Z"),
    "additionalPrice": 0,
    "color": "Black/White",
    "imageUrl": "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60",
    "sku": "SKU-23-0",
    "status": "ACTIVE",
    "stockQuantity": 10,
    "product": {
      "$ref": "products",
      "$id": "60b9b3e1f0e4b85c1c9000000017"
    },
    "size": {
      "$ref": "sizes",
      "$id": "60b9b3e1f0e4b85c1c8e00000006"
    }
  },
  {
    "_id": "60b9b3e1f0e4b85c1c9100000018",
    "createdAt": ISODate("2026-05-22T08:15:00.312Z"),
    "updatedAt": ISODate("2026-05-22T08:15:00.312Z"),
    "additionalPrice": 0,
    "color": "Black/White",
    "imageUrl": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60",
    "sku": "SKU-24-0",
    "status": "ACTIVE",
    "stockQuantity": 10,
    "product": {
      "$ref": "products",
      "$id": "60b9b3e1f0e4b85c1c9000000018"
    },
    "size": {
      "$ref": "sizes",
      "$id": "60b9b3e1f0e4b85c1c8e00000007"
    }
  },
  {
    "_id": "60b9b3e1f0e4b85c1c9100000019",
    "createdAt": ISODate("2026-05-22T08:15:00.320Z"),
    "updatedAt": ISODate("2026-05-22T08:15:00.320Z"),
    "additionalPrice": 0,
    "color": "Black/White",
    "imageUrl": "https://images.unsplash.com/photo-1608231387042-66d1773070a5?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60",
    "sku": "SKU-25-0",
    "status": "ACTIVE",
    "stockQuantity": 10,
    "product": {
      "$ref": "products",
      "$id": "60b9b3e1f0e4b85c1c9000000019"
    },
    "size": {
      "$ref": "sizes",
      "$id": "60b9b3e1f0e4b85c1c8e00000008"
    }
  },
  {
    "_id": "60b9b3e1f0e4b85c1c910000001a",
    "createdAt": ISODate("2026-05-22T08:15:00.328Z"),
    "updatedAt": ISODate("2026-05-22T08:15:00.328Z"),
    "additionalPrice": 0,
    "color": "Black/White",
    "imageUrl": "https://images.unsplash.com/photo-1560769629-975ec94e6a86?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60",
    "sku": "SKU-26-0",
    "status": "ACTIVE",
    "stockQuantity": 10,
    "product": {
      "$ref": "products",
      "$id": "60b9b3e1f0e4b85c1c900000001a"
    },
    "size": {
      "$ref": "sizes",
      "$id": "60b9b3e1f0e4b85c1c8e00000009"
    }
  },
  {
    "_id": "60b9b3e1f0e4b85c1c910000001b",
    "createdAt": ISODate("2026-05-22T08:15:00.335Z"),
    "updatedAt": ISODate("2026-05-22T08:15:00.335Z"),
    "additionalPrice": 0,
    "color": "Black/White",
    "imageUrl": "https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60",
    "sku": "SKU-27-0",
    "status": "ACTIVE",
    "stockQuantity": 10,
    "product": {
      "$ref": "products",
      "$id": "60b9b3e1f0e4b85c1c900000001b"
    },
    "size": {
      "$ref": "sizes",
      "$id": "60b9b3e1f0e4b85c1c8e00000001"
    }
  },
  {
    "_id": "60b9b3e1f0e4b85c1c910000001c",
    "createdAt": ISODate("2026-05-22T08:15:00.345Z"),
    "updatedAt": ISODate("2026-05-22T08:15:00.345Z"),
    "additionalPrice": 0,
    "color": "Black/White",
    "imageUrl": "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60",
    "sku": "SKU-28-0",
    "status": "ACTIVE",
    "stockQuantity": 10,
    "product": {
      "$ref": "products",
      "$id": "60b9b3e1f0e4b85c1c900000001c"
    },
    "size": {
      "$ref": "sizes",
      "$id": "60b9b3e1f0e4b85c1c8e00000002"
    }
  },
  {
    "_id": "60b9b3e1f0e4b85c1c910000001d",
    "createdAt": ISODate("2026-05-22T08:15:00.353Z"),
    "updatedAt": ISODate("2026-05-22T08:15:00.353Z"),
    "additionalPrice": 0,
    "color": "Black/White",
    "imageUrl": "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60",
    "sku": "SKU-29-0",
    "status": "ACTIVE",
    "stockQuantity": 10,
    "product": {
      "$ref": "products",
      "$id": "60b9b3e1f0e4b85c1c900000001d"
    },
    "size": {
      "$ref": "sizes",
      "$id": "60b9b3e1f0e4b85c1c8e00000003"
    }
  },
  {
    "_id": "60b9b3e1f0e4b85c1c910000001e",
    "createdAt": ISODate("2026-05-22T08:15:00.363Z"),
    "updatedAt": ISODate("2026-05-22T08:15:00.364Z"),
    "additionalPrice": 0,
    "color": "Black/White",
    "imageUrl": "https://images.unsplash.com/photo-1605348532760-6753d2c43329?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60",
    "sku": "SKU-30-0",
    "status": "ACTIVE",
    "stockQuantity": 10,
    "product": {
      "$ref": "products",
      "$id": "60b9b3e1f0e4b85c1c900000001e"
    },
    "size": {
      "$ref": "sizes",
      "$id": "60b9b3e1f0e4b85c1c8e00000004"
    }
  }
]);

print("Inserting Promotions...");
db.promotions.insertMany([
  {
    "_id": "60b9b3e1f0e4b85c1c9200000001",
    "createdAt": ISODate("2026-05-22T08:15:00.419Z"),
    "updatedAt": ISODate("2026-05-22T08:15:00.419Z"),
    "code": "GLOBAL10",
    "description": "Ch??ng tr?nh gi?m gi? t? ??ng 10% cho t?t c? s?n ph?m tr?n h? th?ng",
    "discountValue": 10,
    "endAt": ISODate("2027-05-22T08:15:00.386Z"),
    "maxDiscountValue": null,
    "name": "Giảm 10% Toàn Bộ Sản Phẩm",
    "startAt": ISODate("2026-05-21T08:15:00.386Z"),
    "status": "ACTIVE",
    "type": "PERCENTAGE",
    "products": [
      {
        "$ref": "products",
        "$id": "60b9b3e1f0e4b85c1c9000000001"
      },
      {
        "$ref": "products",
        "$id": "60b9b3e1f0e4b85c1c9000000002"
      },
      {
        "$ref": "products",
        "$id": "60b9b3e1f0e4b85c1c9000000003"
      },
      {
        "$ref": "products",
        "$id": "60b9b3e1f0e4b85c1c9000000004"
      },
      {
        "$ref": "products",
        "$id": "60b9b3e1f0e4b85c1c9000000005"
      },
      {
        "$ref": "products",
        "$id": "60b9b3e1f0e4b85c1c9000000006"
      },
      {
        "$ref": "products",
        "$id": "60b9b3e1f0e4b85c1c9000000007"
      },
      {
        "$ref": "products",
        "$id": "60b9b3e1f0e4b85c1c9000000008"
      },
      {
        "$ref": "products",
        "$id": "60b9b3e1f0e4b85c1c9000000009"
      },
      {
        "$ref": "products",
        "$id": "60b9b3e1f0e4b85c1c900000000a"
      },
      {
        "$ref": "products",
        "$id": "60b9b3e1f0e4b85c1c900000000b"
      },
      {
        "$ref": "products",
        "$id": "60b9b3e1f0e4b85c1c900000000c"
      },
      {
        "$ref": "products",
        "$id": "60b9b3e1f0e4b85c1c900000000d"
      },
      {
        "$ref": "products",
        "$id": "60b9b3e1f0e4b85c1c900000000e"
      },
      {
        "$ref": "products",
        "$id": "60b9b3e1f0e4b85c1c900000000f"
      },
      {
        "$ref": "products",
        "$id": "60b9b3e1f0e4b85c1c9000000010"
      },
      {
        "$ref": "products",
        "$id": "60b9b3e1f0e4b85c1c9000000011"
      },
      {
        "$ref": "products",
        "$id": "60b9b3e1f0e4b85c1c9000000012"
      },
      {
        "$ref": "products",
        "$id": "60b9b3e1f0e4b85c1c9000000013"
      },
      {
        "$ref": "products",
        "$id": "60b9b3e1f0e4b85c1c9000000014"
      },
      {
        "$ref": "products",
        "$id": "60b9b3e1f0e4b85c1c9000000015"
      },
      {
        "$ref": "products",
        "$id": "60b9b3e1f0e4b85c1c9000000016"
      },
      {
        "$ref": "products",
        "$id": "60b9b3e1f0e4b85c1c9000000017"
      },
      {
        "$ref": "products",
        "$id": "60b9b3e1f0e4b85c1c9000000018"
      },
      {
        "$ref": "products",
        "$id": "60b9b3e1f0e4b85c1c9000000019"
      },
      {
        "$ref": "products",
        "$id": "60b9b3e1f0e4b85c1c900000001a"
      },
      {
        "$ref": "products",
        "$id": "60b9b3e1f0e4b85c1c900000001b"
      },
      {
        "$ref": "products",
        "$id": "60b9b3e1f0e4b85c1c900000001c"
      },
      {
        "$ref": "products",
        "$id": "60b9b3e1f0e4b85c1c900000001d"
      },
      {
        "$ref": "products",
        "$id": "60b9b3e1f0e4b85c1c900000001e"
      }
    ],
    "variants": []
  }
]);

print("Inserting Addresses...");
db.addresses.insertMany([
  {
    "_id": "60b9b3e1f0e4b85c1c9300000001",
    "createdAt": ISODate("2026-05-22T08:14:59.633Z"),
    "updatedAt": ISODate("2026-05-22T08:14:59.633Z"),
    "user": {
      "$ref": "users",
      "$id": "60b9b3e1f0e4b85c1c8b00000001"
    },
    "recipientName": "System Admin",
    "phoneNumber": "0123456789",
    "addressLine": "123 Đường Láng",
    "ward": "Láng Thượng",
    "district": "Đống Đa",
    "city": "Hà Nội",
    "country": "Việt Nam",
    "postalCode": "100000"
  },
  {
    "_id": "60b9b3e1f0e4b85c1c9300000002",
    "createdAt": ISODate("2026-05-22T08:14:59.745Z"),
    "updatedAt": ISODate("2026-05-22T08:14:59.745Z"),
    "user": {
      "$ref": "users",
      "$id": "60b9b3e1f0e4b85c1c8b00000002"
    },
    "recipientName": "Nguyen Van An",
    "phoneNumber": "0901000001",
    "addressLine": "456 Lê Lợi",
    "ward": "Bến Thành",
    "district": "Quận 1",
    "city": "TP. Hồ Chí Minh",
    "country": "Việt Nam",
    "postalCode": "700000"
  },
  {
    "_id": "60b9b3e1f0e4b85c1c9300000003",
    "createdAt": ISODate("2026-05-22T08:14:59.847Z"),
    "updatedAt": ISODate("2026-05-22T08:14:59.847Z"),
    "user": {
      "$ref": "users",
      "$id": "60b9b3e1f0e4b85c1c8b00000003"
    },
    "recipientName": "Tran Thi Binh",
    "phoneNumber": "0901000002",
    "addressLine": "789 Nguyễn Văn Linh",
    "ward": "Hưng Lợi",
    "district": "Ninh Kiều",
    "city": "Cần Thơ",
    "country": "Việt Nam",
    "postalCode": "900000"
  }
]);

print("Inserting Shifts...");
db.shifts.insertMany([
  {
    "_id": "60b9b3e1f0e4b85c1c9400000001",
    "createdAt": ISODate("2026-05-22T08:14:59.633Z"),
    "updatedAt": ISODate("2026-05-22T08:14:59.633Z"),
    "code": "SHIFT_MORNING",
    "name": "Ca Sáng",
    "startTime": "08:00:00",
    "endTime": "12:00:00",
    "crossDay": false,
    "breakMinutes": 0,
    "paidBreakMinutes": 0,
    "minStaff": 1,
    "maxStaff": 3,
    "status": "ACTIVE",
    "description": "Ca làm việc buổi sáng từ 8h đến 12h"
  },
  {
    "_id": "60b9b3e1f0e4b85c1c9400000002",
    "createdAt": ISODate("2026-05-22T08:14:59.633Z"),
    "updatedAt": ISODate("2026-05-22T08:14:59.633Z"),
    "code": "SHIFT_AFTERNOON",
    "name": "Ca Chiều",
    "startTime": "13:30:00",
    "endTime": "17:30:00",
    "crossDay": false,
    "breakMinutes": 0,
    "paidBreakMinutes": 0,
    "minStaff": 1,
    "maxStaff": 3,
    "status": "ACTIVE",
    "description": "Ca làm việc buổi chiều từ 13h30 đến 17h30"
  },
  {
    "_id": "60b9b3e1f0e4b85c1c9400000003",
    "createdAt": ISODate("2026-05-22T08:14:59.633Z"),
    "updatedAt": ISODate("2026-05-22T08:14:59.633Z"),
    "code": "SHIFT_EVENING",
    "name": "Ca Tối",
    "startTime": "18:00:00",
    "endTime": "22:00:00",
    "crossDay": false,
    "breakMinutes": 0,
    "paidBreakMinutes": 0,
    "minStaff": 1,
    "maxStaff": 2,
    "status": "ACTIVE",
    "description": "Ca làm việc buổi tối từ 18h đến 22h"
  },
  {
    "_id": "60b9b3e1f0e4b85c1c9400000004",
    "createdAt": ISODate("2026-05-22T08:14:59.633Z"),
    "updatedAt": ISODate("2026-05-22T08:14:59.633Z"),
    "code": "SHIFT_FULLDAY",
    "name": "Ca Cả Ngày",
    "startTime": "08:00:00",
    "endTime": "17:30:00",
    "crossDay": false,
    "breakMinutes": 90,
    "paidBreakMinutes": 0,
    "minStaff": 1,
    "maxStaff": 2,
    "status": "ACTIVE",
    "description": "Ca làm việc cả ngày từ 8h đến 17h30, nghỉ trưa 90 phút"
  }
]);

print("Inserting Work Schedules...");
db.work_schedules.insertMany([
  {
    "_id": "60b9b3e1f0e4b85c1c9500000001",
    "createdAt": ISODate("2026-05-27T08:00:00.000Z"),
    "updatedAt": ISODate("2026-05-27T08:00:00.000Z"),
    "user": {
      "$ref": "users",
      "$id": "60b9b3e1f0e4b85c1c8b00000002"
    },
    "shift": {
      "$ref": "shifts",
      "$id": "60b9b3e1f0e4b85c1c9400000001"
    },
    "workDate": "2026-05-28",
    "plannedStartAt": ISODate("2026-05-28T08:00:00.000Z"),
    "plannedEndAt": ISODate("2026-05-28T12:00:00.000Z"),
    "status": "PRESENT",
    "publishStatus": "PUBLISHED",
    "note": "Lịch trực sáng thứ 5",
    "publishedAt": ISODate("2026-05-27T09:00:00.000Z")
  },
  {
    "_id": "60b9b3e1f0e4b85c1c9500000002",
    "createdAt": ISODate("2026-05-27T08:00:00.000Z"),
    "updatedAt": ISODate("2026-05-27T08:00:00.000Z"),
    "user": {
      "$ref": "users",
      "$id": "60b9b3e1f0e4b85c1c8b00000002"
    },
    "shift": {
      "$ref": "shifts",
      "$id": "60b9b3e1f0e4b85c1c9400000002"
    },
    "workDate": "2026-05-28",
    "plannedStartAt": ISODate("2026-05-28T13:30:00.000Z"),
    "plannedEndAt": ISODate("2026-05-28T17:30:00.000Z"),
    "status": "PRESENT",
    "publishStatus": "PUBLISHED",
    "note": "Lịch trực chiều thứ 5",
    "publishedAt": ISODate("2026-05-27T09:00:00.000Z")
  },
  {
    "_id": "60b9b3e1f0e4b85c1c9500000003",
    "createdAt": ISODate("2026-05-27T08:00:00.000Z"),
    "updatedAt": ISODate("2026-05-27T08:00:00.000Z"),
    "user": {
      "$ref": "users",
      "$id": "60b9b3e1f0e4b85c1c8b00000003"
    },
    "shift": {
      "$ref": "shifts",
      "$id": "60b9b3e1f0e4b85c1c9400000002"
    },
    "workDate": "2026-05-28",
    "plannedStartAt": ISODate("2026-05-28T13:30:00.000Z"),
    "plannedEndAt": ISODate("2026-05-28T17:30:00.000Z"),
    "status": "PRESENT",
    "publishStatus": "PUBLISHED",
    "note": "Lịch trực chiều thứ 5 Binh",
    "publishedAt": ISODate("2026-05-27T09:00:00.000Z")
  },
  {
    "_id": "60b9b3e1f0e4b85c1c9500000004",
    "createdAt": ISODate("2026-05-27T08:00:00.000Z"),
    "updatedAt": ISODate("2026-05-27T08:00:00.000Z"),
    "user": {
      "$ref": "users",
      "$id": "60b9b3e1f0e4b85c1c8b00000002"
    },
    "shift": {
      "$ref": "shifts",
      "$id": "60b9b3e1f0e4b85c1c9400000001"
    },
    "workDate": "2026-05-29",
    "plannedStartAt": ISODate("2026-05-29T08:00:00.000Z"),
    "plannedEndAt": ISODate("2026-05-29T12:00:00.000Z"),
    "status": "PRESENT",
    "publishStatus": "PUBLISHED",
    "note": "Lịch trực sáng thứ 6",
    "publishedAt": ISODate("2026-05-27T09:00:00.000Z")
  },
  {
    "_id": "60b9b3e1f0e4b85c1c9500000005",
    "createdAt": ISODate("2026-05-27T08:00:00.000Z"),
    "updatedAt": ISODate("2026-05-27T08:00:00.000Z"),
    "user": {
      "$ref": "users",
      "$id": "60b9b3e1f0e4b85c1c8b00000003"
    },
    "shift": {
      "$ref": "shifts",
      "$id": "60b9b3e1f0e4b85c1c9400000003"
    },
    "workDate": "2026-05-29",
    "plannedStartAt": ISODate("2026-05-29T18:00:00.000Z"),
    "plannedEndAt": ISODate("2026-05-29T22:00:00.000Z"),
    "status": "PRESENT",
    "publishStatus": "PUBLISHED",
    "note": "Lịch trực tối thứ 6 Binh",
    "publishedAt": ISODate("2026-05-27T09:00:00.000Z")
  },
  {
    "_id": "60b9b3e1f0e4b85c1c9500000006",
    "createdAt": ISODate("2026-05-27T08:00:00.000Z"),
    "updatedAt": ISODate("2026-05-27T08:00:00.000Z"),
    "user": {
      "$ref": "users",
      "$id": "60b9b3e1f0e4b85c1c8b00000002"
    },
    "shift": {
      "$ref": "shifts",
      "$id": "60b9b3e1f0e4b85c1c9400000001"
    },
    "workDate": "2026-05-30",
    "plannedStartAt": ISODate("2026-05-30T08:00:00.000Z"),
    "plannedEndAt": ISODate("2026-05-30T12:00:00.000Z"),
    "status": "SCHEDULED",
    "publishStatus": "PUBLISHED",
    "note": "Lịch trực sáng thứ 7",
    "publishedAt": ISODate("2026-05-27T09:00:00.000Z")
  }
]);

print("Inserting Attendance Records...");
db.attendance_records.insertMany([
  {
    "_id": "60b9b3e1f0e4b85c1c9600000001",
    "createdAt": ISODate("2026-05-28T07:55:00.000Z"),
    "updatedAt": ISODate("2026-05-28T12:05:00.000Z"),
    "schedule": {
      "$ref": "work_schedules",
      "$id": "60b9b3e1f0e4b85c1c9500000001"
    },
    "checkInAt": ISODate("2026-05-28T07:55:00.000Z"),
    "checkOutAt": ISODate("2026-05-28T12:05:00.000Z"),
    "actualWorkMinutes": 245,
    "lateMinutes": 0,
    "earlyLeaveMinutes": 0,
    "overtimeMinutes": 5,
    "status": "PRESENT",
    "source": "SYSTEM",
    "note": "Đúng giờ và làm thêm 5 phút",
    "approvedAt": ISODate("2026-05-28T12:10:00.000Z")
  },
  {
    "_id": "60b9b3e1f0e4b85c1c9600000002",
    "createdAt": ISODate("2026-05-28T13:32:00.000Z"),
    "updatedAt": ISODate("2026-05-28T17:30:00.000Z"),
    "schedule": {
      "$ref": "work_schedules",
      "$id": "60b9b3e1f0e4b85c1c9500000002"
    },
    "checkInAt": ISODate("2026-05-28T13:32:00.000Z"),
    "checkOutAt": ISODate("2026-05-28T17:30:00.000Z"),
    "actualWorkMinutes": 238,
    "lateMinutes": 2,
    "earlyLeaveMinutes": 0,
    "overtimeMinutes": 0,
    "status": "PRESENT",
    "source": "SYSTEM",
    "note": "Trễ 2 phút do kẹt xe",
    "approvedAt": ISODate("2026-05-28T17:40:00.000Z")
  }
]);

print("Inserting Open Shifts...");
db.open_shifts.insertMany([
  {
    "_id": "60b9b3e1f0e4b85c1c9700000001",
    "createdAt": ISODate("2026-05-27T08:00:00.000Z"),
    "updatedAt": ISODate("2026-05-27T08:00:00.000Z"),
    "shift": {
      "$ref": "shifts",
      "$id": "60b9b3e1f0e4b85c1c9400000003"
    },
    "workDate": "2026-05-30",
    "plannedStartAt": ISODate("2026-05-30T18:00:00.000Z"),
    "plannedEndAt": ISODate("2026-05-30T22:00:00.000Z"),
    "status": "OPEN",
    "note": "Cần tuyển thêm 1 nhân sự trực tối thứ 7"
  },
  {
    "_id": "60b9b3e1f0e4b85c1c9700000002",
    "createdAt": ISODate("2026-05-27T08:00:00.000Z"),
    "updatedAt": ISODate("2026-05-27T08:00:00.000Z"),
    "shift": {
      "$ref": "shifts",
      "$id": "60b9b3e1f0e4b85c1c9400000002"
    },
    "workDate": "2026-05-31",
    "plannedStartAt": ISODate("2026-05-31T13:30:00.000Z"),
    "plannedEndAt": ISODate("2026-05-31T17:30:00.000Z"),
    "status": "OPEN",
    "note": "Cần tuyển thêm nhân sự trực chiều Chủ Nhật"
  }
]);

print("Inserting Carts...");
db.carts.insertMany([
  {
    "_id": "60b9b3e1f0e4b85c1c9800000001",
    "createdAt": ISODate("2026-05-29T10:00:00.000Z"),
    "updatedAt": ISODate("2026-05-29T10:05:00.000Z"),
    "status": "ACTIVE",
    "totalPrice": 3200000,
    "user": {
      "$ref": "users",
      "$id": "60b9b3e1f0e4b85c1c8b00000001"
    }
  }
]);

print("Inserting Cart Items...");
db.cart_items.insertMany([
  {
    "_id": "60b9b3e1f0e4b85c1c9900000001",
    "createdAt": ISODate("2026-05-29T10:00:00.000Z"),
    "updatedAt": ISODate("2026-05-29T10:00:00.000Z"),
    "quantity": 2,
    "unitPrice": 1050000,
    "cart": {
      "$ref": "carts",
      "$id": "60b9b3e1f0e4b85c1c9800000001"
    },
    "variant": {
      "$ref": "variants",
      "$id": "60b9b3e1f0e4b85c1c9100000001"
    }
  },
  {
    "_id": "60b9b3e1f0e4b85c1c9900000002",
    "createdAt": ISODate("2026-05-29T10:05:00.000Z"),
    "updatedAt": ISODate("2026-05-29T10:05:00.000Z"),
    "quantity": 1,
    "unitPrice": 1100000,
    "cart": {
      "$ref": "carts",
      "$id": "60b9b3e1f0e4b85c1c9800000001"
    },
    "variant": {
      "$ref": "variants",
      "$id": "60b9b3e1f0e4b85c1c9100000004"
    }
  }
]);

print("Inserting Orders...");
db.orders.insertMany([
  {
    "_id": "60b9b3e1f0e4b85c1c9a00000001",
    "createdAt": ISODate("2026-05-28T09:30:00.000Z"),
    "updatedAt": ISODate("2026-05-28T10:00:00.000Z"),
    "orderCode": "ORD-POS-001",
    "user": {
      "$ref": "users",
      "$id": "60b9b3e1f0e4b85c1c8b00000001"
    },
    "status": "DELIVERED",
    "subtotalAmount": 3200000,
    "discountAmount": 320000,
    "shippingFee": 0,
    "finalPrice": 2880000,
    "note": "Đơn hàng mua trực tiếp tại quầy POS",
    "payment": {
      "$ref": "payments",
      "$id": "60b9b3e1f0e4b85c1c9d00000001"
    }
  },
  {
    "_id": "60b9b3e1f0e4b85c1c9a00000002",
    "createdAt": ISODate("2026-05-29T08:15:00.000Z"),
    "updatedAt": ISODate("2026-05-29T08:20:00.000Z"),
    "orderCode": "ORD-OL-002",
    "user": {
      "$ref": "users",
      "$id": "60b9b3e1f0e4b85c1c8b00000003"
    },
    "status": "SHIPPING",
    "subtotalAmount": 1250000,
    "discountAmount": 125000,
    "shippingFee": 30000,
    "finalPrice": 1155000,
    "note": "Giao giờ hành chính, gọi điện trước khi giao",
    "payment": {
      "$ref": "payments",
      "$id": "60b9b3e1f0e4b85c1c9d00000002"
    },
    "shipping": {
      "$ref": "shippings",
      "$id": "60b9b3e1f0e4b85c1c9f00000001"
    }
  },
  {
    "_id": "60b9b3e1f0e4b85c1c9a00000003",
    "createdAt": ISODate("2026-05-29T14:00:00.000Z"),
    "updatedAt": ISODate("2026-05-29T14:00:00.000Z"),
    "orderCode": "ORD-OL-003",
    "user": {
      "$ref": "users",
      "$id": "60b9b3e1f0e4b85c1c8b00000002"
    },
    "status": "PENDING",
    "subtotalAmount": 1500000,
    "discountAmount": 150000,
    "shippingFee": 30000,
    "finalPrice": 1380000,
    "note": "Khách hàng mua online, thanh toán qua ngân hàng",
    "payment": {
      "$ref": "payments",
      "$id": "60b9b3e1f0e4b85c1c9d00000003"
    },
    "shipping": {
      "$ref": "shippings",
      "$id": "60b9b3e1f0e4b85c1c9f00000002"
    }
  }
]);

print("Inserting Order Items...");
db.order_items.insertMany([
  {
    "_id": "60b9b3e1f0e4b85c1c9b00000001",
    "createdAt": ISODate("2026-05-28T09:30:00.000Z"),
    "updatedAt": ISODate("2026-05-28T09:30:00.000Z"),
    "order": {
      "$ref": "orders",
      "$id": "60b9b3e1f0e4b85c1c9a00000001"
    },
    "variant": {
      "$ref": "variants",
      "$id": "60b9b3e1f0e4b85c1c9100000001"
    },
    "productName": "FILA Elite Series 1",
    "skuSnapshot": "FILA-ES1-W39",
    "sizeSnapshot": "39",
    "colorSnapshot": "Trắng",
    "quantity": 2,
    "returnedQuantity": 1,
    "requestedReturnQuantity": 0,
    "unitPrice": 1050000,
    "totalPrice": 2100000
  },
  {
    "_id": "60b9b3e1f0e4b85c1c9b00000002",
    "createdAt": ISODate("2026-05-28T09:30:00.000Z"),
    "updatedAt": ISODate("2026-05-28T09:30:00.000Z"),
    "order": {
      "$ref": "orders",
      "$id": "60b9b3e1f0e4b85c1c9a00000001"
    },
    "variant": {
      "$ref": "variants",
      "$id": "60b9b3e1f0e4b85c1c9100000004"
    },
    "productName": "Jeep Elite Series 2",
    "skuSnapshot": "JEEP-ES2-B40",
    "sizeSnapshot": "40",
    "colorSnapshot": "Đen",
    "quantity": 1,
    "returnedQuantity": 0,
    "requestedReturnQuantity": 0,
    "unitPrice": 1100000,
    "totalPrice": 1100000
  },
  {
    "_id": "60b9b3e1f0e4b85c1c9b00000003",
    "createdAt": ISODate("2026-05-29T08:15:00.000Z"),
    "updatedAt": ISODate("2026-05-29T08:15:00.000Z"),
    "order": {
      "$ref": "orders",
      "$id": "60b9b3e1f0e4b85c1c9a00000002"
    },
    "variant": {
      "$ref": "variants",
      "$id": "60b9b3e1f0e4b85c1c910000000d"
    },
    "productName": "Nike Elite Series 5",
    "skuSnapshot": "NIKE-ES5-W41",
    "sizeSnapshot": "41",
    "colorSnapshot": "Xám",
    "quantity": 1,
    "returnedQuantity": 0,
    "requestedReturnQuantity": 0,
    "unitPrice": 1250000,
    "totalPrice": 1250000
  },
  {
    "_id": "60b9b3e1f0e4b85c1c9b00000004",
    "createdAt": ISODate("2026-05-29T14:00:00.000Z"),
    "updatedAt": ISODate("2026-05-29T14:00:00.000Z"),
    "order": {
      "$ref": "orders",
      "$id": "60b9b3e1f0e4b85c1c9a00000003"
    },
    "variant": {
      "$ref": "variants",
      "$id": "60b9b3e1f0e4b85c1c910000001c"
    },
    "productName": "MLB Elite Series 10",
    "skuSnapshot": "MLB-ES10-N39",
    "sizeSnapshot": "39",
    "colorSnapshot": "Xanh Dương",
    "quantity": 1,
    "returnedQuantity": 0,
    "requestedReturnQuantity": 0,
    "unitPrice": 1500000,
    "totalPrice": 1500000
  }
]);

print("Inserting Order Status Histories...");
db.order_status_histories.insertMany([
  {
    "_id": "60b9b3e1f0e4b85c1c9c00000001",
    "createdAt": ISODate("2026-05-28T09:30:00.000Z"),
    "updatedAt": ISODate("2026-05-28T09:30:00.000Z"),
    "order": {
      "$ref": "orders",
      "$id": "60b9b3e1f0e4b85c1c9a00000001"
    },
    "status": "PENDING",
    "actorName": "System Admin",
    "changedAt": ISODate("2026-05-28T09:30:00.000Z"),
    "note": "Tạo đơn hàng trực tiếp tại quầy"
  },
  {
    "_id": "60b9b3e1f0e4b85c1c9c00000002",
    "createdAt": ISODate("2026-05-28T09:35:00.000Z"),
    "updatedAt": ISODate("2026-05-28T09:35:00.000Z"),
    "order": {
      "$ref": "orders",
      "$id": "60b9b3e1f0e4b85c1c9a00000001"
    },
    "status": "PROCESSING",
    "actorName": "System Admin",
    "changedAt": ISODate("2026-05-28T09:35:00.000Z"),
    "note": "Khách hàng thanh toán và nhận sản phẩm tại quầy"
  },
  {
    "_id": "60b9b3e1f0e4b85c1c9c00000003",
    "createdAt": ISODate("2026-05-28T10:00:00.000Z"),
    "updatedAt": ISODate("2026-05-28T10:00:00.000Z"),
    "order": {
      "$ref": "orders",
      "$id": "60b9b3e1f0e4b85c1c9a00000001"
    },
    "status": "DELIVERED",
    "actorName": "System Admin",
    "changedAt": ISODate("2026-05-28T10:00:00.000Z"),
    "note": "Hoàn tất đơn hàng POS"
  }
]);

print("Inserting Payments...");
db.payments.insertMany([
  {
    "_id": "60b9b3e1f0e4b85c1c9d00000001",
    "createdAt": ISODate("2026-05-28T09:35:00.000Z"),
    "updatedAt": ISODate("2026-05-28T09:40:00.000Z"),
    "order": {
      "$ref": "orders",
      "$id": "60b9b3e1f0e4b85c1c9a00000001"
    },
    "user": {
      "$ref": "users",
      "$id": "60b9b3e1f0e4b85c1c8b00000001"
    },
    "method": "MIXED",
    "status": "PAID",
    "amount": 2880000,
    "provider": "POS_COUNTER",
    "transactionCode": "TX-POS-001",
    "paidAt": ISODate("2026-05-28T09:40:00.000Z"),
    "note": "Thanh toán hỗn hợp tại quầy thu ngân"
  },
  {
    "_id": "60b9b3e1f0e4b85c1c9d00000002",
    "createdAt": ISODate("2026-05-29T08:15:00.000Z"),
    "updatedAt": ISODate("2026-05-29T08:15:00.000Z"),
    "order": {
      "$ref": "orders",
      "$id": "60b9b3e1f0e4b85c1c9a00000002"
    },
    "user": {
      "$ref": "users",
      "$id": "60b9b3e1f0e4b85c1c8b00000003"
    },
    "method": "COD",
    "status": "PENDING",
    "amount": 1155000,
    "provider": "COD_PARTNER",
    "transactionCode": "TX-COD-002",
    "note": "Thanh toán khi nhận hàng"
  },
  {
    "_id": "60b9b3e1f0e4b85c1c9d00000003",
    "createdAt": ISODate("2026-05-29T14:00:00.000Z"),
    "updatedAt": ISODate("2026-05-29T14:00:00.000Z"),
    "order": {
      "$ref": "orders",
      "$id": "60b9b3e1f0e4b85c1c9a00000003"
    },
    "user": {
      "$ref": "users",
      "$id": "60b9b3e1f0e4b85c1c8b00000002"
    },
    "method": "BANK_TRANSFER",
    "status": "PAID",
    "amount": 1380000,
    "provider": "VIETCOMBANK",
    "transactionCode": "TX-VCB-003",
    "paidAt": ISODate("2026-05-29T14:05:00.000Z"),
    "note": "Khách chuyển khoản ngân hàng trực tiếp"
  }
]);

print("Inserting Pos Payment Allocations...");
db.pos_payment_allocations.insertMany([
  {
    "_id": "60b9b3e1f0e4b85c1c9e00000001",
    "createdAt": ISODate("2026-05-28T09:35:00.000Z"),
    "updatedAt": ISODate("2026-05-28T09:35:00.000Z"),
    "order": {
      "$ref": "orders",
      "$id": "60b9b3e1f0e4b85c1c9a00000001"
    },
    "amount": 1000000,
    "cashReceived": 1000000,
    "changeAmount": 0,
    "method": "COD",
    "note": "Khách trả tiền mặt 1 triệu đồng"
  },
  {
    "_id": "60b9b3e1f0e4b85c1c9e00000002",
    "createdAt": ISODate("2026-05-28T09:35:00.000Z"),
    "updatedAt": ISODate("2026-05-28T09:35:00.000Z"),
    "order": {
      "$ref": "orders",
      "$id": "60b9b3e1f0e4b85c1c9a00000001"
    },
    "amount": 1880000,
    "cashReceived": 1880000,
    "changeAmount": 0,
    "method": "CREDIT_CARD",
    "referenceCode": "REF-CARD-88390",
    "note": "Quẹt thẻ Vietcombank phần còn lại"
  }
]);

print("Inserting Shippings...");
db.shippings.insertMany([
  {
    "_id": "60b9b3e1f0e4b85c1c9f00000001",
    "createdAt": ISODate("2026-05-29T08:20:00.000Z"),
    "updatedAt": ISODate("2026-05-29T10:00:00.000Z"),
    "order": {
      "$ref": "orders",
      "$id": "60b9b3e1f0e4b85c1c9a00000002"
    },
    "user": {
      "$ref": "users",
      "$id": "60b9b3e1f0e4b85c1c8b00000003"
    },
    "recipientName": "Tran Thi Binh",
    "phoneNumber": "0901000002",
    "addressLine": "789 Nguyễn Văn Linh",
    "ward": "Hưng Lợi",
    "district": "Ninh Kiều",
    "city": "Cần Thơ",
    "country": "Việt Nam",
    "postalCode": "900000",
    "method": "STANDARD",
    "status": "SHIPPING",
    "shippingFee": 30000,
    "trackingNumber": "TRACK-GHN-1008892",
    "expectedDeliveryDate": "2026-06-01"
  },
  {
    "_id": "60b9b3e1f0e4b85c1c9f00000002",
    "createdAt": ISODate("2026-05-29T14:05:00.000Z"),
    "updatedAt": ISODate("2026-05-29T14:05:00.000Z"),
    "order": {
      "$ref": "orders",
      "$id": "60b9b3e1f0e4b85c1c9a00000003"
    },
    "user": {
      "$ref": "users",
      "$id": "60b9b3e1f0e4b85c1c8b00000002"
    },
    "recipientName": "Nguyen Van An",
    "phoneNumber": "0901000001",
    "addressLine": "456 Lê Lợi",
    "ward": "Bến Thành",
    "district": "Quận 1",
    "city": "TP. Hồ Chí Minh",
    "country": "Việt Nam",
    "postalCode": "700000",
    "method": "STANDARD",
    "status": "PENDING",
    "shippingFee": 30000,
    "expectedDeliveryDate": "2026-06-02"
  }
]);

print("Inserting Cashier Sessions...");
db.cashier_sessions.insertMany([
  {
    "_id": "60b9b3e1f0e4b85c1ca000000001",
    "createdAt": ISODate("2026-05-28T08:00:00.000Z"),
    "updatedAt": ISODate("2026-05-28T17:30:00.000Z"),
    "cashierName": "Nguyen Van An",
    "openedAt": ISODate("2026-05-28T08:00:00.000Z"),
    "closedAt": ISODate("2026-05-28T17:30:00.000Z"),
    "openingCash": 1000000,
    "closingCash": 3880000,
    "status": "CLOSED",
    "note": "Phiên làm việc POS thứ 5 hoàn tất tốt đẹp"
  },
  {
    "_id": "60b9b3e1f0e4b85c1ca000000002",
    "createdAt": ISODate("2026-05-29T08:00:00.000Z"),
    "updatedAt": ISODate("2026-05-29T08:00:00.000Z"),
    "cashierName": "Tran Thi Binh",
    "openedAt": ISODate("2026-05-29T08:00:00.000Z"),
    "openingCash": 1000000,
    "status": "OPEN",
    "note": "Phiên làm việc POS sáng thứ 6 đang mở"
  }
]);

print("Inserting Return Exchange Logs...");
db.pos_return_exchange_logs.insertMany([
  {
    "_id": "60b9b3e1f0e4b85c1ca100000001",
    "createdAt": ISODate("2026-05-28T10:15:00.000Z"),
    "updatedAt": ISODate("2026-05-28T10:15:00.000Z"),
    "order": {
      "$ref": "orders",
      "$id": "60b9b3e1f0e4b85c1c9a00000001"
    },
    "type": "EXCHANGE",
    "returnedAmount": 1050000,
    "exchangeAmount": 1100000,
    "balanceAmount": 50000,
    "note": "Đổi 1 đôi FILA size 39 lấy 1 đôi Jeep size 40, thu thêm 50,000đ",
    "detailJson": "{\"returned_items\":[{\"sku\":\"FILA-ES1-W39\",\"qty\":1}],\"exchange_items\":[{\"sku\":\"JEEP-ES2-B40\",\"qty\":1}]}"
  }
]);

print("Inserting Saved Coupons...");
db.saved_coupons.insertMany([
  {
    "_id": "60b9b3e1f0e4b85c1ca200000001",
    "createdAt": ISODate("2026-05-29T09:00:00.000Z"),
    "updatedAt": ISODate("2026-05-29T09:00:00.000Z"),
    "user": {
      "$ref": "users",
      "$id": "60b9b3e1f0e4b85c1c8b00000002"
    },
    "coupon": {
      "$ref": "coupons",
      "$id": "60b9b3e1f0e4b85c1c8f00000001"
    },
    "status": "UNUSED"
  }
]);

print("Inserting Schedule Swap Requests...");
db.schedule_swap_requests.insertMany([
  {
    "_id": "60b9b3e1f0e4b85c1ca300000001",
    "createdAt": ISODate("2026-05-29T10:00:00.000Z"),
    "updatedAt": ISODate("2026-05-29T10:00:00.000Z"),
    "schedule": {
      "$ref": "work_schedules",
      "$id": "60b9b3e1f0e4b85c1c9500000006"
    },
    "fromUser": {
      "$ref": "users",
      "$id": "60b9b3e1f0e4b85c1c8b00000002"
    },
    "targetUser": {
      "$ref": "users",
      "$id": "60b9b3e1f0e4b85c1c8b00000003"
    },
    "status": "PENDING",
    "note": "Nhờ Binh trực hộ sáng thứ 7 do An bận việc gia đình"
  }
]);

print("Inserting Schedule Change Logs...");
db.schedule_change_logs.insertMany([
  {
    "_id": "60b9b3e1f0e4b85c1ca400000001",
    "createdAt": ISODate("2026-05-27T09:00:00.000Z"),
    "updatedAt": ISODate("2026-05-27T09:00:00.000Z"),
    "schedule": {
      "$ref": "work_schedules",
      "$id": "60b9b3e1f0e4b85c1c9500000001"
    },
    "action": "CREATE",
    "actor": "System Admin",
    "newValueJson": "{\"scheduleId\":\"60b9b3e1f0e4b85c1c9500000001\",\"user\":\"staff.an@local.com\",\"shift\":\"Ca Sáng\",\"workDate\":\"2026-05-28\"}"
  }
]);

print("MongoDB migration seed completed successfully!");
