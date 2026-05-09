export const HALLS = [
  { id: 1, name: "Diamond Hall", type: "Premium", minTables: 30, maxTables: 50, status: "Active", image: "https://images.unsplash.com/photo-1519167758481-83f29da8c8a1?w=400&h=300&fit=crop", lastModified: "2024-01-15", basePrice: 15000000 },
  { id: 2, name: "Ruby Hall", type: "Standard", minTables: 20, maxTables: 35, status: "Active", image: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=400&h=300&fit=crop", lastModified: "2024-01-14", basePrice: 12000000 },
  { id: 3, name: "Sapphire Hall", type: "Luxury", minTables: 40, maxTables: 70, status: "Active", image: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=400&h=300&fit=crop", lastModified: "2024-01-16", basePrice: 20000000 },
  { id: 4, name: "Pearl Hall", type: "Standard", minTables: 15, maxTables: 25, status: "Inactive", image: "https://images.unsplash.com/photo-1478146896981-b80fe463b330?w=400&h=300&fit=crop", lastModified: "2024-01-10", basePrice: 10000000 },
];

export const HALL_TYPES = [
  { id: 1, name: "Standard", basePrice: 10000000, description: "Basic wedding hall with essential amenities and services for intimate celebrations", status: "Active", lastModified: "2024-01-10" },
  { id: 2, name: "Premium", basePrice: 15000000, description: "Enhanced hall featuring premium decorations, advanced sound system, and elegant lighting", status: "Active", lastModified: "2024-01-15" },
  { id: 3, name: "Luxury", basePrice: 20000000, description: "Top-tier venue with crystal chandeliers, state-of-the-art facilities, and exclusive services", status: "Active", lastModified: "2024-01-16" },
  { id: 4, name: "VIP", basePrice: 30000000, description: "Ultra-luxury experience with dedicated staff, customized decor, and premium catering", status: "Inactive", lastModified: "2024-01-05" },
];

export const BOOKINGS = [
  { id: "BK2024001", hall: "Diamond Hall", customer: "Nguyễn Văn An", bride: "Trần Thị Bình", groom: "Nguyễn Văn An", date: "2024-02-14", shift: "Evening", tables: 45, status: "Confirmed", deposit: 30000000, total: 85000000 },
  { id: "BK2024002", hall: "Sapphire Hall", customer: "Lê Hoàng Minh", bride: "Phạm Thị Hương", groom: "Lê Hoàng Minh", date: "2024-02-20", shift: "Afternoon", tables: 60, status: "Pending", deposit: 40000000, total: 120000000 },
  { id: "BK2024003", hall: "Ruby Hall", customer: "Trịnh Công Sơn", bride: "Đỗ Thị Mai", groom: "Trịnh Công Sơn", date: "2024-02-25", shift: "Morning", tables: 30, status: "Confirmed", deposit: 20000000, total: 55000000 },
];

export const BOOKING_LIST = [
  { id: "BK2024001", hall: "Diamond Hall", customer: "Nguyễn Văn An", phone: "0901 234 567", email: "an.nguyen@gmail.com", bride: "Trần Thị Bình", groom: "Nguyễn Văn An", bookingDate: "2024-01-12", weddingDate: "2024-02-14", shift: "Evening", tables: 45, status: "Confirmed", depositStatus: "Paid", deposit: 30000000, total: 85000000, mode: "Package" },
  { id: "BK2024002", hall: "Sapphire Hall", customer: "Lê Hoàng Minh", phone: "0912 345 678", email: "minh.le@yahoo.com", bride: "Phạm Thị Hương", groom: "Lê Hoàng Minh", bookingDate: "2024-01-15", weddingDate: "2024-02-20", shift: "Afternoon", tables: 60, status: "Pending", depositStatus: "Awaiting", deposit: 40000000, total: 120000000, mode: "Manual" },
  { id: "BK2024003", hall: "Ruby Hall", customer: "Trịnh Công Sơn", phone: "0923 456 789", email: "son.trinh@gmail.com", bride: "Đỗ Thị Mai", groom: "Trịnh Công Sơn", bookingDate: "2024-01-18", weddingDate: "2024-02-25", shift: "Morning", tables: 30, status: "Confirmed", depositStatus: "Paid", deposit: 20000000, total: 55000000, mode: "Package" },
  { id: "BK2024004", hall: "Diamond Hall", customer: "Vũ Anh Tuấn", phone: "0934 567 890", email: "tuan.vu@gmail.com", bride: "Nguyễn Hồng Nhung", groom: "Vũ Anh Tuấn", bookingDate: "2024-01-22", weddingDate: "2024-03-08", shift: "Evening", tables: 50, status: "Ongoing", depositStatus: "Paid", deposit: 35000000, total: 95000000, mode: "Manual" },
  { id: "BK2024005", hall: "Pearl Hall", customer: "Hoàng Thị Lan", phone: "0945 678 901", email: "lan.hoang@hotmail.com", bride: "Hoàng Thị Lan", groom: "Bùi Quang Huy", bookingDate: "2024-01-05", weddingDate: "2024-01-28", shift: "Afternoon", tables: 25, status: "Completed", depositStatus: "Settled", deposit: 18000000, total: 48000000, mode: "Package" },
];

export const HALL_AVAILABILITY_GRID = [
  { hall: "Diamond Hall", Morning: "Available", Afternoon: "Booked", Evening: "Available" },
  { hall: "Ruby Hall", Morning: "Available", Afternoon: "Available", Evening: "Available" },
  { hall: "Sapphire Hall", Morning: "Booked", Afternoon: "Available", Evening: "Booked" },
  { hall: "Pearl Hall", Morning: "Available", Afternoon: "Available", Evening: "Hold" },
];

export const SHIFT_OPTIONS = ["Morning", "Afternoon", "Evening"];
export const STATUS_TABS = ["All", "Pending", "Confirmed", "Ongoing", "Completed", "Cancelled"];

export const STAFF = [
  { id: 1, name: "Nguyễn Thị Lan", email: "lan.nguyen@wedding.vn", phone: "0901234567", role: "Director", status: "Active", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop" },
  { id: 2, name: "Trần Minh Tuấn", email: "tuan.tran@wedding.vn", phone: "0912345678", role: "Operations Manager", status: "Active", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop" },
  { id: 3, name: "Phạm Thu Hà", email: "ha.pham@wedding.vn", phone: "0923456789", role: "Event Manager", status: "Active", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop" },
  { id: 4, name: "Lê Văn Đức", email: "duc.le@wedding.vn", phone: "0934567890", role: "Accountant", status: "Active", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop" },
];

export const PERMISSIONS = [
  { module: "Booking", view: true, create: true, update: true, delete: true, export: true },
  { module: "Hall", view: true, create: true, update: true, delete: false, export: true },
  { module: "Service", view: true, create: true, update: true, delete: true, export: false },
  { module: "Staff", view: true, create: false, update: false, delete: false, export: false },
  { module: "Payment", view: true, create: true, update: true, delete: false, export: true },
  { module: "Invoice", view: true, create: true, update: false, delete: false, export: true },
  { module: "Menu", view: true, create: true, update: true, delete: true, export: false },
  { module: "Report", view: true, create: false, update: false, delete: false, export: true },
  { module: "Audit", view: true, create: false, update: false, delete: false, export: true },
  { module: "System Config", view: false, create: false, update: false, delete: false, export: false },
];

export const SHIFTS = [
  { id: 1, name: "Morning Shift", startTime: "07:00", endTime: "12:00", status: "Active", lastModified: "2024-01-15" },
  { id: 2, name: "Afternoon Shift", startTime: "12:30", endTime: "17:30", status: "Active", lastModified: "2024-01-15" },
  { id: 3, name: "Evening Shift", startTime: "18:00", endTime: "23:00", status: "Active", lastModified: "2024-01-15" },
  { id: 4, name: "Full Day", startTime: "08:00", endTime: "22:00", status: "Inactive", lastModified: "2024-01-10" },
];

export const SERVICES = [
  { id: 1, name: "Professional Photography", price: 15000000, description: "Complete wedding photography coverage with two professional photographers, pre-wedding shoot, and edited photo album", image: "https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=300&h=200&fit=crop", status: "Active", lastModified: "2024-01-18" },
  { id: 2, name: "Cinematic Videography", price: 20000000, description: "Full-day cinematic videography with drone footage, highlight reel, and complete ceremony coverage", image: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=300&h=200&fit=crop", status: "Active", lastModified: "2024-01-17" },
  { id: 3, name: "Floral Decoration Package", price: 12000000, description: "Premium floral arrangements for stage, tables, entrance, and ceremony area with fresh imported flowers", image: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=300&h=200&fit=crop", status: "Active", lastModified: "2024-01-16" },
  { id: 4, name: "Live Band Performance", price: 18000000, description: "Professional 5-piece band with DJ, modern and traditional Vietnamese songs, 4-hour performance", image: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=300&h=200&fit=crop", status: "Active", lastModified: "2024-01-15" },
  { id: 5, name: "Wedding Cake Design", price: 5000000, description: "Custom 5-tier wedding cake with personalized design, serves 200 guests", image: "https://images.unsplash.com/photo-1535254973040-607b474cb50d?w=300&h=200&fit=crop", status: "Active", lastModified: "2024-01-14" },
  { id: 6, name: "Lighting & Sound System", price: 8000000, description: "Professional lighting setup with moving heads, LED screens, and premium sound system", image: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=300&h=200&fit=crop", status: "Inactive", lastModified: "2024-01-12" },
];

export const AUDIT_LOGS = [
  { id: 1, timestamp: "2024-01-16 14:30:22", actor: "Nguyễn Thị Lan", action: "CREATE", module: "Booking", detail: "Created booking BK2024003", ip: "192.168.1.105" },
  { id: 2, timestamp: "2024-01-16 13:15:10", actor: "Lê Văn Đức", action: "UPDATE", module: "Payment", detail: "Updated payment for BK2024001", ip: "192.168.1.102" },
  { id: 3, timestamp: "2024-01-16 10:45:33", actor: "Trần Minh Tuấn", action: "UPDATE", module: "Hall", detail: "Updated pricing for Diamond Hall", ip: "192.168.1.101" },
  { id: 4, timestamp: "2024-01-15 16:20:11", actor: "Phạm Thu Hà", action: "DELETE", module: "Service", detail: "Deleted service SV045", ip: "192.168.1.108" },
];

export const DISH_TYPES_INIT = [
  { id: 1, name: "Khai vị", description: "Các món ăn khai vị nhẹ để bắt đầu bữa tiệc", status: "Active", deleted: false, lastModified: "2024-01-16T10:30:00" },
  { id: 2, name: "Món chính", description: "Các món ăn chính phong phú, đặc sắc", status: "Active", deleted: false, lastModified: "2024-01-15T09:00:00" },
  { id: 3, name: "Tráng miệng", description: "Các món tráng miệng ngọt ngào sau bữa tiệc", status: "Active", deleted: false, lastModified: "2024-01-14T14:00:00" },
  { id: 4, name: "Canh súp", description: "Các món canh và súp bổ dưỡng", status: "Active", deleted: false, lastModified: "2024-01-13T09:00:00" },
  { id: 5, name: "Món cuối bữa", description: "Các món kết thúc bữa tiệc như cơm, cháo", status: "Inactive", deleted: false, lastModified: "2024-01-10T11:00:00" },
];

export const DISHES_INIT = [
  { id: 1,  name: "Gỏi cuốn tôm thịt",    dishTypeId: 1, dishTypeName: "Khai vị",      unitPrice: 85000,  image: "https://images.unsplash.com/photo-1734771308348-ad90bf5835ec?w=400&h=300&fit=crop", description: "Gỏi cuốn tươi với tôm và thịt heo, nước chấm đặc biệt",          status: "Active",   deleted: false, lastModified: "2024-01-16T10:00:00" },
  { id: 2,  name: "Chả giò hải sản",       dishTypeId: 1, dishTypeName: "Khai vị",      unitPrice: 90000,  image: "https://images.unsplash.com/photo-1614846128869-5fc0a61d763b?w=400&h=300&fit=crop", description: "Chả giò chiên vàng nhân hải sản thập cẩm",                        status: "Active",   deleted: false, lastModified: "2024-01-15T09:00:00" },
  { id: 3,  name: "Cá hấp gừng hành",      dishTypeId: 2, dishTypeName: "Món chính",    unitPrice: 280000, image: "https://images.unsplash.com/photo-1603662953513-5d74185ffb75?w=400&h=300&fit=crop", description: "Cá tươi hấp với gừng và hành lá, nước sốt đặc biệt",            status: "Active",   deleted: false, lastModified: "2024-01-14T11:00:00" },
  { id: 4,  name: "Bò lúc lắc cao cấp",    dishTypeId: 2, dishTypeName: "Món chính",    unitPrice: 350000, image: "https://images.unsplash.com/photo-1723531055852-744d14ac00b4?w=400&h=300&fit=crop", description: "Thịt bò Wagyu xào lúc lắc với rau quả, kèm cơm chiên",           status: "Active",   deleted: false, lastModified: "2024-01-13T14:00:00" },
  { id: 5,  name: "Gà quay mật ong",        dishTypeId: 2, dishTypeName: "Món chính",    unitPrice: 230000, image: "https://images.unsplash.com/photo-1594221708779-94832f4320d1?w=400&h=300&fit=crop", description: "Gà nguyên con quay mật ong giòn vàng ướm",                       status: "Active",   deleted: false, lastModified: "2024-01-12T10:00:00" },
  { id: 6,  name: "Bánh mousse sữa chua",   dishTypeId: 3, dishTypeName: "Tráng miệng",  unitPrice: 65000,  image: "https://images.unsplash.com/photo-1508736375612-66c03035c629?w=400&h=300&fit=crop", description: "Bánh mousse sữa chua tươi phủ trái cây theo mùa",               status: "Active",   deleted: false, lastModified: "2024-01-11T16:00:00" },
  { id: 7,  name: "Chè thái đặc biệt",      dishTypeId: 3, dishTypeName: "Tráng miệng",  unitPrice: 55000,  image: "https://images.unsplash.com/photo-1738573519644-93b700f3adf3?w=400&h=300&fit=crop", description: "Chè thái với các loại thạch và hoa quả nhiệt đới",              status: "Inactive", deleted: false, lastModified: "2024-01-10T09:00:00" },
  { id: 8,  name: "Súp bào ngư vi cá",      dishTypeId: 4, dishTypeName: "Canh súp",     unitPrice: 450000, image: "https://images.unsplash.com/photo-1658215286262-bbed7ceb7f9d?w=400&h=300&fit=crop", description: "Súp bào ngư vi cá hầm nấm trân châu thượng hạng",              status: "Active",   deleted: false, lastModified: "2024-01-16T08:00:00" },
  { id: 9,  name: "Canh chua hải sản",      dishTypeId: 4, dishTypeName: "Canh súp",     unitPrice: 180000, image: "https://images.unsplash.com/photo-1588566565463-180a5b2090d2?w=400&h=300&fit=crop", description: "Canh chua me với hải sản tươi, rau muống non",                   status: "Active",   deleted: false, lastModified: "2024-01-15T12:00:00" },
  { id: 10, name: "Tôm hùm sốt bơ tỏi",    dishTypeId: 2, dishTypeName: "Món chính",    unitPrice: 850000, image: "https://images.unsplash.com/photo-1758796626175-cfbb6ed524d5?w=400&h=300&fit=crop", description: "Tôm hùm Mỹ sốt bơ tỏi thơm ngon, sang trọng",                  status: "Active",   deleted: false, lastModified: "2024-01-16T09:00:00" },
  { id: 11, name: "Nem cuốn cải xanh",      dishTypeId: 1, dishTypeName: "Khai vị",      unitPrice: 75000,  image: "https://images.unsplash.com/photo-1670427254852-3ba77ad13591?w=400&h=300&fit=crop", description: "Nem cuốn tươi với rau cải xanh và thịt thăn",                   status: "Active",   deleted: false, lastModified: "2024-01-16T07:00:00" },
  { id: 12, name: "Thạch dừa hoa quả",      dishTypeId: 3, dishTypeName: "Tráng miệng",  unitPrice: 48000,  image: "https://images.unsplash.com/photo-1568736491132-8e0c54bbc5ab?w=400&h=300&fit=crop", description: "Thạch dừa tươi pha hoa quả nhiệt đới mát lành",                 status: "Active",   deleted: false, lastModified: "2024-01-14T15:00:00" },
];

export const MAX_COMBO_DISCOUNT_RATE = 25;

export const DISH_COMBOS_INIT = [
  {
    id: 1, name: "Combo Cưới Tiêu Chuẩn", comboDiscountRate: 8,
    description: "Bộ combo tiêu chuẩn cho tiệc cưới với các món phổ biến",
    status: "Active", deleted: false, lastModified: "2024-01-16T14:00:00",
    slots: [
      { slotId: 1, dishTypeId: 1, dishTypeName: "Khai vị", defaultDishId: 1, defaultDishName: "Gỏi cuốn tôm thịt", isReplaceable: true, displayOrder: 1, unitPrice: 85000 },
      { slotId: 2, dishTypeId: 4, dishTypeName: "Canh súp", defaultDishId: 9, defaultDishName: "Canh chua hải sản", isReplaceable: false, displayOrder: 2, unitPrice: 180000 },
      { slotId: 3, dishTypeId: 2, dishTypeName: "Món chính", defaultDishId: 3, defaultDishName: "Cá hấp gừng hành", isReplaceable: false, displayOrder: 3, unitPrice: 280000 },
      { slotId: 4, dishTypeId: 2, dishTypeName: "Món chính", defaultDishId: 5, defaultDishName: "Gà quay mật ong", isReplaceable: true, displayOrder: 4, unitPrice: 230000 },
      { slotId: 5, dishTypeId: 3, dishTypeName: "Tráng miệng", defaultDishId: 6, defaultDishName: "Bánh mousse sữa chua", isReplaceable: true, displayOrder: 5, unitPrice: 65000 },
    ]
  },
  {
    id: 2, name: "Combo Cưới Cao Cấp", comboDiscountRate: 12,
    description: "Bộ combo cao cấp với nguyên liệu thượng hạng",
    status: "Active", deleted: false, lastModified: "2024-01-15T11:00:00",
    slots: [
      { slotId: 1, dishTypeId: 1, dishTypeName: "Khai vị", defaultDishId: 2, defaultDishName: "Chả giò hải sản", isReplaceable: true, displayOrder: 1, unitPrice: 90000 },
      { slotId: 2, dishTypeId: 4, dishTypeName: "Canh súp", defaultDishId: 8, defaultDishName: "Súp bào ngư vi cá", isReplaceable: false, displayOrder: 2, unitPrice: 450000 },
      { slotId: 3, dishTypeId: 2, dishTypeName: "Món chính", defaultDishId: 4, defaultDishName: "Bò lúc lắc cao cấp", isReplaceable: false, displayOrder: 3, unitPrice: 350000 },
      { slotId: 4, dishTypeId: 2, dishTypeName: "Món chính", defaultDishId: 10, defaultDishName: "Tôm hùm sốt bơ tỏi", isReplaceable: false, displayOrder: 4, unitPrice: 850000 },
      { slotId: 5, dishTypeId: 3, dishTypeName: "Tráng miệng", defaultDishId: 12, defaultDishName: "Thạch dừa hoa quả", isReplaceable: true, displayOrder: 5, unitPrice: 48000 },
    ]
  },
  {
    id: 3, name: "Combo Ngân Sách", comboDiscountRate: 6,
    description: "Combo tiết kiệm phù hợp tiệc vừa và nhỏ",
    status: "Inactive", deleted: false, lastModified: "2024-01-12T09:00:00",
    slots: [
      { slotId: 1, dishTypeId: 1, dishTypeName: "Khai vị", defaultDishId: 11, defaultDishName: "Nem cuốn cải xanh", isReplaceable: true, displayOrder: 1, unitPrice: 75000 },
      { slotId: 2, dishTypeId: 2, dishTypeName: "Món chính", defaultDishId: 5, defaultDishName: "Gà quay mật ong", isReplaceable: true, displayOrder: 2, unitPrice: 230000 },
      { slotId: 3, dishTypeId: 3, dishTypeName: "Tráng miệng", defaultDishId: 7, defaultDishName: "Chè thái đặc biệt", isReplaceable: true, displayOrder: 3, unitPrice: 55000 },
    ]
  },
];

export const DISH_LINES_INIT = [
  { id: 1, name: "Soup of the Sea", source: "PACKAGE", qty: 40, unit: 220000, discount: 0, tax: 8, removable: false },
  { id: 2, name: "Steamed Lobster with Garlic", source: "PACKAGE", qty: 40, unit: 480000, discount: 0, tax: 8, removable: false },
  { id: 3, name: "Roasted Suckling Pig", source: "MANUAL_EXTRA", qty: 4, unit: 2200000, discount: 5, tax: 8, removable: true },
  { id: 4, name: "Vegetarian Lotus Rice", source: "MANUAL_EXTRA", qty: 6, unit: 180000, discount: 0, tax: 8, removable: true },
];

export const ACTIVE_DISHES_BOOKING = [
  { id: 11, name: "Abalone in Oyster Sauce", price: 850000 },
  { id: 12, name: "Crispy Roasted Duck", price: 620000 },
  { id: 13, name: "Saigon Spring Rolls (10pc)", price: 240000 },
  { id: 14, name: "Lotus Seed Sweet Soup", price: 95000 },
];

export const SERVICE_LINES_INIT = [
  { id: 1, name: "Premium Floral Arch", source: "PACKAGE", indicator: "Included", qty: 1, unit: 0, discount: 0, tax: 8, removable: false },
  { id: 2, name: "LED Stage Lighting", source: "PACKAGE", indicator: "Included", qty: 1, unit: 0, discount: 0, tax: 8, removable: false },
  { id: 3, name: "Master of Ceremonies", source: "OPTIONAL", indicator: "Optional", qty: 1, unit: 5500000, discount: 0, tax: 8, removable: true },
  { id: 4, name: "Champagne Tower", source: "MANUAL_EXTRA", indicator: "Extra", qty: 1, unit: 4500000, discount: 0, tax: 8, removable: true },
];

export const ACTIVE_SERVICES_BOOKING = [
  { id: 21, name: "Photography (full day)", price: 12000000 },
  { id: 22, name: "Drone Videography", price: 8500000 },
  { id: 23, name: "Bridal Makeup Touch-up", price: 3200000 },
  { id: 24, name: "Live Acoustic Trio", price: 4000000 },
];

export const BEVERAGE_TYPES_INIT = [
  { id: 1, name: "Bia", status: "Active" },
  { id: 2, name: "Nước ngọt", status: "Active" },
  { id: 3, name: "Rượu vang", status: "Active" },
  { id: 4, name: "Nước suối", status: "Active" },
  { id: 5, name: "Nước ép", status: "Active" },
];

export const BEVERAGES_INIT = [
  { id: 1, name: "Bia Tiger", beverageTypeId: 1, beverageTypeName: "Bia", unitPrice: 25000, status: "Active", deleted: false, lastModified: "2024-01-16T08:00:00" },
  { id: 2, name: "Bia Heineken", beverageTypeId: 1, beverageTypeName: "Bia", unitPrice: 35000, status: "Active", deleted: false, lastModified: "2024-01-16T08:00:00" },
  { id: 3, name: "Coca Cola lon 330ml", beverageTypeId: 2, beverageTypeName: "Nước ngọt", unitPrice: 15000, status: "Active", deleted: false, lastModified: "2024-01-15T09:00:00" },
  { id: 4, name: "Sprite lon 330ml", beverageTypeId: 2, beverageTypeName: "Nước ngọt", unitPrice: 15000, status: "Active", deleted: false, lastModified: "2024-01-15T09:00:00" },
  { id: 5, name: "Rượu vang đỏ Pháp 750ml", beverageTypeId: 3, beverageTypeName: "Rượu vang", unitPrice: 450000, status: "Active", deleted: false, lastModified: "2024-01-14T10:00:00" },
  { id: 6, name: "Rượu vang trắng Úc 750ml", beverageTypeId: 3, beverageTypeName: "Rượu vang", unitPrice: 380000, status: "Active", deleted: false, lastModified: "2024-01-14T10:00:00" },
  { id: 7, name: "Nước khoáng Aquafina 500ml", beverageTypeId: 4, beverageTypeName: "Nước suối", unitPrice: 8000, status: "Active", deleted: false, lastModified: "2024-01-13T09:00:00" },
  { id: 8, name: "Nước ép cam tươi", beverageTypeId: 5, beverageTypeName: "Nước ép", unitPrice: 45000, status: "Active", deleted: false, lastModified: "2024-01-12T11:00:00" },
  { id: 9, name: "Nước ép dưa hấu", beverageTypeId: 5, beverageTypeName: "Nước ép", unitPrice: 40000, status: "Inactive", deleted: false, lastModified: "2024-01-10T09:00:00" },
];

export const WEDDING_PACKAGES_INIT = [
  {
    id: 1,
    packageName: "Gói Vàng Vĩnh Cửu",
    description: "Gói tiệc cưới cao cấp với đầy đủ dịch vụ và menu thượng hạng, dành cho những đám cưới đẳng cấp và sang trọng nhất.",
    pricePerTable: 2500000,
    menuComboOptions: [1, 2],
    defaultMenuComboId: 2,
    includedServiceList: [
      { serviceId: 1, serviceName: "Professional Photography", price: 15000000 },
      { serviceId: 3, serviceName: "Floral Decoration Package", price: 12000000 },
    ],
    beverageAllowanceList: [
      { beverageId: 1, beverageName: "Bia Tiger", allowancePerTable: 2, unitPrice: 25000 },
      { beverageId: 5, beverageName: "Rượu vang đỏ Pháp 750ml", allowancePerTable: 1, unitPrice: 450000 },
      { beverageId: 7, beverageName: "Nước khoáng Aquafina 500ml", allowancePerTable: 4, unitPrice: 8000 },
    ],
    packageBenefitList: [
      "Miễn phí trang trí bàn tiệc cao cấp",
      "01 bánh cưới 3 tầng theo yêu cầu",
      "Quà tặng cặp đôi trị giá 2.000.000đ",
      "Chụp ảnh lưu niệm ngày cưới tặng kèm",
      "Ưu tiên chọn sảnh trước 6 tháng",
    ],
    conditionList: [
      "Đặt trước ít nhất 3 tháng",
      "Đặt cọc 30% tổng giá trị hợp đồng",
      "Áp dụng cho tiệc từ 30 bàn trở lên",
      "Không hoàn tiền nếu hủy trong vòng 30 ngày trước sự kiện",
      "Giá chưa bao gồm VAT 10%",
    ],
    status: "Active",
    deleted: false,
    lastModified: "2024-01-16T10:00:00",
  },
  {
    id: 2,
    packageName: "Gói Ngọc Trai Pha Lê",
    description: "Gói tiệc cưới trung cấp với menu đặc sắc và các dịch vụ chọn lọc phù hợp cho đám cưới trang nhã, ấm cúng.",
    pricePerTable: 1800000,
    menuComboOptions: [1],
    defaultMenuComboId: 1,
    includedServiceList: [
      { serviceId: 3, serviceName: "Floral Decoration Package", price: 12000000 },
      { serviceId: 5, serviceName: "Wedding Cake Design", price: 5000000 },
    ],
    beverageAllowanceList: [
      { beverageId: 1, beverageName: "Bia Tiger", allowancePerTable: 3, unitPrice: 25000 },
      { beverageId: 3, beverageName: "Coca Cola lon 330ml", allowancePerTable: 3, unitPrice: 15000 },
      { beverageId: 7, beverageName: "Nước khoáng Aquafina 500ml", allowancePerTable: 4, unitPrice: 8000 },
    ],
    packageBenefitList: [
      "Trang trí bàn tiệc tiêu chuẩn",
      "Voucher chụp ảnh cưới trị giá 5.000.000đ",
    ],
    conditionList: [
      "Đặt trước ít nhất 2 tháng",
      "Đặt cọc 30% tổng giá trị",
      "Tối thiểu 20 bàn tiệc",
    ],
    status: "Active",
    deleted: false,
    lastModified: "2024-01-15T09:00:00",
  },
  {
    id: 3,
    packageName: "Gói Di Sản Lụa",
    description: "Gói tiệc cưới phong cách truyền thống Việt Nam với menu đặc trưng và trang trí theo phong cách cổ điển, hoài niệm.",
    pricePerTable: 1450000,
    menuComboOptions: [1],
    defaultMenuComboId: 1,
    includedServiceList: [
      { serviceId: 5, serviceName: "Wedding Cake Design", price: 5000000 },
    ],
    beverageAllowanceList: [
      { beverageId: 1, beverageName: "Bia Tiger", allowancePerTable: 2, unitPrice: 25000 },
      { beverageId: 3, beverageName: "Coca Cola lon 330ml", allowancePerTable: 2, unitPrice: 15000 },
      { beverageId: 7, beverageName: "Nước khoáng Aquafina 500ml", allowancePerTable: 4, unitPrice: 8000 },
    ],
    packageBenefitList: [
      "Trang trí theo phong cách truyền thống Việt Nam",
      "Hỗ trợ tư vấn thực đơn miễn phí",
    ],
    conditionList: [
      "Đặt trước ít nhất 1 tháng",
      "Đặt cọc 20% tổng giá trị",
      "Tối thiểu 15 bàn tiệc",
    ],
    status: "Active",
    deleted: false,
    lastModified: "2024-01-12T14:00:00",
  },
];

// ── Payment mock data ─────────────────────────────────────────────────────────
export type PaymentStatus = "UNPROCESSED" | "PROCESSED" | "CANCELLED" | "REJECTED" | "FAILED";
export type PaymentType   = "DEPOSIT" | "PARTIAL_PAYMENT" | "FINAL_PAYMENT";
export type PaymentMethod = "Cash" | "Bank Transfer" | "Card";

export interface PaymentRecord {
  id: string; bookingId: string; customerName: string; customerPhone: string;
  paymentType: PaymentType; amount: number;
  paymentMethod: PaymentMethod | null; paymentDate: string | null;
  receivedAmount: number | null; changeAmount: number | null;
  referenceNumber: string | null; note: string | null;
  status: PaymentStatus;
  createdAt: string; processedAt: string | null; lastModifiedAt: string;
  cancelReason: string | null;
}

export const PAYMENT_LIST_INIT: PaymentRecord[] = [
  { id: "PAY-2401-001", bookingId: "BK2024001", customerName: "Nguyễn Văn An",   customerPhone: "0901 234 567", paymentType: "DEPOSIT",         amount: 30000000, paymentMethod: "Bank Transfer", paymentDate: "2024-01-20", receivedAmount: 30000000, changeAmount: 0,       referenceNumber: "MB20240120-001",  note: "Đặt cọc tiệc cưới",      status: "PROCESSED",   createdAt: "2024-01-20T09:00:00", processedAt: "2024-01-20T10:30:00", lastModifiedAt: "2024-01-20T10:30:00", cancelReason: null },
  { id: "PAY-2401-002", bookingId: "BK2024002", customerName: "Lê Hoàng Minh",   customerPhone: "0912 345 678", paymentType: "DEPOSIT",         amount: 40000000, paymentMethod: null,            paymentDate: null,         receivedAmount: null,     changeAmount: null,    referenceNumber: null,              note: null,                     status: "UNPROCESSED", createdAt: "2024-01-21T14:00:00", processedAt: null,                  lastModifiedAt: "2024-01-21T14:00:00", cancelReason: null },
  { id: "PAY-2401-003", bookingId: "BK2024003", customerName: "Trịnh Công Sơn",  customerPhone: "0923 456 789", paymentType: "DEPOSIT",         amount: 20000000, paymentMethod: "Cash",          paymentDate: "2024-01-22", receivedAmount: 20000000, changeAmount: 0,       referenceNumber: null,              note: null,                     status: "PROCESSED",   createdAt: "2024-01-22T10:00:00", processedAt: "2024-01-22T11:00:00", lastModifiedAt: "2024-01-22T11:00:00", cancelReason: null },
  { id: "PAY-2401-004", bookingId: "BK2024004", customerName: "Vũ Anh Tuấn",     customerPhone: "0934 567 890", paymentType: "DEPOSIT",         amount: 35000000, paymentMethod: "Bank Transfer", paymentDate: "2024-01-24", receivedAmount: 35000000, changeAmount: 0,       referenceNumber: "VCB20240124-009", note: null,                     status: "PROCESSED",   createdAt: "2024-01-24T09:00:00", processedAt: "2024-01-24T10:00:00", lastModifiedAt: "2024-01-24T10:00:00", cancelReason: null },
  { id: "PAY-2401-005", bookingId: "BK2024004", customerName: "Vũ Anh Tuấn",     customerPhone: "0934 567 890", paymentType: "PARTIAL_PAYMENT", amount: 30000000, paymentMethod: null,            paymentDate: null,         receivedAmount: null,     changeAmount: null,    referenceNumber: null,              note: null,                     status: "UNPROCESSED", createdAt: "2024-02-01T09:00:00", processedAt: null,                  lastModifiedAt: "2024-02-01T09:00:00", cancelReason: null },
  { id: "PAY-2401-006", bookingId: "BK2024005", customerName: "Hoàng Thị Lan",   customerPhone: "0945 678 901", paymentType: "DEPOSIT",         amount: 18000000, paymentMethod: "Cash",          paymentDate: "2024-01-08", receivedAmount: 20000000, changeAmount: 2000000, referenceNumber: null,              note: "Khách trả tiền mặt",     status: "PROCESSED",   createdAt: "2024-01-08T10:00:00", processedAt: "2024-01-08T10:30:00", lastModifiedAt: "2024-01-08T10:30:00", cancelReason: null },
  { id: "PAY-2401-007", bookingId: "BK2024005", customerName: "Hoàng Thị Lan",   customerPhone: "0945 678 901", paymentType: "FINAL_PAYMENT",   amount: 30000000, paymentMethod: "Bank Transfer", paymentDate: "2024-01-26", receivedAmount: 30000000, changeAmount: 0,       referenceNumber: "VCB20240126-018", note: "Thanh toán cuối",        status: "PROCESSED",   createdAt: "2024-01-26T09:00:00", processedAt: "2024-01-26T10:00:00", lastModifiedAt: "2024-01-26T10:00:00", cancelReason: null },
  { id: "PAY-2401-008", bookingId: "BK2024001", customerName: "Nguyễn Văn An",   customerPhone: "0901 234 567", paymentType: "PARTIAL_PAYMENT", amount: 25000000, paymentMethod: null,            paymentDate: null,         receivedAmount: null,     changeAmount: null,    referenceNumber: null,              note: null,                     status: "CANCELLED",   createdAt: "2024-01-28T13:00:00", processedAt: null,                  lastModifiedAt: "2024-01-28T15:00:00", cancelReason: "Khách yêu cầu hủy, thanh toán đợt sau" },
];

// ── Invoice mock data ─────────────────────────────────────────────────────────
export type InvoiceStatus        = "DRAFT" | "ISSUED" | "ADJUSTED" | "REJECTED";
export type InvoicePaymentStatus = "UNPAID" | "PARTIALLY_PAID" | "PAID";

export interface InvoiceLineItem {
  stt: number;
  description: string; // Tên hàng hóa / dịch vụ
  unit: string;        // ĐVT
  quantity: number;    // Số lượng
  unitPrice: number;   // Đơn giá (chưa thuế)
  amount: number;      // Thành tiền (chưa thuế)
  taxRate: number;     // Thuế suất % (8 hoặc 10)
  taxAmount: number;   // Tiền thuế
  category: "hall" | "service" | "food" | "beverage";
}

export interface InvoiceRecord {
  id: string; bookingId: string; customerName: string; customerPhone: string;
  buyerName: string; buyerLegalName: string; buyerTaxCode: string | null;
  buyerAddress: string; buyerEmail: string; buyerPhone: string;
  subtotalAmount: number; taxAmount: number; totalAmount: number;
  paymentStatus: InvoicePaymentStatus; status: InvoiceStatus;
  invoiceNumber: string | null; invoiceSymbol: string | null;
  createdAt: string; issuedAt: string | null; lastModifiedAt: string;
  lineItems?: InvoiceLineItem[];
}

export const INVOICE_LIST_INIT: InvoiceRecord[] = [
  {
    id: "INV-2024-001", bookingId: "BK2024005", customerName: "Hoàng Thị Lan", customerPhone: "0945 678 901",
    buyerName: "Bùi Quang Huy", buyerLegalName: "Cá nhân", buyerTaxCode: null,
    buyerAddress: "45 Lê Lợi, Quận 1, TP. Hồ Chí Minh", buyerEmail: "lan.hoang@hotmail.com", buyerPhone: "0945 678 901",
    subtotalAmount: 48_000_000, taxAmount: 4_240_000, totalAmount: 52_240_000,
    paymentStatus: "PARTIALLY_PAID", status: "ISSUED",
    invoiceNumber: "0001234", invoiceSymbol: "01GTKT0/001",
    createdAt: "2024-01-29T10:00:00", issuedAt: "2024-01-29T11:30:00", lastModifiedAt: "2024-01-29T11:30:00",
    lineItems: [
      // ── Nhóm thuế 10% (dịch vụ) ──
      { stt: 1, description: "Cho thuê sảnh Pearl Hall — Ca chiều (13:00–17:30)", unit: "Buổi",   quantity: 1,   unitPrice: 10_000_000, amount: 10_000_000, taxRate: 10, taxAmount: 1_000_000, category: "hall"    },
      { stt: 2, description: "Trang trí hoa tươi & đèn sân khấu cao cấp",         unit: "Gói",    quantity: 1,   unitPrice:  4_000_000, amount:  4_000_000, taxRate: 10, taxAmount:   400_000, category: "service" },
      { stt: 3, description: "Chụp ảnh cưới & quay phim chuyên nghiệp",           unit: "Ca",     quantity: 1,   unitPrice:  6_000_000, amount:  6_000_000, taxRate: 10, taxAmount:   600_000, category: "service" },
      // ── Nhóm thuế 8% (thực phẩm & đồ uống) ──
      { stt: 4, description: "Thực đơn tiệc cưới Gói Vàng Vĩnh Cửu (5 món/bàn)", unit: "Bàn",    quantity: 25,  unitPrice:    950_000, amount: 23_750_000, taxRate:  8, taxAmount: 1_900_000, category: "food"    },
      { stt: 5, description: "Bia Tiger lon 330ml",                                unit: "Chai",   quantity: 75,  unitPrice:     25_000, amount:  1_875_000, taxRate:  8, taxAmount:   150_000, category: "beverage"},
      { stt: 6, description: "Nước ngọt Coca-Cola lon 330ml",                     unit: "Lon",    quantity: 50,  unitPrice:     15_000, amount:    750_000, taxRate:  8, taxAmount:    60_000, category: "beverage"},
      { stt: 7, description: "Nước khoáng Aquafina 500ml",                        unit: "Chai",   quantity: 100, unitPrice:      8_000, amount:    800_000, taxRate:  8, taxAmount:    64_000, category: "beverage"},
      { stt: 8, description: "Bánh cưới trang trí 5 tầng (phục vụ 200 khách)",   unit: "Cái",    quantity: 1,   unitPrice:    825_000, amount:    825_000, taxRate:  8, taxAmount:    66_000, category: "food"    },
    ],
  },
];