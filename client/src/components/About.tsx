import { Target, History } from 'lucide-react';

export default function About() {
    return (
        <div className="min-h-screen bg-gray-900 text-white pt-24 pb-20">
            <div className="container mx-auto px-4">
                {/* Header */}
                <div className="max-w-3xl mx-auto text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-bold mb-6">About <span className="text-yellow-500">Star Gym</span></h1>
                    <p className="text-xl text-gray-300 leading-relaxed">
                        We are more than just a gym. We are a community dedicated to physical and mental transformation. Since 2015, we've been helping people unlock their true potential.
                    </p>
                </div>

                {/* Content Section */}
                <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
                    <div className="space-y-6">
                        <div className="flex gap-4">
                            <div className="flex-shrink-0 mt-1">
                                <div className="w-12 h-12 bg-yellow-500/10 rounded-lg flex items-center justify-center text-yellow-500">
                                    <History size={24} />
                                </div>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold mb-2">Our Story</h3>
                                <p className="text-gray-400 leading-relaxed">
                                    Founded by fitness enthusiasts who were tired of generic, uninspiring gyms. Star Gym was built on the belief that the environment shapes the athlete. We started small, but our passion for quality and community helped us grow into the premier fitness destination in the city.
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <div className="flex-shrink-0 mt-1">
                                <div className="w-12 h-12 bg-yellow-500/10 rounded-lg flex items-center justify-center text-yellow-500">
                                    <Target size={24} />
                                </div>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold mb-2">Our Mission</h3>
                                <p className="text-gray-400 leading-relaxed">
                                    To provide the best equipment, guidance, and atmosphere for everyone—from beginners to pro athletes. We strive to make fitness accessible, enjoyable, and sustainable for all our members.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="relative">
                        <div className="absolute inset-0 bg-yellow-500 rounded-2xl transform rotate-3 opacity-20 blur-lg"></div>
                        <video
                            src="/gymvid.mp4"
                            className="relative rounded-2xl shadow-2xl border border-gray-700 w-full object-cover h-[400px]"
                            autoPlay
                            muted
                            loop
                            playsInline
                            controls
                        />
                    </div>
                </div>

                {/* Team Section */}
                <div className="mb-20">
                    <h2 className="text-3xl font-bold text-center mb-12">Meet Our <span className="text-yellow-500">Leaders</span></h2>
                    <div className="flex flex-col gap-12 max-w-5xl mx-auto">
                        {/* Owner Card - Image Left */}
                        <div className="bg-gray-800 rounded-2xl overflow-hidden border border-gray-700 hover:border-yellow-500/50 transition-all group flex flex-col md:flex-row items-stretch">
                            <div className="md:w-2/5 relative h-80 md:h-auto min-h-[300px]">
                                <img
                                    src="/owner.jpg.jpeg"
                                    alt="Owner"
                                    className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 via-transparent to-transparent md:bg-gradient-to-r md:from-transparent md:to-gray-800/20"></div>
                            </div>
                            <div className="p-8 md:p-12 flex flex-col justify-center flex-1">
                                <h3 className="text-3xl font-bold mb-2">Smit Patel</h3>
                                <div className="text-yellow-500 font-semibold mb-6 uppercase tracking-wider text-sm flex items-center gap-2">
                                    <span className="w-8 h-0.5 bg-yellow-500"></span> Owner & Founder
                                </div>
                                <p className="text-gray-300 leading-relaxed text-lg italic">
                                    "I started Star Gym with a simple vision: to create a fitness sanctuary where everyone feels welcome and motivated. Your fitness journey is personal, but you don't have to walk it alone."
                                </p>
                            </div>
                        </div>

                        {/* Trainer Card - Image Right (Desktop) */}
                        <div className="bg-gray-800 rounded-2xl overflow-hidden border border-gray-700 hover:border-yellow-500/50 transition-all group flex flex-col md:flex-row-reverse items-stretch">
                            <div className="md:w-2/5 relative h-80 md:h-auto min-h-[300px]">
                                <img
                                    src="https://images.unsplash.com/photo-1546483875-ad9014c88eba?q=80&w=1000&auto=format&fit=crop"
                                    alt="Trainer"
                                    className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 via-transparent to-transparent md:bg-gradient-to-l md:from-transparent md:to-gray-800/20"></div>
                            </div>
                            <div className="p-8 md:p-12 flex flex-col justify-center flex-1 text-right md:text-left">
                                <div className="flex flex-col md:items-end">
                                    <h3 className="text-3xl font-bold mb-2">Sanjay</h3>
                                    <div className="text-yellow-500 font-semibold mb-6 uppercase tracking-wider text-sm flex items-center gap-2 justify-end md:justify-start">
                                        <span className="w-8 h-0.5 bg-yellow-500 md:hidden"></span> Head Trainer <span className="w-8 h-0.5 bg-yellow-500 hidden md:block"></span>
                                    </div>
                                    <p className="text-gray-300 leading-relaxed text-lg italic md:text-right">
                                        "Consistency is key. My goal is to help you build sustainable habits that last a lifetime. Whether you're training for strength or fat loss, we'll smash these goals together."
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats */}
                <div className="bg-gray-800 rounded-2xl p-10 border border-gray-700">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                        <div>
                            <div className="text-4xl font-bold text-yellow-500 mb-2">10+</div>
                            <div className="text-gray-400 font-medium">Years Experience</div>
                        </div>
                        <div>
                            <div className="text-4xl font-bold text-yellow-500 mb-2">400+</div>
                            <div className="text-gray-400 font-medium">Happy Members</div>
                        </div>
                        <div>
                            <div className="text-4xl font-bold text-yellow-500 mb-2">2+</div>
                            <div className="text-gray-400 font-medium">Expert Trainers</div>
                        </div>
                        <div>
                            <div className="text-4xl font-bold text-yellow-500 mb-2">24/7</div>
                            <div className="text-gray-400 font-medium">Support & Access</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
