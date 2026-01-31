import React, { useState, useEffect } from 'react';
import { Tags, Plus, Loader2, Trash, Calendar, Clock, AlertCircle } from 'lucide-react';

export interface Offer {
    name: string;
    description: string;
    discountType: 'fixed' | 'percentage';
    discountValue: number;
    applicablePlans: string[];
    isActive: boolean;
    validUntil?: string;
}

interface OffersSectionProps {
    offers: Offer[];
    onSave: (data: Offer[]) => void;
    isSaving: boolean;
}

const OffersSection: React.FC<OffersSectionProps> = ({ offers = [], onSave, isSaving }) => {
    const [localOffers, setLocalOffers] = useState<Offer[]>(offers);
    const [deleteConfirmation, setDeleteConfirmation] = useState<{ isOpen: boolean; index: number | null }>({
        isOpen: false,
        index: null
    });

    useEffect(() => {
        setLocalOffers(offers || []);
    }, [offers]);

    const handleAddOffer = () => {
        setLocalOffers([
            ...localOffers,
            {
                name: '',
                description: '', // Basis/Reason
                discountType: 'fixed',
                discountValue: 0,
                applicablePlans: [],
                isActive: true,
            }
        ]);
    };

    const handleChange = (index: number, field: keyof Offer, value: any) => {
        const newOffers = [...localOffers];
        newOffers[index] = { ...newOffers[index], [field]: value };
        setLocalOffers(newOffers);
    };

    const handlePlanToggle = (index: number, plan: string) => {
        const newOffers = [...localOffers];
        const currentPlans = newOffers[index].applicablePlans || [];
        if (currentPlans.includes(plan)) {
            newOffers[index].applicablePlans = currentPlans.filter((p: string) => p !== plan);
        } else {
            newOffers[index].applicablePlans = [...currentPlans, plan];
        }
        setLocalOffers(newOffers);
    };

    const handleRemoveOfferClick = (index: number) => {
        setDeleteConfirmation({ isOpen: true, index });
    };

    const confirmDeleteOffer = () => {
        if (deleteConfirmation.index !== null) {
            const newOffers = localOffers.filter((_, i) => i !== deleteConfirmation.index);
            setLocalOffers(newOffers);
            setDeleteConfirmation({ isOpen: false, index: null });
            // Immediate deletion from database
            onSave(newOffers);
        }
    };

    const cancelDeleteOffer = () => {
        setDeleteConfirmation({ isOpen: false, index: null });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(localOffers);
    };

    return (
        <div className="p-6 border border-gray-200 rounded-lg bg-gradient-to-br from-purple-50 to-pink-50 relative">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Tags className="w-5 h-5" />
                Offers on Plans
            </h3>
            <form onSubmit={handleSubmit} className="space-y-6">
                {localOffers.map((offer, index) => (
                    <div key={index} className="bg-white p-4 rounded-lg border border-gray-200 relative">
                        <button
                            type="button"
                            onClick={() => handleRemoveOfferClick(index)}
                            className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
                        >
                            <Trash className="w-5 h-5" />
                        </button>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Offer Name</label>
                                <input
                                    type="text"
                                    value={offer.name}
                                    onChange={(e) => handleChange(index, 'name', e.target.value)}
                                    placeholder="e.g., Summer Sale"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Basis / Description</label>
                                <input
                                    type="text"
                                    value={offer.description}
                                    onChange={(e) => handleChange(index, 'description', e.target.value)}
                                    placeholder="e.g., For students with valid ID"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                                />
                            </div>
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Discount Type</label>
                                    <select
                                        value={offer.discountType}
                                        onChange={(e) => handleChange(index, 'discountType', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    >
                                        <option value="fixed">Fixed Amount (Rs)</option>
                                        <option value="percentage">Percentage (%)</option>
                                    </select>
                                </div>
                                <div className="flex-1">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Discount Value</label>
                                    <input
                                        type="number"
                                        value={offer.discountValue}
                                        onChange={(e) => handleChange(index, 'discountValue', parseFloat(e.target.value))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        min="0"
                                    />
                                </div>
                            </div>

                            <div className="md:col-span-2 bg-gradient-to-r from-purple-50 to-indigo-50 p-4 rounded-xl border border-purple-100 shadow-sm">
                                <div className="flex items-center gap-2 mb-4 text-purple-800 border-b border-purple-200 pb-2">
                                    <Clock className="w-5 h-5" />
                                    <h4 className="font-semibold text-sm uppercase tracking-wide">Limited Time Offer Settings</h4>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-gray-700">
                                            Offer Expiry Date & Time
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="datetime-local"
                                                value={(() => {
                                                    if (!offer.validUntil) return '';
                                                    try {
                                                        // Convert UTC to local time string for input
                                                        const date = new Date(offer.validUntil);
                                                        const localDate = new Date(date.getTime() - (date.getTimezoneOffset() * 60000));
                                                        return localDate.toISOString().slice(0, 16);
                                                    } catch (e) {
                                                        return '';
                                                    }
                                                })()}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    if (!val) {
                                                        handleChange(index, 'validUntil', '');
                                                    } else {
                                                        // Convert local input to UTC ISO string
                                                        handleChange(index, 'validUntil', new Date(val).toISOString());
                                                    }
                                                }}
                                                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                            />
                                            <Calendar className="w-5 h-5 text-gray-400 absolute left-3 top-2.5 pointer-events-none" />
                                        </div>
                                        <div className="flex items-start gap-2 mt-2 text-xs text-purple-700 bg-purple-100/50 p-2 rounded">
                                            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                            <p>Setting an expiry date automatically activates the <strong>Countdown Timer</strong> on the website popup, creating urgency for customers.</p>
                                        </div>
                                    </div>

                                    <div className="flex flex-col justify-end space-y-3">
                                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Quick Presets</span>
                                        <div className="grid grid-cols-2 gap-2">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const d = new Date();
                                                    d.setDate(d.getDate() + 3);
                                                    d.setHours(23, 59, 59, 999);
                                                    handleChange(index, 'validUntil', d.toISOString());
                                                }}
                                                className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-purple-50 hover:border-purple-300 hover:text-purple-700 transition-all text-center"
                                            >
                                                3 Days (Flash Sale)
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const d = new Date();
                                                    d.setDate(d.getDate() + 7);
                                                    d.setHours(23, 59, 59, 999);
                                                    handleChange(index, 'validUntil', d.toISOString());
                                                }}
                                                className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-purple-50 hover:border-purple-300 hover:text-purple-700 transition-all text-center"
                                            >
                                                1 Week
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const d = new Date();
                                                    d.setMonth(d.getMonth() + 1);
                                                    d.setDate(0); // Last day of current month
                                                    d.setHours(23, 59, 59, 999);
                                                    handleChange(index, 'validUntil', d.toISOString());
                                                }}
                                                className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-purple-50 hover:border-purple-300 hover:text-purple-700 transition-all text-center"
                                            >
                                                End of Month
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleChange(index, 'validUntil', '')}
                                                className="px-3 py-2 text-sm font-medium text-red-600 bg-red-50 border border-red-100 rounded-lg hover:bg-red-100 hover:border-red-200 transition-all text-center flex items-center justify-center gap-1"
                                            >
                                                <Trash className="w-3 h-3" />
                                                Clear Timer
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Applicable Plans</label>
                                <div className="flex flex-wrap gap-2">
                                    {['1month', '2month', '3month', '6month', 'yearly'].map((plan) => (
                                        <button
                                            key={plan}
                                            type="button"
                                            onClick={() => handlePlanToggle(index, plan)}
                                            className={`px-3 py-1 rounded-full text-sm font-medium border ${(offer.applicablePlans || []).includes(plan)
                                                ? 'bg-purple-100 text-purple-800 border-purple-200'
                                                : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                                                }`}
                                        >
                                            {plan === '1month' ? '1 Month' :
                                                plan === '2month' ? '2 Months' :
                                                    plan === '3month' ? '3 Months' :
                                                        plan === '6month' ? '6 Months' : '1 Year'}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id={`active-${index}`}
                                    checked={offer.isActive}
                                    onChange={(e) => handleChange(index, 'isActive', e.target.checked)}
                                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                                />
                                <label htmlFor={`active-${index}`} className="text-sm text-gray-700">Active</label>
                            </div>
                        </div>
                    </div>
                ))}
                <button
                    type="button"
                    onClick={handleAddOffer}
                    className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-purple-500 hover:text-purple-500 transition-colors flex items-center justify-center gap-2"
                >
                    <Plus className="w-5 h-5" />
                    Add New Offer
                </button>
                <button
                    type="submit"
                    disabled={isSaving}
                    className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                    {isSaving ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Saving...
                        </>
                    ) : (
                        'Save Offers'
                    )}
                </button>
            </form>

            {/* Delete Confirmation Modal */}
            {deleteConfirmation.isOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl">
                        <div className="flex items-center mb-4">
                            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mr-4">
                                <Trash className="w-6 h-6 text-red-600" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-800">Confirm Deletion</h2>
                        </div>
                        <p className="mb-6 text-gray-700">
                            Are you sure you want to delete this offer? This action cannot be undone once saved.
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={cancelDeleteOffer}
                                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDeleteOffer}
                                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors duration-200 flex items-center gap-2 font-semibold"
                            >
                                <Trash className="w-4 h-4" />
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OffersSection;
