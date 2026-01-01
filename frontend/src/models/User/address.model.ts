// ./User/address.model.ts

/* =======================
   PROVINCE MODEL
   ======================= */
export interface Province {
  id: number;               // INT PRIMARY KEY
  name: string;            // VARCHAR(50)
  code: string;            // VARCHAR(10) UNIQUE
}

/* =======================
   COMMUNE MODEL
   ======================= */
export interface Commune {
  id: number;               // INT PRIMARY KEY
  provinceId: number;      // province_id INT
  name: string;            // VARCHAR(50)
  code: string;            // VARCHAR(10) UNIQUE
  province?: Province;     // Populated province object
}

/* =======================
   ADDRESS MODEL
   ======================= */
export interface Address {
  id: number;               // BIGINT AUTO_INCREMENT PRIMARY KEY
  userId: string;          // user_id VARCHAR(10)
  label: string;           // label VARCHAR(50)
  receiverName: string;    // receiver_name VARCHAR(50)
  phone: string;           // phone CHAR(10)
  streetAddress: string;   // street_address VARCHAR(255)
  communeId?: number;      // commune_id INT NULL
  isDefault: boolean;      // is_default BOOLEAN
  createdAt: string;       // created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  
  // Populated fields (optional)
  commune?: Commune;       // Populated commune object
}

/* =======================
   ADDRESS WITH FULL LOCATION INFO
   ======================= */
export interface AddressFull extends Address {
  province?: Province;     // Populated province object
  fullAddress: string;     // Formatted full address
}

/* =======================
   UTILITY FUNCTIONS
   ======================= */
export const formatPhoneNumber = (phone: string): string => {
  // Format: 090 123 4567
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `${cleaned.substring(0, 3)} ${cleaned.substring(3, 6)} ${cleaned.substring(6)}`;
  }
  return phone;
};

export const formatAddress = (address: AddressFull): string => {
  const parts = [
    address.streetAddress,
    address.commune?.name,
    address.province?.name,
  ].filter(Boolean);
  return parts.join(', ');
};

export const getAddressLabel = (address: Address): string => {
  return `${address.label} - ${address.receiverName} (${address.phone})`;
};

/* =======================
   SAMPLE DATA
   ======================= */

export const sampleProvinces: Province[] = [
  { id: 1, name: "Thành phố Hồ Chí Minh", code: "SG" },
  { id: 2, name: "Hà Nội", code: "HN" },
  { id: 3, name: "Đà Nẵng", code: "DN" },
  { id: 4, name: "Cần Thơ", code: "CT" },
  { id: 5, name: "Hải Phòng", code: "HP" },
  { id: 6, name: "Bình Dương", code: "BD" },
  { id: 7, name: "Đồng Nai", code: "DNai" },
  { id: 8, name: "Bà Rịa - Vũng Tàu", code: "VT" },
  { id: 9, name: "Khánh Hòa", code: "KH" },
  { id: 10, name: "Thừa Thiên Huế", code: "TTH" },
];

