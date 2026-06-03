export interface Comment {
  id: string;
  author: string;
  content: string;
  date: string;
}

export interface Post {
  id: string;
  title: string;
  content: string;
  category: string;
  date: string;
  comments: Comment[];
  image?: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  allowedCheckoutMode?: 'both' | 'direct_only' | 'chat_only';
  instagramLink?: string;
  messengerLink?: string;
  whatsAppLink?: string;
}

export interface PaymentSettings {
  activeMethod: 'upi' | 'bank' | 'gpay_qr';
  gpayUpid: string;
  gpayName: string;
  bankName: string;
  bankAccount: string;
  bankIfsc: string;
  useBackupQr: boolean;
  instagramLink?: string;
  messengerLink?: string;
  whatsAppLink?: string;
  enableWhatsApp?: boolean;
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  items: OrderItem[];
  total: number;
  paymentMethodUsed: string;
  paymentDetails: {
    transactionId: string;
    timestamp: string;
    bankName?: string;
    accountLast4?: string;
  };
  status: 'Pending' | 'In Progress' | 'Completed' | 'Cancelled';
  emailSent: boolean;
  emailRecipient: string;
  date: string;
  customFields?: Record<string, string>;
}

export interface SalesStats {
  totalSales: number;
  totalOrders: number;
  verifiedOrders: number;
  pendingOrders: number;
  categorySales: { category: string; amount: number }[];
  dailyRevenue: { date: string; amount: number }[];
}

export interface SiteTexts {
  brandName: string;
  subLabel: string;
  heroPill: string;
  heroTitle: string;
  heroDescription: string;
  heroButton: string;
  footerCopyrightName: string;
}
