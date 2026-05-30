export interface VnpayDemoCardData {
  cardNumber: string;
  cardHolder: string;
  expiryDate: string;
}

const STORAGE_KEY = "vnpay_demo_card_data";

export const vnpayDemoStorage = {
  setCardData(data: VnpayDemoCardData) {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  },

  getCardData(): VnpayDemoCardData | null {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as VnpayDemoCardData;
    } catch {
      return null;
    }
  },

  clear() {
    sessionStorage.removeItem(STORAGE_KEY);
  }
};
