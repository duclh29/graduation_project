export type Province = {
  code: string;
  name: string;
};

export type DistrictMap = Record<string, string[]>;

export const PROVINCES: Province[] = [
  { code: "AG", name: "An Giang" },
  { code: "BRVT", name: "Bà Rịa - Vũng Tàu" },
  { code: "BL", name: "Bạc Liêu" },
  { code: "BK", name: "Bắc Kạn" },
  { code: "BG", name: "Bắc Giang" },
  { code: "BN", name: "Bắc Ninh" },
  { code: "BT", name: "Bến Tre" },
  { code: "BD", name: "Bình Dương" },
  { code: "BDI", name: "Bình Định" },
  { code: "BP", name: "Bình Phước" },
  { code: "BTH", name: "Bình Thuận" },
  { code: "CM", name: "Cà Mau" },
  { code: "CT", name: "Cần Thơ" },
  { code: "CB", name: "Cao Bằng" },
  { code: "DN", name: "Đà Nẵng" },
  { code: "DLK", name: "Đắk Lắk" },
  { code: "DNO", name: "Đắk Nông" },
  { code: "DB", name: "Điện Biên" },
  { code: "DNA", name: "Đồng Nai" },
  { code: "DT", name: "Đồng Tháp" },
  { code: "GL", name: "Gia Lai" },
  { code: "HG", name: "Hà Giang" },
  { code: "HNA", name: "Hà Nam" },
  { code: "HN", name: "Hà Nội" },
  { code: "HT", name: "Hà Tĩnh" },
  { code: "HD", name: "Hải Dương" },
  { code: "HP", name: "Hải Phòng" },
  { code: "HGI", name: "Hậu Giang" },
  { code: "HB", name: "Hòa Bình" },
  { code: "HY", name: "Hưng Yên" },
  { code: "KH", name: "Khánh Hòa" },
  { code: "KG", name: "Kiên Giang" },
  { code: "KT", name: "Kon Tum" },
  { code: "LC", name: "Lai Châu" },
  { code: "LD", name: "Lâm Đồng" },
  { code: "LS", name: "Lạng Sơn" },
  { code: "LCA", name: "Lào Cai" },
  { code: "LA", name: "Long An" },
  { code: "ND", name: "Nam Định" },
  { code: "NA", name: "Nghệ An" },
  { code: "NB", name: "Ninh Bình" },
  { code: "NT", name: "Ninh Thuận" },
  { code: "PT", name: "Phú Thọ" },
  { code: "PY", name: "Phú Yên" },
  { code: "QB", name: "Quảng Bình" },
  { code: "QNA", name: "Quảng Nam" },
  { code: "QNG", name: "Quảng Ngãi" },
  { code: "QN", name: "Quảng Ninh" },
  { code: "QT", name: "Quảng Trị" },
  { code: "ST", name: "Sóc Trăng" },
  { code: "SL", name: "Sơn La" },
  { code: "TN", name: "Tây Ninh" },
  { code: "TB", name: "Thái Bình" },
  { code: "TNG", name: "Thái Nguyên" },
  { code: "TH", name: "Thanh Hóa" },
  { code: "TTH", name: "Thừa Thiên Huế" },
  { code: "TG", name: "Tiền Giang" },
  { code: "HCM", name: "Hồ Chí Minh" },
  { code: "TV", name: "Trà Vinh" },
  { code: "TQ", name: "Tuyên Quang" },
  { code: "VL", name: "Vĩnh Long" },
  { code: "VP", name: "Vĩnh Phúc" },
  { code: "YB", name: "Yên Bái" }
];

export const DISTRICTS_BY_PROVINCE: DistrictMap = {
  "Hồ Chí Minh": [
    "Quận 1", "Quận 3", "Quận 4", "Quận 5", "Quận 6", "Quận 7", "Quận 8", "Quận 10",
    "Quận 11", "Quận 12", "Bình Tân", "Bình Thạnh", "Gò Vấp", "Phú Nhuận", "Tân Bình",
    "Tân Phú", "Thủ Đức", "Hóc Môn", "Củ Chi", "Bình Chánh", "Nhà Bè", "Cần Giờ"
  ],
  "Hà Nội": [
    "Ba Đình", "Hoàn Kiếm", "Hai Bà Trưng", "Đống Đa", "Cầu Giấy", "Thanh Xuân", "Hoàng Mai",
    "Long Biên", "Nam Từ Liêm", "Bắc Từ Liêm", "Hà Đông", "Tây Hồ", "Gia Lâm", "Đông Anh", "Sóc Sơn"
  ],
  "Đà Nẵng": ["Hải Châu", "Thanh Khê", "Sơn Trà", "Ngũ Hành Sơn", "Liên Chiểu", "Cẩm Lệ", "Hòa Vang", "Hoàng Sa"],
  "Bình Dương": ["Thủ Dầu Một", "Dĩ An", "Thuận An", "Tân Uyên", "Bến Cát", "Bàu Bàng", "Phú Giáo", "Dầu Tiếng", "Bắc Tân Uyên"],
  "Đồng Nai": ["Biên Hòa", "Long Khánh", "Trảng Bom", "Vĩnh Cửu", "Định Quán", "Thống Nhất", "Cẩm Mỹ", "Long Thành", "Xuân Lộc", "Nhơn Trạch"],
  "Cần Thơ": ["Ninh Kiều", "Bình Thủy", "Cái Răng", "Ô Môn", "Thốt Nốt", "Phong Điền", "Cờ Đỏ", "Vĩnh Thạnh", "Thới Lai"],
  "Bà Rịa - Vũng Tàu": ["Vũng Tàu", "Bà Rịa", "Phú Mỹ", "Châu Đức", "Xuyên Mộc", "Long Điền", "Đất Đỏ", "Côn Đảo"],
  "Khánh Hòa": ["Nha Trang", "Cam Ranh", "Ninh Hòa", "Vạn Ninh", "Diên Khánh", "Cam Lâm", "Khánh Vĩnh", "Khánh Sơn", "Trường Sa"]
};

