import { useState } from 'react';
import { Play, Image as ImageIcon } from 'lucide-react';

export default function Gallery() {
    const [activeTab, setActiveTab] = useState<'photos' | 'videos'>('photos');
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    const photos = [
        "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1470&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1470&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?q=80&w=1000&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1574680096141-983200dc9f54?q=80&w=1470&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1599058945522-28d584b6f0ff?q=80&w=1469&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=1470&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1599058945522-28d584b6f0ff?q=80&w=1469&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1574680178051-55c63ef5cb0a?q=80&w=1469&auto=format&fit=crop"
    ];

    const videos = [
        {
            thumbnail: "https://images.unsplash.com/photo-1574680178051-55c63ef5cb0a?q=80&w=1469&auto=format&fit=crop",
            title: "Morning HIIT Session",
            duration: "45 min"
        },
        {
            thumbnail: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1470&auto=format&fit=crop",
            title: "Advanced Lifting Technique",
            duration: "15 min"
        },
        {
            thumbnail: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1470&auto=format&fit=crop",
            title: "Yoga Flow",
            duration: "60 min"
        },
    ];

    return (
        <div className="min-h-screen bg-gray-900 text-white pt-24 pb-20">
            <div className="container mx-auto px-4">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold mb-4">Our <span className="text-yellow-500">Gallery</span></h1>
                    <p className="text-gray-400 max-w-2xl mx-auto">
                        Take a look inside Star Gym. See our state-of-the-art equipment, energetic classes, and the community that makes us special.
                    </p>
                </div>

                {/* Filters */}
                <div className="flex justify-center mb-12">
                    <div className="bg-gray-800 p-1 rounded-full inline-flex">
                        <button
                            onClick={() => setActiveTab('photos')}
                            className={`px-8 py-3 rounded-full flex items-center gap-2 font-medium transition-all ${activeTab === 'photos'
                                    ? 'bg-yellow-500 text-slate-900 shadow-lg'
                                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            <ImageIcon size={20} /> Photos
                        </button>
                        <button
                            onClick={() => setActiveTab('videos')}
                            className={`px-8 py-3 rounded-full flex items-center gap-2 font-medium transition-all ${activeTab === 'videos'
                                    ? 'bg-yellow-500 text-slate-900 shadow-lg'
                                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            <Play size={20} /> Videos
                        </button>
                    </div>
                </div>

                {/* Content */}
                {activeTab === 'photos' ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {photos.map((src, index) => (
                            <div
                                key={index}
                                className="group relative overflow-hidden rounded-xl aspect-square cursor-pointer border border-gray-800 hover:border-yellow-500/50 transition-all"
                                onClick={() => setSelectedImage(src)}
                            >
                                <img
                                    src={src}
                                    alt={`Gallery ${index}`}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <ImageIcon className="text-yellow-500 w-8 h-8 scale-0 group-hover:scale-100 transition-transform duration-300" />
                                </div>
                            </div>
                        ))}
                        <div className="col-span-1 sm:col-span-2 md:col-span-3 lg:col-span-4 mt-8 text-center text-gray-500 italic pb-8">
                            * Real gallery images will be uploaded by the gym administrator.
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {videos.map((video, index) => (
                            <div key={index} className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700 hover:border-yellow-500/50 transition-all group cursor-pointer">
                                <div className="relative aspect-video">
                                    <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-60 transition-opacity" />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center pl-1 shadow-lg transform group-hover:scale-110 transition-transform">
                                            <Play className="text-slate-900 w-8 h-8" fill="currentColor" />
                                        </div>
                                    </div>
                                    <div className="absolute bottom-3 right-3 bg-black/80 px-2 py-1 rounded text-xs font-bold">
                                        {video.duration}
                                    </div>
                                </div>
                                <div className="p-4">
                                    <h3 className="font-bold text-lg mb-1">{video.title}</h3>
                                    <p className="text-gray-400 text-sm">Watch the highlights</p>
                                </div>
                            </div>
                        ))}
                        <div className="col-span-1 md:col-span-2 lg:col-span-3 mt-8 text-center text-gray-500 italic pb-8">
                            * Promotional videos and class recordings will appear here.
                        </div>
                    </div>
                )}
            </div>

            {/* Lightbox Modal */}
            {selectedImage && (
                <div
                    className="fixed inset-0 z-[60] bg-black/95 flex items-center justify-center p-4 backdrop-blur-sm"
                    onClick={() => setSelectedImage(null)}
                >
                    <button className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                    <img
                        src={selectedImage}
                        alt="Full View"
                        className="max-w-full max-h-[90vh] rounded shadow-2xl animate-fadeIn"
                        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking image
                    />
                </div>
            )}
        </div>
    );
}
