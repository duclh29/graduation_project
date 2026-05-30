const fs = require('fs');
const path = require('path');

const SQL_FILE = path.join(__dirname, '..', 'shoe_store_dump.sql');
const OUTPUT_DIR = path.join(__dirname, 'data');

if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Map helper to generate standard 24-character hex ObjectIds from sequential integer IDs
function toObjectId(prefix, id) {
    const hexId = parseInt(id).toString(16).padStart(6, '0');
    return `${prefix}${hexId}`;
}

const PREFIX_ROLE = "60b9b3e1f0e4b85c1c8a00";      // roles: 60b9b3e1f0e4b85c1c8a00000001
const PREFIX_USER = "60b9b3e1f0e4b85c1c8b00";      // users: 60b9b3e1f0e4b85c1c8b00000001
const PREFIX_BRAND = "60b9b3e1f0e4b85c1c8c00";     // brands: 60b9b3e1f0e4b85c1c8c00000001
const PREFIX_CATEGORY = "60b9b3e1f0e4b85c1c8d00";  // categories: 60b9b3e1f0e4b85c1c8d00000001
const PREFIX_SIZE = "60b9b3e1f0e4b85c1c8e00";      // sizes: 60b9b3e1f0e4b85c1c8e00000001
const PREFIX_COUPON = "60b9b3e1f0e4b85c1c8f00";    // coupons: 60b9b3e1f0e4b85c1c8f00000001
const PREFIX_PRODUCT = "60b9b3e1f0e4b85c1c9000";   // products: 60b9b3e1f0e4b85c1c9000000001
const PREFIX_VARIANT = "60b9b3e1f0e4b85c1c9100";   // variants: 60b9b3e1f0e4b85c1c9100000001
const PREFIX_PROMOTION = "60b9b3e1f0e4b85c1c9200"; // promotions: 60b9b3e1f0e4b85c1c9200000001

console.log("Reading SQL file...");
const sqlContent = fs.readFileSync(SQL_FILE, 'utf8');

