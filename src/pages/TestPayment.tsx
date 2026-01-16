
import { useEffect, useRef, useState } from "react";
import { loadPaymentWidget, PaymentWidgetInstance } from "@tosspayments/payment-widget-sdk";
import { Button } from "@/components/ui/button";

const clientKey = "test_ck_D5GePWvyJnrK0W0k6q8gLzN97Eoq"; // Mock Test Key
const customerKey = "YbX2HuSlsC9uVJW6NMRMj"; // Random customer key

export default function TestPayment() {
    const paymentWidgetRef = useRef<PaymentWidgetInstance | null>(null);
    const paymentMethodsWidgetRef = useRef<ReturnType<
        PaymentWidgetInstance["renderPaymentMethods"]
    > | null>(null);
    const [price, setPrice] = useState(1000);

    useEffect(() => {
        (async () => {
            // 1. Load the payment widget
            const paymentWidget = await loadPaymentWidget(clientKey, customerKey);

            // 2. Render payment methods
            const paymentMethodsWidget = paymentWidget.renderPaymentMethods(
                "#payment-widget",
                { value: price },
                { variantKey: "DEFAULT" } // Use default variant from console
            );

            // 3. Render agreement
            paymentWidget.renderAgreement("#agreement", { variantKey: "AGREEMENT" });

            paymentWidgetRef.current = paymentWidget;
            paymentMethodsWidgetRef.current = paymentMethodsWidget;
        })();
    }, []);

    useEffect(() => {
        const paymentMethodsWidget = paymentMethodsWidgetRef.current;

        if (paymentMethodsWidget == null) {
            return;
        }

        // Update amount if price changes
        paymentMethodsWidget.updateAmount(price);
    }, [price]);

    const handlePayment = async () => {
        const paymentWidget = paymentWidgetRef.current;

        try {
            // Request payment
            await paymentWidget?.requestPayment({
                orderId: "ORDER_ID_" + new Date().getTime(),
                orderName: "Tarot Reading Fee",
                customerName: "Anonymous User",
                customerEmail: "customer@example.com",
                successUrl: window.location.origin + "/payment/success",
                failUrl: window.location.origin + "/payment/fail",
            });
        } catch (error) {
            console.error("Payment Error:", error);
        }
    };

    return (
        <div className="min-h-screen bg-neutral-900 text-white p-8 flex flex-col items-center">
            <h1 className="text-2xl font-bold mb-8">Toss Payments Integration Test</h1>

            <div className="w-full max-w-md bg-white rounded-xl p-4 mb-4">
                {/* Payment Widget Container */}
                <div id="payment-widget" />
                <div id="agreement" />
            </div>

            <div className="flex gap-4 mb-8">
                <Button
                    variant="outline"
                    onClick={() => setPrice(1000)}
                    className={price === 1000 ? "bg-gray-700" : ""}
                >
                    1,000 KRW
                </Button>
                <Button
                    variant="outline"
                    onClick={() => setPrice(5000)}
                    className={price === 5000 ? "bg-gray-700" : ""}
                >
                    5,000 KRW
                </Button>
            </div>

            <Button
                onClick={handlePayment}
                className="w-full max-w-md h-12 text-lg font-bold bg-blue-500 hover:bg-blue-600"
            >
                Pay {price.toLocaleString()} KRW
            </Button>
        </div>
    );
}
