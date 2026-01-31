import { useState, useEffect } from 'react';
import { Calendar, CreditCard, Loader2 } from 'lucide-react';
import { getGymInfo } from '../utils/apiClient';

export default function Footer({ variant = 'default' }: { variant?: 'default' | 'store' }) {
    const [footerData, setFooterData] = useState({
        openingHours: {
            days: 'Monday - Saturday',
            morningHours: '6:00 AM - 9:00 AM',
            eveningHours: '4:00 PM - 9:00 PM'
        },
        paymentMethods: 'Cash, Online Payment',
        contactEmail: 'stargynpetlad0205@gmail.com',
        contactPhone: '9101321032',
        address: '1st floor, Krishiv complex, Swaminarayan mandir Rd, Petlad, 388450',
        gymName: 'Star Gym'
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchFooterData = async () => {
            try {
                const gymInfo = await getGymInfo();
                if (gymInfo) {
                    setFooterData({
                        openingHours: gymInfo.footer?.openingHours || footerData.openingHours,
                        paymentMethods: gymInfo.footer?.paymentMethods || footerData.paymentMethods,
                        contactEmail: gymInfo.footer?.contactEmail || footerData.contactEmail,
                        contactPhone: gymInfo.footer?.contactPhone || footerData.contactPhone,
                        address: gymInfo.address || footerData.address,
                        gymName: gymInfo.name || footerData.gymName
                    });
                }
            } catch (error) {
                console.error('Error fetching footer data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchFooterData();
    }, []);

    if (isLoading) {
        return (
            <footer className={`text-white py-6 mt-auto ${variant === 'store' ? 'bg-slate-900 border-t border-slate-800' : ''}`}>
                <div className="container mx-auto px-4">
                    <div className={`${variant === 'store' ? '' : 'panel-glass'} p-6`}>
                        <div className="flex items-center justify-center">
                            <Loader2 className="w-5 h-5 animate-spin text-yellow-500" />
                        </div>
                    </div>
                </div>
            </footer>
        );
    }

    const paymentMethodsList = footerData.paymentMethods.split(',').map(method => method.trim());

    return (
        <footer className={`text-white py-6 mt-auto ${variant === 'store' ? 'bg-slate-900 border-t border-slate-800' : ''}`}>
            <div className="container mx-auto px-4">
                {/* If variant is store, we remove panel-glass for a cleaner look, or adapt it */}
                <div className={`${variant === 'store' ? '' : 'panel-glass'} grid grid-cols-1 md:grid-cols-3 gap-8 p-6`}>
                    <div>
                        <h3 className="text-lg font-semibold mb-4 flex items-center">
                            <Calendar className="mr-2 text-yellow-500" size={20} /> Opening Hours
                        </h3>
                        <p className="text-gray-300">{footerData.openingHours.days}</p>
                        <p className="text-gray-300 text-sm mt-1">
                            <span className="block">Morning: {footerData.openingHours.morningHours}</span>
                            <span className="block">Evening: {footerData.openingHours.eveningHours}</span>
                        </p>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold mb-4 flex items-center">
                            <CreditCard className="mr-2 text-yellow-500" size={20} /> Payment Methods
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {paymentMethodsList.map((method, index) => (
                                <span key={index} className="text-gray-300 bg-white/5 px-2 py-1 rounded text-sm border border-white/10">{method}</span>
                            ))}
                        </div>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold mb-4 accent-text">Contact Us</h3>
                        <p className="text-gray-300">Address: {footerData.address}</p>
                        <p className="text-gray-300">Email: {footerData.contactEmail}</p>
                        <p className="text-gray-300">Phone: {footerData.contactPhone}</p>
                    </div>
                </div>
                {variant === 'store' && (
                    <div className="mt-8 pt-6 border-t border-slate-800 text-center text-gray-500 text-sm">
                        &copy; {new Date().getFullYear()} {footerData.gymName}. All rights reserved.
                    </div>
                )}
            </div>
        </footer>
    );
}
