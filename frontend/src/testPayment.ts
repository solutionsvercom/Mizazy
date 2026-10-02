import { CartItem } from "./data";
import { MIZAZY_LOGO_URL } from "./brand";

export const TEST_PAYMENT_ID = "mizazy-payment-test";

export const getAdminSessionToken = () => localStorage.getItem("mizazy_admin_token");

export const isTestPaymentCart = (cart: CartItem[]) => cart.some((i) => i.product.id === TEST_PAYMENT_ID);

export function testPaymentCartItem(): CartItem {
  return {
    product: {
      id: TEST_PAYMENT_ID,
      name: "Cashfree Test Payment",
      tagline: "₹1 payment to verify the live payment setup",
      description: "",
      price: 1,
      mrp: 1,
      rating: 0,
      reviews: 0,
      image: MIZAZY_LOGO_URL,
      images: [],
      colors: [],
      colorNames: [],
      category: "test",
      features: [],
      specs: {},
      inBox: [],
    },
    quantity: 1,
    color: "",
    colorName: "Test",
  };
}