export const sampleCommunes: Commune[] = [
  // Hồ Chí Minh (id: 1)
  { id: 1, provinceId: 1, name: "Phường Bến Nghé", code: "Q1-BN" },
  { id: 2, provinceId: 1, name: "Phường Đa Kao", code: "Q1-DK" },
  { id: 3, provinceId: 1, name: "Phường Bến Thành", code: "Q1-BT" },
  { id: 4, provinceId: 1, name: "Phường Nguyễn Thái Bình", code: "Q1-NTB" },
  { id: 5, provinceId: 1, name: "Phường Phạm Ngũ Lão", code: "Q1-PNL" },
  { id: 6, provinceId: 1, name: "Phường Cầu Ông Lãnh", code: "Q1-COL" },
  
  // Hà Nội (id: 2)
  { id: 7, provinceId: 2, name: "Phường Dịch Vọng", code: "CG-DV" },
  { id: 8, provinceId: 2, name: "Phường Dịch Vọng Hậu", code: "CG-DVH" },
  { id: 9, provinceId: 2, name: "Phường Quan Hoa", code: "CG-QH" },
  { id: 10, provinceId: 2, name: "Phường Nghĩa Đô", code: "CG-ND" },
  { id: 11, provinceId: 2, name: "Phường Nghĩa Tân", code: "CG-NT" },
  { id: 12, provinceId: 2, name: "Phường Mai Dịch", code: "CG-MD" },
  
  // Đà Nẵng (id: 3)
  { id: 13, provinceId: 3, name: "Phường Thanh Bình", code: "HC-TB" },
  { id: 14, provinceId: 3, name: "Phường Thuận Phước", code: "HC-TP" },
  { id: 15, provinceId: 3, name: "Phường Hải Châu 1", code: "HC-HC1" },
  { id: 16, provinceId: 3, name: "Phường Hải Châu 2", code: "HC-HC2" },
  { id: 17, provinceId: 3, name: "Phường Phước Ninh", code: "HC-PN" },
  { id: 18, provinceId: 3, name: "Phường Thạch Thang", code: "HC-TT" },
  
  // Cần Thơ (id: 4)
  { id: 19, provinceId: 4, name: "Phường Tân An", code: "NK-TA" },
  { id: 20, provinceId: 4, name: "Phường An Bình", code: "NK-AB" },
  { id: 21, provinceId: 4, name: "Phường An Khánh", code: "NK-AK" },
  
  // Hải Phòng (id: 5)
  { id: 22, provinceId: 5, name: "Phường Máy Chai", code: "NG-MC" },
  { id: 23, provinceId: 5, name: "Phường Máy Tơ", code: "NG-MT" },
  { id: 24, provinceId: 5, name: "Phường Vạn Mỹ", code: "NG-VM" },
];

// Populate commune provinces
sampleCommunes.forEach(commune => {
  commune.province = sampleProvinces.find(p => p.id === commune.provinceId);
});

export const sampleAddresses: Address[] = [
  {
    id: 1,
    userId: "U001",
    label: "Nhà riêng",
    receiverName: "Nguyễn Văn Admin",
    phone: "0901234567",
    streetAddress: "123 Đường Lê Lợi, Tầng 5",
    communeId: 1,
    isDefault: true,
    createdAt: "2025-01-01T08:00:00",
  },
  {
    id: 2,
    userId: "U001",
    label: "Công ty",
    receiverName: "Nguyễn Văn Admin",
    phone: "0901234567",
    streetAddress: "456 Đường Nguyễn Huệ",
    communeId: 2,
    isDefault: false,
    createdAt: "2025-01-10T09:30:00",
  },
  {
    id: 3,
    userId: "U002",
    label: "Nhà riêng",
    receiverName: "Trần Thị User",
    phone: "0912345678",
    streetAddress: "789 Đường Trần Duy Hưng",
    communeId: 7,
    isDefault: true,
    createdAt: "2025-01-03T10:30:00",
  },
  {
    id: 4,
    userId: "U002",
    label: "Nhà bố mẹ",
    receiverName: "Trần Thị User",
    phone: "0912345678",
    streetAddress: "101 Đường Láng",
    communeId: 9,
    isDefault: false,
    createdAt: "2025-01-05T14:20:00",
  },
  {
    id: 5,
    userId: "U003",
    label: "Văn phòng",
    receiverName: "Lê Văn Khách",
    phone: "0923456789",
    streetAddress: "202 Đường Nguyễn Văn Linh",
    communeId: 13,
    isDefault: true,
    createdAt: "2025-01-08T16:45:00",
  },
];

// Create AddressFull objects
export const getAddressFull = (address: Address): AddressFull => {
  const commune = sampleCommunes.find(c => c.id === address.communeId);
  const province = commune ? sampleProvinces.find(p => p.id === commune.provinceId) : undefined;
  
  return {
    ...address,
    commune,
    province,
    fullAddress: formatAddress({
      ...address,
      commune,
      province,
      fullAddress: ""
    } as AddressFull)
  };
};

export const sampleAddressesFull: AddressFull[] = sampleAddresses.map(getAddressFull);

/* =======================
   CONSTANTS
   ======================= */
export const ADDRESS_LABELS = [
  "Nhà riêng",
  "Công ty",
  "Nhà bố mẹ",
  "Nhà bạn",
  "Văn phòng",
  "Khác"
] as const;

export type AddressLabel = typeof ADDRESS_LABELS[number];

export const MAX_ADDRESSES_PER_USER = 5;

/* =======================
   EXPORT ALL
   ======================= */
export type {
  Province as ProvinceModel,
  Commune as CommuneModel,
  Address as AddressModel,
  AddressFull as AddressFullModel,
};