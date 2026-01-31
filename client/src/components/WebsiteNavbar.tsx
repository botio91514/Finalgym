import { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { Dumbbell, Menu, X, Gift } from 'lucide-react';
import { useUIStore } from '../store/useUIStore';

export default function WebsiteNavbar() {

    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const isStorePage = location.pathname === '/store';

    const navLinks = [
        { name: 'Home', path: '/' },
        { name: 'About', path: '/about' },
        { name: 'Gallery', path: '/gallery' },
        { name: 'Store', path: '/store' },
        { name: 'Contact', path: '/contact' },
    ];

    return (
        <>
            <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${isStorePage ? 'bg-slate-900 text-white' : 'bg-gray-900/90 backdrop-blur-md text-white border-b border-white/10'}`}>
                <div className="container mx-auto px-4">
                    <div className="flex justify-between items-center h-16">
                        {/* Logo */}
                        <div onClick={() => navigate('/')} className="flex items-center gap-2 cursor-pointer group">
                            <Dumbbell className="text-yellow-500 group-hover:rotate-12 transition-transform duration-300" size={28} />
                            <span className="text-2xl font-bold tracking-tight">
                                Star<span className="text-yellow-500">Gym</span>
                            </span>
                        </div>

                        {/* Desktop Nav */}
                        <div className="hidden md:flex items-center gap-8">
                            {navLinks.map((link) => (
                                <NavLink
                                    key={link.name}
                                    to={link.path}
                                    className={({ isActive }) =>
                                        `text-sm font-medium transition-colors hover:text-yellow-400 ${isActive ? 'text-yellow-500' : 'text-gray-300'}`
                                    }
                                >
                                    {link.name}
                                </NavLink>
                            ))}

                            <button
                                onClick={() => navigate('/join')}
                                className="bg-yellow-500 hover:bg-yellow-400 text-slate-900 px-5 py-2 rounded-full font-bold text-sm transition-all transform hover:scale-105 shadow-lg"
                            >
                                Join Now
                            </button>
                        </div>

                        {/* Mobile Menu Button */}
                        <button
                            className="md:hidden text-gray-300 hover:text-white"
                            onClick={() => setIsOpen(!isOpen)}
                        >
                            {isOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {isOpen && (
                    <div className="md:hidden bg-gray-900 border-t border-gray-800">
                        <div className="flex flex-col p-4 space-y-4">
                            {navLinks.map((link) => (
                                <NavLink
                                    key={link.name}
                                    to={link.path}
                                    onClick={() => setIsOpen(false)}
                                    className={({ isActive }) =>
                                        `text-lg font-medium transition-colors hover:text-yellow-400 ${isActive ? 'text-yellow-500' : 'text-gray-300'}`
                                    }
                                >
                                    {link.name}
                                </NavLink>
                            ))}
                            <button
                                onClick={() => {
                                    navigate('/join');
                                    setIsOpen(false);
                                }}
                                className="bg-yellow-500 hover:bg-yellow-400 text-slate-900 px-5 py-3 rounded-lg font-bold text-center mt-2"
                            >
                                Join Now
                            </button>
                        </div>
                    </div>
                )}
            </nav>
            {/* Offer Notification Bubble - Bottom Left Fixed */}
            {(() => {
                // Use global UI store for state management
                const hasSeenOffer = useUIStore((state) => state.hasSeenOffer);
                const setHasSeenOffer = useUIStore((state) => state.setHasSeenOffer);

                if (!hasSeenOffer) return null;

                return (
                    <div className="fixed bottom-6 right-6 z-[100] flex items-center justify-center group">
                        {/* Ripple Effect */}
                        <span className="absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75 animate-ping duration-1000"></span>

                        <button
                            onClick={() => {
                                // Reset state and reload to re-trigger the offer
                                setHasSeenOffer(false);
                                window.location.reload();
                            }}
                            className="relative bg-yellow-500 p-3.5 rounded-full shadow-2xl shadow-yellow-500/40 hover:scale-110 transition-transform cursor-pointer flex items-center justify-center animate-bounce"
                            title="View Active Offer"
                        >
                            <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-600 rounded-full border-2 border-white"></div>
                            <Gift className="w-6 h-6 text-slate-900" />
                        </button>

                        {/* Tooltip text on hover */}
                        <span className="absolute right-full mr-4 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                            View Offer
                        </span>
                    </div>
                );
            })()}
        </>
    );
}
