
import React, { useState, useEffect } from 'react';
import { X, Gift, PartyPopper } from 'lucide-react';
import { Link } from 'react-router-dom';
import { API_BASE_URL } from '../App';
import confetti from 'canvas-confetti';

interface Offer {
    name: string;
    description: string;
    discountType: 'fixed' | 'percentage';
    discountValue: number;
    applicablePlans: string[];
    isActive: boolean;
    validUntil?: string;
}

import { useUIStore } from '../store/useUIStore';

// ... (existing helper function if any, though none here)

const OfferDialog: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [offer, setOffer] = useState<Offer | null>(null);
    const [isVisible, setIsVisible] = useState(false);
    const setHasSeenOffer = useUIStore((state) => state.setHasSeenOffer);

    useEffect(() => {
        const fetchOffer = async () => {
            try {
                // We want to show the offer on every refresh/mount, so we don't check hasSeenOffer here.
                // However, we reset the store state to false so the notification icon hides while dialog is open.

                const response = await fetch(`${API_BASE_URL}/api/settings/offers`);
                if (!response.ok) return;

                const data = await response.json();
                if (data.status === 'success' && data.data.offers && data.data.offers.length > 0) {
                    const activeOffer = data.data.offers[0];
                    setOffer(activeOffer);

                    // Reset seen status so notification icon doesn't show while dialog is active
                    setHasSeenOffer(false);

                    setTimeout(() => {
                        setIsOpen(true);
                        setTimeout(() => setIsVisible(true), 10);
                    }, 1500);
                }
            } catch (error) {
                console.error('Failed to fetch offers', error);
            }
        };

        fetchOffer();
    }, [setHasSeenOffer]);

    const handleClose = () => {
        setIsVisible(false);
        setTimeout(() => {
            setIsOpen(false);
            // Mark as seen to show the notification icon
            setHasSeenOffer(true);
        }, 300);
    };

    const [timeLeft, setTimeLeft] = useState<{
        days: number;
        hours: number;
        minutes: number;
        seconds: number;
    } | null>(null);

    useEffect(() => {
        if (isVisible) {
            // Trigger celebration confetti
            const count = 200;
            const defaults = {
                origin: { y: 0.7 }
            };

            function fire(particleRatio: number, opts: any) {
                confetti({
                    ...defaults,
                    ...opts,
                    particleCount: Math.floor(count * particleRatio)
                });
            }

            fire(0.25, {
                spread: 26,
                startVelocity: 55,
            });
            fire(0.2, {
                spread: 60,
            });
            fire(0.35, {
                spread: 100,
                decay: 0.91,
                scalar: 0.8
            });
            fire(0.1, {
                spread: 120,
                startVelocity: 25,
                decay: 0.92,
                scalar: 1.2
            });
            fire(0.1, {
                spread: 120,
                startVelocity: 45,
            });
        }
    }, [isVisible]);

    useEffect(() => {
        if (offer?.validUntil) {
            const calculateTimeLeft = () => {
                const difference = +new Date(offer.validUntil!) - +new Date();

                if (difference > 0) {
                    return {
                        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                        minutes: Math.floor((difference / 1000 / 60) % 60),
                        seconds: Math.floor((difference / 1000) % 60),
                    };
                }
                return null;
            };

            // Initial calculation
            setTimeLeft(calculateTimeLeft());

            // Update every second
            const timer = setInterval(() => {
                const remaining = calculateTimeLeft();
                setTimeLeft(remaining);
                if (!remaining) clearInterval(timer);
            }, 1000);

            return () => clearInterval(timer);
        }
    }, [offer]);

    if (!offer || !isOpen) return null;

    const discountDisplay = offer.discountType === 'percentage'
        ? `${offer.discountValue}% OFF`
        : `₹${offer.discountValue} OFF`;

    return (
        <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={handleClose}
            />

            {/* Dialog Card */}
            <div
                className={`
                    relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden 
                    transform transition-all duration-700 cubic-bezier(0.34, 1.56, 0.64, 1)
                    ${isVisible ? 'translate-y-0 scale-100 opacity-100' : 'translate-y-12 scale-90 opacity-0'}
                `}
            >
                {/* Decorative Header Background */}
                <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-yellow-400 to-yellow-600 overflow-hidden">
                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/20 rounded-full blur-2xl" />
                    <div className="absolute top-10 -left-10 w-24 h-24 bg-white/20 rounded-full blur-xl" />
                </div>

                {/* Close Button */}
                <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 z-10 p-2 bg-white/20 hover:bg-white/30 text-white rounded-full transition-colors backdrop-blur-md"
                >
                    <X size={20} />
                </button>

                {/* Content */}
                <div className="relative pt-8 px-6 pb-6 text-center">
                    {/* Icon Circle */}
                    <div className="mx-auto w-20 h-20 bg-white rounded-full shadow-lg flex items-center justify-center mb-4 relative z-10 border-4 border-yellow-50">
                        <Gift className="w-10 h-10 text-yellow-600" />
                        {timeLeft && (
                            <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full animate-bounce shadow">
                                Limited Time!
                            </div>
                        )}
                    </div>

                    {/* Countdown Timer */}
                    {timeLeft && (
                        <div className="mb-4 flex justify-center gap-2">
                            <div className="flex flex-col items-center bg-gray-100 rounded-lg p-2 min-w-[60px]">
                                <span className="text-xl font-bold text-gray-800 leading-none">{timeLeft.days}</span>
                                <span className="text-xs text-gray-500 uppercase">Days</span>
                            </div>
                            <div className="flex flex-col items-center bg-gray-100 rounded-lg p-2 min-w-[60px]">
                                <span className="text-xl font-bold text-gray-800 leading-none">{timeLeft.hours}</span>
                                <span className="text-xs text-gray-500 uppercase">Hrs</span>
                            </div>
                            <div className="flex flex-col items-center bg-gray-100 rounded-lg p-2 min-w-[60px]">
                                <span className="text-xl font-bold text-gray-800 leading-none">{timeLeft.minutes}</span>
                                <span className="text-xs text-gray-500 uppercase">Mins</span>
                            </div>
                            <div className="flex flex-col items-center bg-gray-100 rounded-lg p-2 min-w-[60px]">
                                <span className="text-xl font-bold text-red-600 leading-none animate-pulse">{timeLeft.seconds}</span>
                                <span className="text-xs text-gray-500 uppercase">Secs</span>
                            </div>
                        </div>
                    )}

                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                        {offer.name}
                    </h3>

                    <div className="bg-yellow-50 py-3 px-4 rounded-lg my-4 border border-yellow-100">
                        <span className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 to-orange-600">
                            {discountDisplay}
                        </span>
                        <p className="text-sm text-yellow-800 font-medium mt-1">
                            on all {offer.applicablePlans.length > 0 ? 'selected' : ''} memberships
                        </p>
                    </div>

                    <p className="text-gray-600 mb-6 leading-relaxed">
                        {offer.description || "Don't miss out on this exclusive opportunity to transform your fitness journey with our premium gym facilities."}
                    </p>

                    {offer.applicablePlans.length > 0 && (
                        <div className="flex flex-wrap justify-center gap-2 mb-6">
                            {offer.applicablePlans.slice(0, 3).map(plan => (
                                <span key={plan} className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full border border-gray-200 uppercase tracking-wide">
                                    {plan.replace('month', ' Month').replace('yearly', 'Yearly')}
                                </span>
                            ))}
                            {offer.applicablePlans.length > 3 && (
                                <span className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full border border-gray-200">
                                    +{offer.applicablePlans.length - 3} more
                                </span>
                            )}
                        </div>
                    )}

                    <div className="space-y-3">
                        <Link
                            to="/join"
                            className="w-full bg-gradient-to-r from-gray-900 to-gray-800 hover:from-black hover:to-gray-900 text-white py-3.5 px-6 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2 group"
                            onClick={handleClose}
                        >
                            <PartyPopper className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                            Claim Offer Now
                        </Link>

                        <button
                            onClick={handleClose}
                            className="text-sm text-gray-500 hover:text-gray-700 underline underline-offset-4"
                        >
                            No thanks, I'll pay full price
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OfferDialog;
