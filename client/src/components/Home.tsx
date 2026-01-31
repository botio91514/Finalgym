import { useNavigate } from 'react-router-dom';
import { Dumbbell, Users, Clock, ArrowRight } from 'lucide-react';
import OfferDialog from './OfferDialog';

export default function Home() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gray-900 text-white pt-16">
            {/* Hero Section */}
            <section className="relative py-20 lg:py-32 overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1470&auto=format&fit=crop')] bg-cover bg-center opacity-20" />
                <div className="absolute inset-0 bg-gradient-to-b from-gray-900/50 to-gray-900" />

                <div className="container mx-auto px-4 relative z-10 text-center max-w-4xl mx-auto">
                    <span className="text-yellow-500 font-bold uppercase tracking-wider mb-4 block animate-fadeIn">Welcome to Star Gym</span>
                    <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight animate-slideUp">
                        Transform Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600">Body</span> <br />
                        Transform Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600">Life</span>
                    </h1>
                    <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto leading-relaxed">
                        Join the elite fitness community. State-of-the-art equipment, expert trainers, and a supportive atmosphere to help you crush your goals.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button
                            onClick={() => navigate('/join')}
                            className="bg-yellow-500 hover:bg-yellow-400 text-slate-900 px-8 py-4 rounded-full font-bold text-lg transition-all transform hover:scale-105 shadow-xl flex items-center justify-center gap-2"
                        >
                            Start Your Journey <ArrowRight size={20} />
                        </button>
                        <button
                            onClick={() => navigate('/about')}
                            className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white px-8 py-4 rounded-full font-bold text-lg transition-all"
                        >
                            Learn More
                        </button>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="py-20 bg-gray-800/50">
                <div className="container mx-auto px-4">
                    <div className="grid md:grid-cols-3 gap-8">
                        <FeatureCard
                            icon={<Dumbbell className="w-8 h-8 text-yellow-500" />}
                            title="Premium Equipment"
                            description="Train with the best. Our gym is equipped with the latest machinery and free weights for every workout style."
                        />
                        <FeatureCard
                            icon={<Users className="w-8 h-8 text-yellow-500" />}
                            title="Expert Trainers"
                            description="Get guidance from certified professionals who are passionate about helping you achieve your personal best."
                        />
                        <FeatureCard
                            icon={<Clock className="w-8 h-8 text-yellow-500" />}
                            title="Flexible Hours"
                            description="We fit into your schedule. Open early and close late so you never have to miss a workout."
                        />
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-yellow-500 text-slate-900">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-4xl font-bold mb-6">Ready to make a change?</h2>
                    <p className="text-xl mb-8 max-w-2xl mx-auto font-medium">
                        Don't wait for tomorrow. Your fitness journey starts today. Sign up now and get your first consultation free.
                    </p>
                    <button
                        onClick={() => navigate('/join')}
                        className="bg-slate-900 text-white px-10 py-4 rounded-full font-bold text-lg hover:bg-slate-800 transition-transform hover:scale-105 shadow-2xl"
                    >
                        Become a Member
                    </button>
                </div>
            </section>

            {/* Interactive Offer Dialog */}
            <OfferDialog />
        </div>
    );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
    return (
        <div className="bg-gray-800 p-8 rounded-2xl border border-gray-700 hover:border-yellow-500/50 transition-colors group">
            <div className="bg-gray-700/50 w-16 h-16 rounded-xl flex items-center justify-center mb-6 group-hover:bg-yellow-500/10 transition-colors">
                {icon}
            </div>
            <h3 className="text-xl font-bold mb-3 text-white">{title}</h3>
            <p className="text-gray-400 leading-relaxed">
                {description}
            </p>
        </div>
    );
}