// Simple parser for INSERT statements
function parseInserts(tableName) {
    const regex = new RegExp(`INSERT INTO \`${tableName}\` VALUES\\s*([\\s\\S]*?);`, 'i');
    const match = sqlContent.match(regex);
    if (!match) {
        console.log(`No insert statements found for table: ${tableName}`);
        return [];
    }

    const valuesStr = match[1].trim();
    const rows = [];
    let current = '';
    let inString = false;
    let escape = false;

    // A robust char-by-char scanner to split items while ignoring commas inside string literals
    let i = 0;
    while (i < valuesStr.length) {
        const char = valuesStr[i];
        if (escape) {
            current += char;
            escape = false;
        } else if (char === '\\') {
            current += char;
            escape = true;
        } else if (char === '\'') {
            inString = !inString;
            current += char;
        } else if (char === ')' && !inString) {
            // End of a row value e.g. (1, 2, 'abc')
            rows.push(current.trim().replace(/^\(/, ''));
            current = '';
            // Skip the next comma and opening paren if any
            while (i < valuesStr.length && valuesStr[i] !== '(') {
                i++;
            }
            i--; // Adjust index for loop
        } else {
            current += char;
        }
        i++;
    }

    return rows.map(row => {
        const fields = [];
        let curField = '';
        let insideStr = false;
        let esc = false;
        for (let j = 0; j < row.length; j++) {
            const c = row[j];
            if (esc) {
                curField += c;
                esc = false;
            } else if (c === '\\') {
                curField += c;
                esc = true;
            } else if (c === '\'') {
                insideStr = !insideStr;
            } else if (c === ',' && !insideStr) {
                fields.push(curField.trim());
                curField = '';
            } else {
                curField += c;
            }
        }
        fields.push(curField.trim());
        return fields.map(f => {
            if (f.toUpperCase() === 'NULL') return null;
            if (f.startsWith('\'') && f.endsWith('\'')) return f.slice(1, -1);
            if (!isNaN(f)) return parseFloat(f);
            return f;
        });
    });
}

function fixVietnamese(str) {
    if (!str) return str;
    return str
        .replace(/Gi\?m 50K cho \?\?\?n h\?ng t\? 500K/g, "Giảm 50K cho đơn hàng từ 500K")
        .replace(/Gi\?m 10% t\?i \?a 100K/g, "Giảm 10% tối đa 100K")
        .replace(/Mi\?n ph\? v\?n chuy\?n/g, "Miễn phí vận chuyển")
        .replace(/Gi\?y/g, "Giày")
        .replace(/ch\?nh h\?ng/g, "chính hãng")
        .replace(/ch\?t l\?\?ng cao/g, "chất lượng cao")
        .replace(/Thi\?t k\? hi\?n \?\?i/g, "Thiết kế hiện đại")
        .replace(/tr\? trung/g, "trẻ trung")
        .replace(/ph\? h\?p v\?i m\?i ho\?t \?\?ng th\? thao v\? \?i ch\?i/g, "phù hợp với mọi hoạt động thể thao và đi chơi")
        .replace(/Ch\?\?ng tr\?nh gi\?m gi\? t\? \?\?ng 10% cho t\?t c? s\?n ph\?m tr\?n h\? th\?ng/g, "Chương trình giảm giá tự động 10% cho tất cả sản phẩm trên hệ thống")
        .replace(/Gi\?m 10% To\?n B\? S\?n Ph\?m/g, "Giảm 10% Toàn Bộ Sản Phẩm");
}

console.log("Parsing Roles...");
const roles = parseInserts('roles').map(fields => ({
    _id: toObjectId(PREFIX_ROLE, fields[0]),
    createdAt: new Date(fields[1]),
    updatedAt: new Date(fields[2]),
    description: fields[3],
    name: fields[4]
}));
fs.writeFileSync(path.join(OUTPUT_DIR, 'roles.json'), JSON.stringify(roles, null, 2));

console.log("Parsing Users...");
const userRolesMap = {};
parseInserts('user_roles').forEach(fields => {
    const userId = toObjectId(PREFIX_USER, fields[0]);
    const roleId = toObjectId(PREFIX_ROLE, fields[1]);
    if (!userRolesMap[userId]) userRolesMap[userId] = [];
    userRolesMap[userId].push({ "$ref": "roles", "$id": roleId });
});

const users = parseInserts('users').map(fields => {
    const userId = toObjectId(PREFIX_USER, fields[0]);
    return {
        _id: userId,
        createdAt: new Date(fields[1]),
        updatedAt: new Date(fields[2]),
        avatarUrl: fields[3],
        email: fields[4],
        fullName: fields[5],
        password: fields[6],
        phoneNumber: fields[7],
        status: fields[8],
        roles: userRolesMap[userId] || []
    };
});
fs.writeFileSync(path.join(OUTPUT_DIR, 'users.json'), JSON.stringify(users, null, 2));

console.log("Parsing Brands...");
const brands = parseInserts('brands').map(fields => ({
    _id: toObjectId(PREFIX_BRAND, fields[0]),
    name: fields[1]
}));
fs.writeFileSync(path.join(OUTPUT_DIR, 'brands.json'), JSON.stringify(brands, null, 2));

console.log("Parsing Categories...");
const categories = parseInserts('categories').map(fields => ({
    _id: toObjectId(PREFIX_CATEGORY, fields[0]),
    name: fields[1]
}));
fs.writeFileSync(path.join(OUTPUT_DIR, 'categories.json'), JSON.stringify(categories, null, 2));

console.log("Parsing Sizes...");
const sizes = parseInserts('sizes').map(fields => ({
    _id: toObjectId(PREFIX_SIZE, fields[0]),
    name: fields[1]
}));
fs.writeFileSync(path.join(OUTPUT_DIR, 'sizes.json'), JSON.stringify(sizes, null, 2));

console.log("Parsing Coupons...");
const coupons = parseInserts('coupons').map(fields => ({
    _id: toObjectId(PREFIX_COUPON, fields[0]),
    createdAt: new Date(fields[1]),
    updatedAt: new Date(fields[2]),
    code: fields[3],
    description: fixVietnamese(fields[4]),
    discountValue: fields[5],
    endAt: new Date(fields[6]),
    maxDiscountValue: fields[7],
    minimumOrderAmount: fields[8],
    startAt: new Date(fields[9]),
    status: fields[10],
    type: fields[11],
    usageLimit: fields[12],
    usedCount: fields[13]
}));
fs.writeFileSync(path.join(OUTPUT_DIR, 'coupons.json'), JSON.stringify(coupons, null, 2));

console.log("Parsing Products...");
const products = parseInserts('products').map(fields => ({
    _id: toObjectId(PREFIX_PRODUCT, fields[0]),
    createdAt: new Date(fields[1]),
    updatedAt: new Date(fields[2]),
    basePrice: fields[3],
    description: fixVietnamese(fields[4]),
    imageUrl: fields[5],
    name: fields[6],
    sizes: fields[7],
    slug: fields[8],
    status: fields[9],
    totalQuantity: fields[10],
    brand: fields[11] ? { "$ref": "brands", "$id": toObjectId(PREFIX_BRAND, fields[11]) } : null,
    category: fields[12] ? { "$ref": "categories", "$id": toObjectId(PREFIX_CATEGORY, fields[12]) } : null
}));
fs.writeFileSync(path.join(OUTPUT_DIR, 'products.json'), JSON.stringify(products, null, 2));

console.log("Parsing Variants...");
const variants = parseInserts('variants').map(fields => ({
    _id: toObjectId(PREFIX_VARIANT, fields[0]),
    createdAt: new Date(fields[1]),
    updatedAt: new Date(fields[2]),
    additionalPrice: fields[3],
    color: fields[4],
    imageUrl: fields[5],
    sku: fields[6],
    status: 'ACTIVE', // Default value if not explicit
    stockQuantity: fields[8] || 10,
    product: fields[9] ? { "$ref": "products", "$id": toObjectId(PREFIX_PRODUCT, fields[9]) } : null,
    size: fields[10] ? { "$ref": "sizes", "$id": toObjectId(PREFIX_SIZE, fields[10]) } : null
}));
fs.writeFileSync(path.join(OUTPUT_DIR, 'variants.json'), JSON.stringify(variants, null, 2));

console.log("Parsing Promotions...");
const promotionProductsMap = {};
parseInserts('promotion_products').forEach(fields => {
    const promotionId = toObjectId(PREFIX_PROMOTION, fields[0]);
    const productId = toObjectId(PREFIX_PRODUCT, fields[1]);
    if (!promotionProductsMap[promotionId]) promotionProductsMap[promotionId] = [];
    promotionProductsMap[promotionId].push({ "$ref": "products", "$id": productId });
});

const promotions = parseInserts('promotions').map(fields => {
    const promoId = toObjectId(PREFIX_PROMOTION, fields[0]);
    return {
        _id: promoId,
        createdAt: new Date(fields[1]),
        updatedAt: new Date(fields[2]),
        code: fields[3],
        description: fixVietnamese(fields[4]),
        discountValue: fields[5],
        endAt: new Date(fields[6]),
        maxDiscountValue: fields[7],
        name: fixVietnamese(fields[8]),
        startAt: new Date(fields[9]),
        status: fields[10],
        type: fields[11],
        products: promotionProductsMap[promoId] || [],
        variants: []
    };
});
fs.writeFileSync(path.join(OUTPUT_DIR, 'promotions.json'), JSON.stringify(promotions, null, 2));

// --- GENERATING DATA FOR MISSING HR, TRANSACTION, AND POS COLLECTIONS ---

const PREFIX_ADDRESS = "60b9b3e1f0e4b85c1c9300";      // addresses
const PREFIX_SHIFT = "60b9b3e1f0e4b85c1c9400";        // shifts
const PREFIX_SCHEDULE = "60b9b3e1f0e4b85c1c9500";     // work_schedules
const PREFIX_ATTENDANCE = "60b9b3e1f0e4b85c1c9600";   // attendance_records
const PREFIX_OPEN_SHIFT = "60b9b3e1f0e4b85c1c9700";   // open_shifts
const PREFIX_CART = "60b9b3e1f0e4b85c1c9800";         // carts
const PREFIX_CART_ITEM = "60b9b3e1f0e4b85c1c9900";    // cart_items
const PREFIX_ORDER = "60b9b3e1f0e4b85c1c9a00";        // orders
const PREFIX_ORDER_ITEM = "60b9b3e1f0e4b85c1c9b00";   // order_items
const PREFIX_ORDER_HIST = "60b9b3e1f0e4b85c1c9c00";   // order_status_histories
const PREFIX_PAYMENT = "60b9b3e1f0e4b85c1c9d00";      // payments
const PREFIX_PAY_ALLOC = "60b9b3e1f0e4b85c1c9e00";    // pos_payment_allocations
const PREFIX_SHIPPING = "60b9b3e1f0e4b85c1c9f00";     // shippings
const PREFIX_CASH_SESS = "60b9b3e1f0e4b85c1ca000";    // cashier_sessions
const PREFIX_RET_LOG = "60b9b3e1f0e4b85c1ca100";      // pos_return_exchange_logs
const PREFIX_SAVED_CPN = "60b9b3e1f0e4b85c1ca200";    // saved_coupons
const PREFIX_SWAP_REQ = "60b9b3e1f0e4b85c1ca300";     // schedule_swap_requests
const PREFIX_CHG_LOG = "60b9b3e1f0e4b85c1ca400";      // schedule_change_logs

console.log("Generating Addresses...");
const addresses = [
  {
    "_id": toObjectId(PREFIX_ADDRESS, 1),
    "createdAt": new Date("2026-05-22T08:14:59.633Z"),
    "updatedAt": new Date("2026-05-22T08:14:59.633Z"),
    "user": { "$ref": "users", "$id": toObjectId(PREFIX_USER, 1) },
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
    "_id": toObjectId(PREFIX_ADDRESS, 2),
    "createdAt": new Date("2026-05-22T08:14:59.745Z"),
    "updatedAt": new Date("2026-05-22T08:14:59.745Z"),
    "user": { "$ref": "users", "$id": toObjectId(PREFIX_USER, 2) },
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
    "_id": toObjectId(PREFIX_ADDRESS, 3),
    "createdAt": new Date("2026-05-22T08:14:59.847Z"),
    "updatedAt": new Date("2026-05-22T08:14:59.847Z"),
    "user": { "$ref": "users", "$id": toObjectId(PREFIX_USER, 3) },
    "recipientName": "Tran Thi Binh",
    "phoneNumber": "0901000002",
    "addressLine": "789 Nguyễn Văn Linh",
    "ward": "Hưng Lợi",
    "district": "Ninh Kiều",
    "city": "Cần Thơ",
    "country": "Việt Nam",
    "postalCode": "900000"
  }
];
fs.writeFileSync(path.join(OUTPUT_DIR, 'addresses.json'), JSON.stringify(addresses, null, 2));

console.log("Generating Shifts...");
const shifts = [
  {
    "_id": toObjectId(PREFIX_SHIFT, 1),
    "createdAt": new Date("2026-05-22T08:14:59.633Z"),
    "updatedAt": new Date("2026-05-22T08:14:59.633Z"),
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
    "_id": toObjectId(PREFIX_SHIFT, 2),
    "createdAt": new Date("2026-05-22T08:14:59.633Z"),
    "updatedAt": new Date("2026-05-22T08:14:59.633Z"),
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
    "_id": toObjectId(PREFIX_SHIFT, 3),
    "createdAt": new Date("2026-05-22T08:14:59.633Z"),
    "updatedAt": new Date("2026-05-22T08:14:59.633Z"),
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
    "_id": toObjectId(PREFIX_SHIFT, 4),
    "createdAt": new Date("2026-05-22T08:14:59.633Z"),
    "updatedAt": new Date("2026-05-22T08:14:59.633Z"),
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
];
fs.writeFileSync(path.join(OUTPUT_DIR, 'shifts.json'), JSON.stringify(shifts, null, 2));

console.log("Generating Work Schedules...");
const workSchedules = [
  {
    "_id": toObjectId(PREFIX_SCHEDULE, 1),
    "createdAt": new Date("2026-05-27T08:00:00.000Z"),
    "updatedAt": new Date("2026-05-27T08:00:00.000Z"),
    "user": { "$ref": "users", "$id": toObjectId(PREFIX_USER, 2) }, // Nguyen Van An
    "shift": { "$ref": "shifts", "$id": toObjectId(PREFIX_SHIFT, 1) }, // Ca Sáng
    "workDate": "2026-05-28",
    "plannedStartAt": new Date("2026-05-28T08:00:00Z"),
    "plannedEndAt": new Date("2026-05-28T12:00:00Z"),
    "status": "PRESENT",
    "publishStatus": "PUBLISHED",
    "note": "Lịch trực sáng thứ 5",
    "publishedAt": new Date("2026-05-27T09:00:00Z")
  },
  {
    "_id": toObjectId(PREFIX_SCHEDULE, 2),
    "createdAt": new Date("2026-05-27T08:00:00.000Z"),
    "updatedAt": new Date("2026-05-27T08:00:00.000Z"),
    "user": { "$ref": "users", "$id": toObjectId(PREFIX_USER, 2) }, // Nguyen Van An
    "shift": { "$ref": "shifts", "$id": toObjectId(PREFIX_SHIFT, 2) }, // Ca Chiều
    "workDate": "2026-05-28",
    "plannedStartAt": new Date("2026-05-28T13:30:00Z"),
    "plannedEndAt": new Date("2026-05-28T17:30:00Z"),
    "status": "PRESENT",
    "publishStatus": "PUBLISHED",
    "note": "Lịch trực chiều thứ 5",
    "publishedAt": new Date("2026-05-27T09:00:00Z")
  },
  {
    "_id": toObjectId(PREFIX_SCHEDULE, 3),
    "createdAt": new Date("2026-05-27T08:00:00.000Z"),
    "updatedAt": new Date("2026-05-27T08:00:00.000Z"),
    "user": { "$ref": "users", "$id": toObjectId(PREFIX_USER, 3) }, // Tran Thi Binh
    "shift": { "$ref": "shifts", "$id": toObjectId(PREFIX_SHIFT, 2) }, // Ca Chiều
    "workDate": "2026-05-28",
    "plannedStartAt": new Date("2026-05-28T13:30:00Z"),
    "plannedEndAt": new Date("2026-05-28T17:30:00Z"),
    "status": "PRESENT",
    "publishStatus": "PUBLISHED",
    "note": "Lịch trực chiều thứ 5 Binh",
    "publishedAt": new Date("2026-05-27T09:00:00Z")
  },
  {
    "_id": toObjectId(PREFIX_SCHEDULE, 4),
    "createdAt": new Date("2026-05-27T08:00:00.000Z"),
    "updatedAt": new Date("2026-05-27T08:00:00.000Z"),
    "user": { "$ref": "users", "$id": toObjectId(PREFIX_USER, 2) }, // Nguyen Van An
    "shift": { "$ref": "shifts", "$id": toObjectId(PREFIX_SHIFT, 1) }, // Ca Sáng
    "workDate": "2026-05-29",
    "plannedStartAt": new Date("2026-05-29T08:00:00Z"),
    "plannedEndAt": new Date("2026-05-29T12:00:00Z"),
    "status": "PRESENT",
    "publishStatus": "PUBLISHED",
    "note": "Lịch trực sáng thứ 6",
    "publishedAt": new Date("2026-05-27T09:00:00Z")
  },
  {
    "_id": toObjectId(PREFIX_SCHEDULE, 5),
    "createdAt": new Date("2026-05-27T08:00:00.000Z"),
    "updatedAt": new Date("2026-05-27T08:00:00.000Z"),
    "user": { "$ref": "users", "$id": toObjectId(PREFIX_USER, 3) }, // Tran Thi Binh
    "shift": { "$ref": "shifts", "$id": toObjectId(PREFIX_SHIFT, 3) }, // Ca Tối
    "workDate": "2026-05-29",
    "plannedStartAt": new Date("2026-05-29T18:00:00Z"),
    "plannedEndAt": new Date("2026-05-29T22:00:00Z"),
    "status": "PRESENT",
    "publishStatus": "PUBLISHED",
    "note": "Lịch trực tối thứ 6 Binh",
    "publishedAt": new Date("2026-05-27T09:00:00Z")
  },
  {
    "_id": toObjectId(PREFIX_SCHEDULE, 6),
    "createdAt": new Date("2026-05-27T08:00:00.000Z"),
    "updatedAt": new Date("2026-05-27T08:00:00.000Z"),
    "user": { "$ref": "users", "$id": toObjectId(PREFIX_USER, 2) }, // Nguyen Van An
    "shift": { "$ref": "shifts", "$id": toObjectId(PREFIX_SHIFT, 1) }, // Ca Sáng
    "workDate": "2026-05-30",
    "plannedStartAt": new Date("2026-05-30T08:00:00Z"),
    "plannedEndAt": new Date("2026-05-30T12:00:00Z"),
    "status": "SCHEDULED",
    "publishStatus": "PUBLISHED",
    "note": "Lịch trực sáng thứ 7",
    "publishedAt": new Date("2026-05-27T09:00:00Z")
  }
];
fs.writeFileSync(path.join(OUTPUT_DIR, 'work_schedules.json'), JSON.stringify(workSchedules, null, 2));

console.log("Generating Attendance Records...");
const attendanceRecords = [
  {
    "_id": toObjectId(PREFIX_ATTENDANCE, 1),
    "createdAt": new Date("2026-05-28T07:55:00Z"),
    "updatedAt": new Date("2026-05-28T12:05:00Z"),
    "schedule": { "$ref": "work_schedules", "$id": toObjectId(PREFIX_SCHEDULE, 1) },
    "checkInAt": new Date("2026-05-28T07:55:00Z"),
    "checkOutAt": new Date("2026-05-28T12:05:00Z"),
    "actualWorkMinutes": 245,
    "lateMinutes": 0,
    "earlyLeaveMinutes": 0,
    "overtimeMinutes": 5,
    "status": "PRESENT",
    "source": "SYSTEM",
    "note": "Đúng giờ và làm thêm 5 phút",
    "approvedAt": new Date("2026-05-28T12:10:00Z")
  },
  {
    "_id": toObjectId(PREFIX_ATTENDANCE, 2),
    "createdAt": new Date("2026-05-28T13:32:00Z"),
    "updatedAt": new Date("2026-05-28T17:30:00Z"),
    "schedule": { "$ref": "work_schedules", "$id": toObjectId(PREFIX_SCHEDULE, 2) },
    "checkInAt": new Date("2026-05-28T13:32:00Z"),
    "checkOutAt": new Date("2026-05-28T17:30:00Z"),
    "actualWorkMinutes": 238,
    "lateMinutes": 2,
    "earlyLeaveMinutes": 0,
    "overtimeMinutes": 0,
    "status": "PRESENT",
    "source": "SYSTEM",
    "note": "Trễ 2 phút do kẹt xe",
    "approvedAt": new Date("2026-05-28T17:40:00Z")
  }
];
fs.writeFileSync(path.join(OUTPUT_DIR, 'attendance_records.json'), JSON.stringify(attendanceRecords, null, 2));

console.log("Generating Open Shifts...");
const openShifts = [
  {
    "_id": toObjectId(PREFIX_OPEN_SHIFT, 1),
    "createdAt": new Date("2026-05-27T08:00:00Z"),
    "updatedAt": new Date("2026-05-27T08:00:00Z"),
    "shift": { "$ref": "shifts", "$id": toObjectId(PREFIX_SHIFT, 3) }, // Ca Tối
    "workDate": "2026-05-30",
    "plannedStartAt": new Date("2026-05-30T18:00:00Z"),
    "plannedEndAt": new Date("2026-05-30T22:00:00Z"),
    "status": "OPEN",
    "note": "Cần tuyển thêm 1 nhân sự trực tối thứ 7"
  },
  {
    "_id": toObjectId(PREFIX_OPEN_SHIFT, 2),
    "createdAt": new Date("2026-05-27T08:00:00Z"),
    "updatedAt": new Date("2026-05-27T08:00:00Z"),
    "shift": { "$ref": "shifts", "$id": toObjectId(PREFIX_SHIFT, 2) }, // Ca Chiều
    "workDate": "2026-05-31",
    "plannedStartAt": new Date("2026-05-31T13:30:00Z"),
    "plannedEndAt": new Date("2026-05-31T17:30:00Z"),
    "status": "OPEN",
    "note": "Cần tuyển thêm nhân sự trực chiều Chủ Nhật"
  }
];
fs.writeFileSync(path.join(OUTPUT_DIR, 'open_shifts.json'), JSON.stringify(openShifts, null, 2));

console.log("Generating Carts and Cart Items...");
const carts = [
  {
    "_id": toObjectId(PREFIX_CART, 1),
    "createdAt": new Date("2026-05-29T10:00:00Z"),
    "updatedAt": new Date("2026-05-29T10:05:00Z"),
    "status": "ACTIVE",
    "totalPrice": 3200000.00,
    "user": { "$ref": "users", "$id": toObjectId(PREFIX_USER, 1) } // System Admin
  }
];
fs.writeFileSync(path.join(OUTPUT_DIR, 'carts.json'), JSON.stringify(carts, null, 2));

const cartItems = [
  {
    "_id": toObjectId(PREFIX_CART_ITEM, 1),
    "createdAt": new Date("2026-05-29T10:00:00Z"),
    "updatedAt": new Date("2026-05-29T10:00:00Z"),
    "quantity": 2,
    "unitPrice": 1050000.00,
    "cart": { "$ref": "carts", "$id": toObjectId(PREFIX_CART, 1) },
    "variant": { "$ref": "variants", "$id": toObjectId(PREFIX_VARIANT, 1) } // Product 1 Variant
  },
  {
    "_id": toObjectId(PREFIX_CART_ITEM, 2),
    "createdAt": new Date("2026-05-29T10:05:00Z"),
    "updatedAt": new Date("2026-05-29T10:05:00Z"),
    "quantity": 1,
    "unitPrice": 1100000.00,
    "cart": { "$ref": "carts", "$id": toObjectId(PREFIX_CART, 1) },
    "variant": { "$ref": "variants", "$id": toObjectId(PREFIX_VARIANT, 4) } // Product 2 Variant
  }
];
fs.writeFileSync(path.join(OUTPUT_DIR, 'cart_items.json'), JSON.stringify(cartItems, null, 2));

console.log("Generating Orders and Related entities...");
const orders = [
  {
    "_id": toObjectId(PREFIX_ORDER, 1),
    "createdAt": new Date("2026-05-28T09:30:00Z"),
    "updatedAt": new Date("2026-05-28T10:00:00Z"),
    "orderCode": "ORD-POS-001",
    "user": { "$ref": "users", "$id": toObjectId(PREFIX_USER, 1) },
    "status": "DELIVERED",
    "subtotalAmount": 3200000.00,
    "discountAmount": 320000.00, // 10% global promotion
    "shippingFee": 0.00,
    "finalPrice": 2880000.00,
    "note": "Đơn hàng mua trực tiếp tại quầy POS",
    "payment": { "$ref": "payments", "$id": toObjectId(PREFIX_PAYMENT, 1) }
  },
  {
    "_id": toObjectId(PREFIX_ORDER, 2),
    "createdAt": new Date("2026-05-29T08:15:00Z"),
    "updatedAt": new Date("2026-05-29T08:20:00Z"),
    "orderCode": "ORD-OL-002",
    "user": { "$ref": "users", "$id": toObjectId(PREFIX_USER, 3) }, // Binh
    "status": "SHIPPING",
    "subtotalAmount": 1250000.00,
    "discountAmount": 125000.00,
    "shippingFee": 30000.00,
    "finalPrice": 1155000.00,
    "note": "Giao giờ hành chính, gọi điện trước khi giao",
    "payment": { "$ref": "payments", "$id": toObjectId(PREFIX_PAYMENT, 2) },
    "shipping": { "$ref": "shippings", "$id": toObjectId(PREFIX_SHIPPING, 1) }
  },
  {
    "_id": toObjectId(PREFIX_ORDER, 3),
    "createdAt": new Date("2026-05-29T14:00:00Z"),
    "updatedAt": new Date("2026-05-29T14:00:00Z"),
    "orderCode": "ORD-OL-003",
    "user": { "$ref": "users", "$id": toObjectId(PREFIX_USER, 2) }, // An
    "status": "PENDING",
    "subtotalAmount": 1500000.00,
    "discountAmount": 150000.00,
    "shippingFee": 30000.00,
    "finalPrice": 1380000.00,
    "note": "Khách hàng mua online, thanh toán qua ngân hàng",
    "payment": { "$ref": "payments", "$id": toObjectId(PREFIX_PAYMENT, 3) },
    "shipping": { "$ref": "shippings", "$id": toObjectId(PREFIX_SHIPPING, 2) }
  }
];
fs.writeFileSync(path.join(OUTPUT_DIR, 'orders.json'), JSON.stringify(orders, null, 2));

const orderItems = [
  {
    "_id": toObjectId(PREFIX_ORDER_ITEM, 1),
    "createdAt": new Date("2026-05-28T09:30:00Z"),
    "updatedAt": new Date("2026-05-28T09:30:00Z"),
    "order": { "$ref": "orders", "$id": toObjectId(PREFIX_ORDER, 1) },
    "variant": { "$ref": "variants", "$id": toObjectId(PREFIX_VARIANT, 1) },
    "productName": "FILA Elite Series 1",
    "skuSnapshot": "FILA-ES1-W39",
    "sizeSnapshot": "39",
    "colorSnapshot": "Trắng",
    "quantity": 2,
    "returnedQuantity": 1, // 1 item returned/exchanged later
    "requestedReturnQuantity": 0,
    "unitPrice": 1050000.00,
    "totalPrice": 2100000.00
  },
  {
    "_id": toObjectId(PREFIX_ORDER_ITEM, 2),
    "createdAt": new Date("2026-05-28T09:30:00Z"),
    "updatedAt": new Date("2026-05-28T09:30:00Z"),
    "order": { "$ref": "orders", "$id": toObjectId(PREFIX_ORDER, 1) },
    "variant": { "$ref": "variants", "$id": toObjectId(PREFIX_VARIANT, 4) },
    "productName": "Jeep Elite Series 2",
    "skuSnapshot": "JEEP-ES2-B40",
    "sizeSnapshot": "40",
    "colorSnapshot": "Đen",
    "quantity": 1,
    "returnedQuantity": 0,
    "requestedReturnQuantity": 0,
    "unitPrice": 1100000.00,
    "totalPrice": 1100000.00
  },
  {
    "_id": toObjectId(PREFIX_ORDER_ITEM, 3),
    "createdAt": new Date("2026-05-29T08:15:00Z"),
    "updatedAt": new Date("2026-05-29T08:15:00Z"),
    "order": { "$ref": "orders", "$id": toObjectId(PREFIX_ORDER, 2) },
    "variant": { "$ref": "variants", "$id": toObjectId(PREFIX_VARIANT, 13) },
    "productName": "Nike Elite Series 5",
    "skuSnapshot": "NIKE-ES5-W41",
    "sizeSnapshot": "41",
    "colorSnapshot": "Xám",
    "quantity": 1,
    "returnedQuantity": 0,
    "requestedReturnQuantity": 0,
    "unitPrice": 1250000.00,
    "totalPrice": 1250000.00
  },
  {
    "_id": toObjectId(PREFIX_ORDER_ITEM, 4),
    "createdAt": new Date("2026-05-29T14:00:00Z"),
    "updatedAt": new Date("2026-05-29T14:00:00Z"),
    "order": { "$ref": "orders", "$id": toObjectId(PREFIX_ORDER, 3) },
    "variant": { "$ref": "variants", "$id": toObjectId(PREFIX_VARIANT, 28) },
    "productName": "MLB Elite Series 10",
    "skuSnapshot": "MLB-ES10-N39",
    "sizeSnapshot": "39",
    "colorSnapshot": "Xanh Dương",
    "quantity": 1,
    "returnedQuantity": 0,
    "requestedReturnQuantity": 0,
    "unitPrice": 1500000.00,
    "totalPrice": 1500000.00
  }
];
fs.writeFileSync(path.join(OUTPUT_DIR, 'order_items.json'), JSON.stringify(orderItems, null, 2));

const orderStatusHistories = [
  {
    "_id": toObjectId(PREFIX_ORDER_HIST, 1),
    "createdAt": new Date("2026-05-28T09:30:00Z"),
    "updatedAt": new Date("2026-05-28T09:30:00Z"),
    "order": { "$ref": "orders", "$id": toObjectId(PREFIX_ORDER, 1) },
    "status": "PENDING",
    "actorName": "System Admin",
    "changedAt": new Date("2026-05-28T09:30:00Z"),
    "note": "Tạo đơn hàng trực tiếp tại quầy"
  },
  {
    "_id": toObjectId(PREFIX_ORDER_HIST, 2),
    "createdAt": new Date("2026-05-28T09:35:00Z"),
    "updatedAt": new Date("2026-05-28T09:35:00Z"),
    "order": { "$ref": "orders", "$id": toObjectId(PREFIX_ORDER, 1) },
    "status": "PROCESSING",
    "actorName": "System Admin",
    "changedAt": new Date("2026-05-28T09:35:00Z"),
    "note": "Khách hàng thanh toán và nhận sản phẩm tại quầy"
  },
  {
    "_id": toObjectId(PREFIX_ORDER_HIST, 3),
    "createdAt": new Date("2026-05-28T10:00:00Z"),
    "updatedAt": new Date("2026-05-28T10:00:00Z"),
    "order": { "$ref": "orders", "$id": toObjectId(PREFIX_ORDER, 1) },
    "status": "DELIVERED",
    "actorName": "System Admin",
    "changedAt": new Date("2026-05-28T10:00:00Z"),
    "note": "Hoàn tất đơn hàng POS"
  }
];
fs.writeFileSync(path.join(OUTPUT_DIR, 'order_status_histories.json'), JSON.stringify(orderStatusHistories, null, 2));

console.log("Generating Payments and Pos Payment Allocations...");
const payments = [
  {
    "_id": toObjectId(PREFIX_PAYMENT, 1),
    "createdAt": new Date("2026-05-28T09:35:00Z"),
    "updatedAt": new Date("2026-05-28T09:40:00Z"),
    "order": { "$ref": "orders", "$id": toObjectId(PREFIX_ORDER, 1) },
    "user": { "$ref": "users", "$id": toObjectId(PREFIX_USER, 1) },
    "method": "MIXED",
    "status": "PAID",
    "amount": 2880000.00,
    "provider": "POS_COUNTER",
    "transactionCode": "TX-POS-001",
    "paidAt": new Date("2026-05-28T09:40:00Z"),
    "note": "Thanh toán hỗn hợp tại quầy thu ngân"
  },
  {
    "_id": toObjectId(PREFIX_PAYMENT, 2),
    "createdAt": new Date("2026-05-29T08:15:00Z"),
    "updatedAt": new Date("2026-05-29T08:15:00Z"),
    "order": { "$ref": "orders", "$id": toObjectId(PREFIX_ORDER, 2) },
    "user": { "$ref": "users", "$id": toObjectId(PREFIX_USER, 3) },
    "method": "COD",
    "status": "PENDING",
    "amount": 1155000.00,
    "provider": "COD_PARTNER",
    "transactionCode": "TX-COD-002",
    "note": "Thanh toán khi nhận hàng"
  },
  {
    "_id": toObjectId(PREFIX_PAYMENT, 3),
    "createdAt": new Date("2026-05-29T14:00:00Z"),
    "updatedAt": new Date("2026-05-29T14:00:00Z"),
    "order": { "$ref": "orders", "$id": toObjectId(PREFIX_ORDER, 3) },
    "user": { "$ref": "users", "$id": toObjectId(PREFIX_USER, 2) },
    "method": "BANK_TRANSFER",
    "status": "PAID",
    "amount": 1380000.00,
    "provider": "VIETCOMBANK",
    "transactionCode": "TX-VCB-003",
    "paidAt": new Date("2026-05-29T14:05:00Z"),
    "note": "Khách chuyển khoản ngân hàng trực tiếp"
  }
];
fs.writeFileSync(path.join(OUTPUT_DIR, 'payments.json'), JSON.stringify(payments, null, 2));

const posPaymentAllocations = [
  {
    "_id": toObjectId(PREFIX_PAY_ALLOC, 1),
    "createdAt": new Date("2026-05-28T09:35:00Z"),
    "updatedAt": new Date("2026-05-28T09:35:00Z"),
    "order": { "$ref": "orders", "$id": toObjectId(PREFIX_ORDER, 1) },
    "amount": 1000000.00,
    "cashReceived": 1000000.00,
    "changeAmount": 0.00,
    "method": "COD", // represent Cash in hand
    "note": "Khách trả tiền mặt 1 triệu đồng"
  },
  {
    "_id": toObjectId(PREFIX_PAY_ALLOC, 2),
    "createdAt": new Date("2026-05-28T09:35:00Z"),
    "updatedAt": new Date("2026-05-28T09:35:00Z"),
    "order": { "$ref": "orders", "$id": toObjectId(PREFIX_ORDER, 1) },
    "amount": 1880000.00,
    "cashReceived": 1880000.00,
    "changeAmount": 0.00,
    "method": "CREDIT_CARD",
    "referenceCode": "REF-CARD-88390",
    "note": "Quẹt thẻ Vietcombank phần còn lại"
  }
];
fs.writeFileSync(path.join(OUTPUT_DIR, 'pos_payment_allocations.json'), JSON.stringify(posPaymentAllocations, null, 2));

console.log("Generating Shippings...");
const shippings = [
  {
    "_id": toObjectId(PREFIX_SHIPPING, 1),
    "createdAt": new Date("2026-05-29T08:20:00Z"),
    "updatedAt": new Date("2026-05-29T10:00:00Z"),
    "order": { "$ref": "orders", "$id": toObjectId(PREFIX_ORDER, 2) },
    "user": { "$ref": "users", "$id": toObjectId(PREFIX_USER, 3) },
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
    "shippingFee": 30000.00,
    "trackingNumber": "TRACK-GHN-1008892",
    "expectedDeliveryDate": "2026-06-01"
  },
  {
    "_id": toObjectId(PREFIX_SHIPPING, 2),
    "createdAt": new Date("2026-05-29T14:05:00Z"),
    "updatedAt": new Date("2026-05-29T14:05:00Z"),
    "order": { "$ref": "orders", "$id": toObjectId(PREFIX_ORDER, 3) },
    "user": { "$ref": "users", "$id": toObjectId(PREFIX_USER, 2) },
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
    "shippingFee": 30000.00,
    "expectedDeliveryDate": "2026-06-02"
  }
];
fs.writeFileSync(path.join(OUTPUT_DIR, 'shippings.json'), JSON.stringify(shippings, null, 2));

console.log("Generating Cashier Sessions...");
const cashierSessions = [
  {
    "_id": toObjectId(PREFIX_CASH_SESS, 1),
    "createdAt": new Date("2026-05-28T08:00:00Z"),
    "updatedAt": new Date("2026-05-28T17:30:00Z"),
    "cashierName": "Nguyen Van An",
    "openedAt": new Date("2026-05-28T08:00:00Z"),
    "closedAt": new Date("2026-05-28T17:30:00Z"),
    "openingCash": 1000000.00,
    "closingCash": 3880000.00, // 1M + 2.88M POS Order
    "status": "CLOSED",
    "note": "Phiên làm việc POS thứ 5 hoàn tất tốt đẹp"
  },
  {
    "_id": toObjectId(PREFIX_CASH_SESS, 2),
    "createdAt": new Date("2026-05-29T08:00:00Z"),
    "updatedAt": new Date("2026-05-29T08:00:00Z"),
    "cashierName": "Tran Thi Binh",
    "openedAt": new Date("2026-05-29T08:00:00Z"),
    "openingCash": 1000000.00,
    "status": "OPEN",
    "note": "Phiên làm việc POS sáng thứ 6 đang mở"
  }
];
fs.writeFileSync(path.join(OUTPUT_DIR, 'cashier_sessions.json'), JSON.stringify(cashierSessions, null, 2));

console.log("Generating Return Exchange Logs...");
const posReturnExchangeLogs = [
  {
    "_id": toObjectId(PREFIX_RET_LOG, 1),
    "createdAt": new Date("2026-05-28T10:15:00Z"),
    "updatedAt": new Date("2026-05-28T10:15:00Z"),
    "order": { "$ref": "orders", "$id": toObjectId(PREFIX_ORDER, 1) },
    "type": "EXCHANGE",
    "returnedAmount": 1050000.00, // value of 1 FILA Product returned
    "exchangeAmount": 1100000.00, // value of 1 Jeep Product exchanged
    "balanceAmount": 50000.00, // paid extra 50K
    "note": "Đổi 1 đôi FILA size 39 lấy 1 đôi Jeep size 40, thu thêm 50,000đ",
    "detailJson": "{\"returned_items\":[{\"sku\":\"FILA-ES1-W39\",\"qty\":1}],\"exchange_items\":[{\"sku\":\"JEEP-ES2-B40\",\"qty\":1}]}"
  }
];
fs.writeFileSync(path.join(OUTPUT_DIR, 'pos_return_exchange_logs.json'), JSON.stringify(posReturnExchangeLogs, null, 2));

console.log("Generating Saved Coupons...");
const savedCoupons = [
  {
    "_id": toObjectId(PREFIX_SAVED_CPN, 1),
    "createdAt": new Date("2026-05-29T09:00:00Z"),
    "updatedAt": new Date("2026-05-29T09:00:00Z"),
    "user": { "$ref": "users", "$id": toObjectId(PREFIX_USER, 2) },
    "coupon": { "$ref": "coupons", "$id": toObjectId(PREFIX_COUPON, 1) }, // GIAM50K
    "status": "UNUSED"
  }
];
fs.writeFileSync(path.join(OUTPUT_DIR, 'saved_coupons.json'), JSON.stringify(savedCoupons, null, 2));

console.log("Generating Schedule Swap Requests...");
const scheduleSwapRequests = [
  {
    "_id": toObjectId(PREFIX_SWAP_REQ, 1),
    "createdAt": new Date("2026-05-29T10:00:00Z"),
    "updatedAt": new Date("2026-05-29T10:00:00Z"),
    "schedule": { "$ref": "work_schedules", "$id": toObjectId(PREFIX_SCHEDULE, 6) }, // Nguyen Van An schedule 30th
    "fromUser": { "$ref": "users", "$id": toObjectId(PREFIX_USER, 2) }, // An
    "targetUser": { "$ref": "users", "$id": toObjectId(PREFIX_USER, 3) }, // Binh
    "status": "PENDING",
    "note": "Nhờ Binh trực hộ sáng thứ 7 do An bận việc gia đình"
  }
];
fs.writeFileSync(path.join(OUTPUT_DIR, 'schedule_swap_requests.json'), JSON.stringify(scheduleSwapRequests, null, 2));

console.log("Generating Schedule Change Logs...");
const scheduleChangeLogs = [
  {
    "_id": toObjectId(PREFIX_CHG_LOG, 1),
    "createdAt": new Date("2026-05-27T09:00:00Z"),
    "updatedAt": new Date("2026-05-27T09:00:00Z"),
    "schedule": { "$ref": "work_schedules", "$id": toObjectId(PREFIX_SCHEDULE, 1) },
    "action": "CREATE",
    "actor": "System Admin",
    "newValueJson": "{\"scheduleId\":\"60b9b3e1f0e4b85c1c9500000001\",\"user\":\"staff.an@local.com\",\"shift\":\"Ca Sáng\",\"workDate\":\"2026-05-28\"}"
  }
];
fs.writeFileSync(path.join(OUTPUT_DIR, 'schedule_change_logs.json'), JSON.stringify(scheduleChangeLogs, null, 2));

console.log("Generating MongoDB Shell Seed Script...");
let jsContent = `// MongoDB Migration Seed Script for shoe_store
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
db.roles.insertMany(${JSON.stringify(roles, null, 2)});

print("Inserting Users...");
db.users.insertMany(${JSON.stringify(users, null, 2)});

print("Inserting Brands...");
db.brands.insertMany(${JSON.stringify(brands, null, 2)});

print("Inserting Categories...");
db.categories.insertMany(${JSON.stringify(categories, null, 2)});

print("Inserting Sizes...");
db.sizes.insertMany(${JSON.stringify(sizes, null, 2)});

print("Inserting Coupons...");
db.coupons.insertMany(${JSON.stringify(coupons, null, 2)});

print("Inserting Products...");
db.products.insertMany(${JSON.stringify(products, null, 2)});

print("Inserting Variants...");
db.variants.insertMany(${JSON.stringify(variants, null, 2)});

print("Inserting Promotions...");
db.promotions.insertMany(${JSON.stringify(promotions, null, 2)});

print("Inserting Addresses...");
db.addresses.insertMany(${JSON.stringify(addresses, null, 2)});

print("Inserting Shifts...");
db.shifts.insertMany(${JSON.stringify(shifts, null, 2)});

print("Inserting Work Schedules...");
db.work_schedules.insertMany(${JSON.stringify(workSchedules, null, 2)});

print("Inserting Attendance Records...");
db.attendance_records.insertMany(${JSON.stringify(attendanceRecords, null, 2)});

print("Inserting Open Shifts...");
db.open_shifts.insertMany(${JSON.stringify(openShifts, null, 2)});

print("Inserting Carts...");
db.carts.insertMany(${JSON.stringify(carts, null, 2)});

print("Inserting Cart Items...");
db.cart_items.insertMany(${JSON.stringify(cartItems, null, 2)});

print("Inserting Orders...");
db.orders.insertMany(${JSON.stringify(orders, null, 2)});

print("Inserting Order Items...");
db.order_items.insertMany(${JSON.stringify(orderItems, null, 2)});

print("Inserting Order Status Histories...");
db.order_status_histories.insertMany(${JSON.stringify(orderStatusHistories, null, 2)});

print("Inserting Payments...");
db.payments.insertMany(${JSON.stringify(payments, null, 2)});

print("Inserting Pos Payment Allocations...");
db.pos_payment_allocations.insertMany(${JSON.stringify(posPaymentAllocations, null, 2)});

print("Inserting Shippings...");
db.shippings.insertMany(${JSON.stringify(shippings, null, 2)});

print("Inserting Cashier Sessions...");
db.cashier_sessions.insertMany(${JSON.stringify(cashierSessions, null, 2)});

print("Inserting Return Exchange Logs...");
db.pos_return_exchange_logs.insertMany(${JSON.stringify(posReturnExchangeLogs, null, 2)});

print("Inserting Saved Coupons...");
db.saved_coupons.insertMany(${JSON.stringify(savedCoupons, null, 2)});

print("Inserting Schedule Swap Requests...");
db.schedule_swap_requests.insertMany(${JSON.stringify(scheduleSwapRequests, null, 2)});

print("Inserting Schedule Change Logs...");
db.schedule_change_logs.insertMany(${JSON.stringify(scheduleChangeLogs, null, 2)});

print("MongoDB migration seed completed successfully!");
`;

// Helper to replace ISO Date strings in JSON with actual ISODate() instantiation for mongo shell
jsContent = jsContent.replace(/"(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z)"/g, 'ISODate("$1")');

fs.writeFileSync(path.join(__dirname, 'seed_mongodb.js'), jsContent);

console.log("Migration files generated successfully inside mongodb_migration directory!");

