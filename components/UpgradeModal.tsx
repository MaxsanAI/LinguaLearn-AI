import React, { useState, useEffect, useRef } from 'react';
import { useTranslations } from '../hooks/useTranslations';

type Plan = 'monthly' | 'yearly';

const CloseIcon: React.FC<{ className?: string }> = ({ className }) => ( <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}><path fillRule="evenodd" d="M5.47 5.47a.75.75 0 0 1 1.06 0L12 10.94l5.47-5.47a.75.75 0 1 1 1.06 1.06L13.06 12l5.47 5.47a.75.75 0 1 1-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 0 1-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" /></svg>);
const CheckIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.052-.143Z" clipRule="evenodd" />
    </svg>
);

const prices: Record<Plan, number> = {
    monthly: 3.99,
    yearly: 29.99,
};
const CURRENCY = 'EUR';

declare global {
    interface Window {
        paypal: any;
    }
}

export const UpgradeModal: React.FC<{ onClose: () => void; onUpgradeSuccess: (plan: Plan) => void; }> = ({ onClose, onUpgradeSuccess }) => {
    const { t } = useTranslations();
    const [selectedPlan, setSelectedPlan] = useState<Plan>('yearly');
    const [error, setError] = useState<string | null>(null);
    const [isSdkReady, setIsSdkReady] = useState(false);
    const paypalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const clientId = "AccwP1mnoyIbXDPhobeROQDiYaZ4CPvtPyLHCwz6b2jVFlYu9KTlSj1_hyY8981GAz_lxq5ByMz3EL6S";
        
        const addPaypalScript = () => {
             if (window.paypal) {
                setIsSdkReady(true);
                return;
            }
            if (document.getElementById('paypal-sdk-script')) {
                return;
            }

            const script = document.createElement('script');
            script.id = 'paypal-sdk-script';
            script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}`;
            script.async = true;
            
            script.onload = () => {
                setIsSdkReady(true);
            };
            script.onerror = (err: any) => {
                console.error("PayPal SDK could not be loaded.", err);
                setError(t.payment_technical_error);
            };

            document.body.appendChild(script);
        };
        
        addPaypalScript();

    }, [t.payment_technical_error]);

    useEffect(() => {
        if (isSdkReady && paypalRef.current && !error) {
            paypalRef.current.innerHTML = '';
            
            try {
                if (!window.paypal || !window.paypal.Buttons) {
                    throw new Error("PayPal Buttons not available");
                }
                window.paypal.Buttons({
                    createOrder: (_data: any, actions: any) => {
                        return actions.order.create({
                            intent: 'CAPTURE',
                            purchase_units: [{
                                description: `LinguaLearn Premium (${selectedPlan})`,
                                amount: {
                                    currency_code: CURRENCY,
                                    value: prices[selectedPlan].toString(),
                                }
                            }]
                        });
                    },
                    onApprove: async (_data: any, actions: any) => {
                        try {
                            const order = await actions.order.capture();
                            console.log('Payment successful:', order);
                            onUpgradeSuccess(selectedPlan);
                        } catch (err: any) {
                            console.error('Payment approval error:', err);
                            setError(t.payment_error);
                        }
                    },
                    onError: (err: any) => {
                        console.error('PayPal Button Error:', err);
                        setError(t.payment_technical_error);
                    }
                }).render(paypalRef.current).catch((err: any) => {
                    console.error("Failed to render PayPal Buttons:", err);
                    setError(t.payment_technical_error);
                });
            } catch (err: any) {
                 console.error("Error initializing PayPal Buttons:", err);
                 setError(t.payment_technical_error);
            }
        }
    }, [isSdkReady, selectedPlan, onUpgradeSuccess, t.payment_error, t.payment_technical_error, error]);

    const PlanButton: React.FC<{ plan: Plan; price: string; details: string; isPopular?: boolean; }> = ({ plan, price, details, isPopular }) => (
        <button
            onClick={() => setSelectedPlan(plan)}
            className={`relative w-full text-left p-4 border-2 rounded-xl transition-colors ${selectedPlan === plan ? 'border-indigo-600 bg-indigo-50' : 'border-slate-300 hover:border-slate-400'}`}
        >
            {isPopular && (
                <div className="absolute -top-3 right-4 bg-indigo-600 text-white text-xs font-bold px-2 py-1 rounded-full">{t.most_popular}</div>
            )}
            <p className="text-lg font-bold">{plan === 'yearly' ? t.upgrade_yearly : t.upgrade_monthly}</p>
            <p className="text-xl font-extrabold text-indigo-600">{price}</p>
            <p className="text-sm text-slate-500">{details}</p>
        </button>
    );
    
    return (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/60 backdrop-blur-md" onClick={onClose}>
            <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl m-4" onClick={e => e.stopPropagation()}>
                <header className="flex items-center justify-between p-5 border-b">
                    <h2 className="text-2xl font-bold">{t.premium_modal_title}</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100"><CloseIcon className="w-6 h-6" /></button>
                </header>
                <div className="p-6">
                    <ul className="space-y-3 mb-6">
                        {[t.premium_feature_1, t.premium_feature_2, t.premium_feature_3].map((feature, i) => (
                             <li key={i} className="flex items-center gap-3">
                                <CheckIcon className="w-5 h-5 text-green-500" />
                                <span className="text-slate-700">{feature}</span>
                            </li>
                        ))}
                    </ul>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                        <PlanButton plan="monthly" price={t.price_monthly} details="" />
                        <PlanButton plan="yearly" price={t.price_yearly} details={t.billed_annually} isPopular />
                    </div>
                    {error && <p className="text-center text-red-500 text-sm mb-4">{error}</p>}

                    {!isSdkReady && !error && (
                         <div className="min-h-[100px] flex items-center justify-center">
                            <div className="w-8 h-8 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin"></div>
                        </div>
                    )}
                    
                    <div ref={paypalRef} className={`min-h-[50px] ${error ? 'hidden' : ''}`}></div>
                </div>
            </div>
        </div>
    );
};