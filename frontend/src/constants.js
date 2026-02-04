// Product Categories
export const CATEGORIES = [
    { value: 'charm', label: 'ชาร์ม (Charm)', colorBg: 'bg-purple-50', colorText: 'text-purple-700' },
    { value: 'bracelet', label: 'สร้อยข้อมือ (Bracelet)', colorBg: 'bg-blue-50', colorText: 'text-blue-700' },
    { value: 'necklace', label: 'สร้อยคอ (Necklace)', colorBg: 'bg-gray-100', colorText: 'text-gray-600' }
];

// Product Statuses
export const PRODUCT_STATUSES = [
    { value: 'active', label: 'เปิดขาย (Active)', labelShort: 'ขายอยู่', colorText: 'text-green-600' },
    { value: 'inactive', label: 'ปิดการขาย (Inactive)', labelShort: 'ปิดการขาย', colorText: 'text-gray-400' }
];

// Product Types
export const PRODUCT_TYPES = [
    {
        id: 'single',
        title: 'สินค้าชิ้นเดียว',
        desc: 'เช่น สร้อย 1 ขนาด',
        icon: 'fa-tag',
        colorBg: 'bg-blue-100',
        colorText: 'text-blue-600',
    },
    {
        id: 'variant',
        title: 'มีตัวเลือก',
        desc: 'เช่น ชาร์มหลายสี',
        icon: 'fa-layer-group',
        colorBg: 'bg-purple-100',
        colorText: 'text-purple-600',
    },
    {
        id: 'bundle',
        title: 'สินค้าจัดเซต',
        desc: 'ตัดสต็อกลูกอัตโนมัติ',
        icon: 'fa-gift',
        colorBg: 'bg-orange-100',
        colorText: 'text-orange-600',
    },
];

// Sort Options
export const SORT_OPTIONS = [
    { value: 'newest', label: 'ล่าสุด (Newest)' },
    { value: 'oldest', label: 'เก่าที่สุด (Oldest)' },
    { value: 'stock_desc', label: 'จำนวนสินค้ามาก - น้อย' },
    { value: 'stock_asc', label: 'จำนวนสินค้าน้อย - มาก' }
];

// Stock Movement Types
export const STOCK_MOVEMENT_TYPES = {
    IN: { label: 'รับเข้า', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100', prefix: '+' },
    OUT: { label: 'ขายออก', color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-100', prefix: '-' },
    ADJUST: { label: 'ปรับยอด', color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-100', prefix: '' },
    RETURN: { label: 'รับคืน', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100', prefix: '+' }
};

// Dashboard Text
export const DASHBOARD_TEXT = {
    TITLE: 'ระบบจัดการสินค้า',
    POS_BUTTON: 'เปิดหน้าขายสินค้า (POS)',
    STATS: {
        TOTAL_COST: 'ต้นทุนสินค้าทั้งหมด',
        TOTAL_PRODUCTS: 'สินค้าทั้งหมด',
        NEW_PRODUCTS: 'สินค้ามาใหม่วันนี้',
        LOW_STOCK: 'สินค้าใกล้หมด'
    }
};

// Menu Items
export const MENU_ITEMS = [
    {
        to: '/add-product',
        title: 'เพิ่มสินค้าใหม่',
        desc: 'สร้างรายการสินค้าและ SKUs',
        icon: 'Plus',
        colorClass: 'indigo',
        decorativeClass: 'bg-indigo-50'
    },
    {
        to: '/stock',
        title: 'สินค้าทั้งหมด',
        desc: 'จัดการและแก้ไขข้อมูลสินค้า',
        icon: 'List',
        colorClass: 'blue',
        decorativeClass: 'bg-blue-50'
    },
    {
        to: '/receive-stock',
        title: 'เติมสินค้า',
        desc: 'รับสินค้าเข้าสต็อกและพิมพ์บาร์โค้ด',
        icon: 'Package',
        colorClass: 'green',
        decorativeClass: 'bg-green-50'
    }
];

export const DEFAULT_CATEGORY = 'charm';
export const DEFAULT_STATUS = 'active';
export const DEFAULT_REQUESTER = 'Admin';
