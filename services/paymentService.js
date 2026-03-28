import { Linking } from "react-native";
import api from "./api";

const ESEWA_DEEP_LINK_PATH = "payments/esewa";
const FALLBACK_ESEWA_CALLBACK_URL = "neapaw://payments/esewa";
const VERIFY_RETRY_DELAY_MS = 2000;
const VERIFY_RETRY_ATTEMPTS = 6;

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const getEsewaCallbackUrl = async () => {
  try {
    const initialUrl = await Linking.getInitialURL();

    if (!initialUrl) {
      return FALLBACK_ESEWA_CALLBACK_URL;
    }

    const [baseUrl] = initialUrl.split("?");
    const expoBase = baseUrl.includes("/--/")
      ? baseUrl.split("/--/")[0]
      : baseUrl.replace(/\/+$/, "");

    if (expoBase.startsWith("exp://") || expoBase.startsWith("exps://")) {
      return `${expoBase}/--/${ESEWA_DEEP_LINK_PATH}`;
    }

    if (expoBase.startsWith("neapaw://")) {
      return FALLBACK_ESEWA_CALLBACK_URL;
    }

    return `${expoBase}/${ESEWA_DEEP_LINK_PATH}`;
  } catch (error) {
    return FALLBACK_ESEWA_CALLBACK_URL;
  }
};

const parseEsewaUrl = (url) => {
  try {
    const normalizedUrl = url.includes("/--/")
      ? url.replace("/--/", "/")
      : url;
    const queryString = normalizedUrl.split("?")[1] || "";
    const searchParams = new URLSearchParams(queryString);
    return {
      status: searchParams.get("status"),
      orderId: searchParams.get("order_id"),
      transactionUuid: searchParams.get("transaction_uuid"),
    };
  } catch (error) {
    return {
      status: null,
      orderId: null,
      transactionUuid: null,
    };
  }
};

const waitForEsewaRedirect = (callbackPrefix) =>
  new Promise((resolve) => {
    const timeoutId = setTimeout(() => {
      subscription?.remove?.();
      resolve({ status: "timeout" });
    }, 180000);

    const subscription = Linking.addEventListener("url", ({ url }) => {
      if (!url?.startsWith(callbackPrefix)) {
        return;
      }

      clearTimeout(timeoutId);
      subscription.remove?.();
      resolve(parseEsewaUrl(url));
    });
  });

export const paymentService = {
  initiateEsewa: async (orderId) => {
    const callbackUrl = await getEsewaCallbackUrl();
    const response = await api.post(`orders/list/${orderId}/esewa/initiate/`, {
      callback_url: callbackUrl,
    });
    return response.data;
  },

  verifyEsewa: async (orderId, transactionUuid) => {
    const response = await api.get(`orders/list/${orderId}/esewa/verify/`, {
      params: transactionUuid ? { transaction_uuid: transactionUuid } : undefined,
    });
    return response.data;
  },

  getOrderPaymentState: async (orderId) => {
    const response = await api.get(`orders/list/${orderId}/`);
    return response.data;
  },

  waitForPaidOrderState: async (orderId) => {
    let lastOrderState = null;

    for (let attempt = 0; attempt < VERIFY_RETRY_ATTEMPTS; attempt += 1) {
      lastOrderState = await paymentService.getOrderPaymentState(orderId);

      if (String(lastOrderState?.payment_status || "").toLowerCase() === "paid") {
        return lastOrderState;
      }

      if (attempt < VERIFY_RETRY_ATTEMPTS - 1) {
        await wait(VERIFY_RETRY_DELAY_MS);
      }
    }

    return lastOrderState;
  },

  verifyEsewaWithRetry: async (orderId, transactionUuid) => {
    let lastVerification = null;

    for (let attempt = 0; attempt < VERIFY_RETRY_ATTEMPTS; attempt += 1) {
      lastVerification = await paymentService.verifyEsewa(orderId, transactionUuid);

      const paymentState = String(lastVerification?.payment_status || "").toLowerCase();
      const providerState = String(lastVerification?.status || "").toUpperCase();

      if (paymentState === "paid" || providerState === "COMPLETE") {
        return lastVerification;
      }

      if (attempt < VERIFY_RETRY_ATTEMPTS - 1) {
        await wait(VERIFY_RETRY_DELAY_MS);
      }
    }

    return lastVerification;
  },

  payWithEsewa: async (orderId) => {
    const payload = await paymentService.initiateEsewa(orderId);
    const callbackPrefix = await getEsewaCallbackUrl();
    const redirectPromise = waitForEsewaRedirect(callbackPrefix);

    await Linking.openURL(payload.checkout_url);
    const redirectResult = await redirectPromise;

    const orderState = await paymentService.waitForPaidOrderState(orderId);

    if (String(orderState?.payment_status || "").toLowerCase() === "paid") {
      return {
        success: true,
        stage: "order_state",
        order: orderState,
        orderNumber: payload.order_number,
        transactionUuid: redirectResult.transactionUuid || payload.transaction_uuid,
      };
    }

    const verification = await paymentService.verifyEsewaWithRetry(
      orderId,
      redirectResult.transactionUuid || payload.transaction_uuid
    );

    return {
      success:
        String(verification?.payment_status || "").toLowerCase() === "paid" ||
        String(verification?.status || "").toUpperCase() === "COMPLETE",
      stage: redirectResult.status === "success" ? "verification" : "redirect_verification",
      verification,
      orderNumber: payload.order_number,
      transactionUuid: redirectResult.transactionUuid || payload.transaction_uuid,
      redirectStatus: redirectResult.status,
    };
  },
};
