import { Mail, Phone, MapPin, Send } from 'lucide-react';

export default function Contact() {
    return (
        <div className="min-h-screen bg-gray-900 text-white pt-24 pb-20">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h1 className="text-4xl font-bold mb-4">Get in <span className="text-yellow-500">Touch</span></h1>
                    <p className="text-gray-400 max-w-xl mx-auto">Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.</p>
                </div>

                <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
                    {/* Contact Info */}
                    <div className="space-y-8">
                        <h2 className="text-2xl font-bold mb-6">Contact Information</h2>

                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center text-yellow-500 shrink-0">
                                <MapPin size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg mb-1">Our Location</h3>
                                <p className="text-gray-400">1st floor, Krishiv complex,<br />Swaminarayan mandir Rd, Petlad, 388450</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center text-yellow-500 shrink-0">
                                <Phone size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg mb-1">Phone Number</h3>
                                <p className="text-gray-400">+91 9101321032</p>
                                <p className="text-sm text-gray-500 mt-1">Mon-Sat 9am to 6pm</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center text-yellow-500 shrink-0">
                                <Mail size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg mb-1">Email Address</h3>
                                <p className="text-gray-400">stargynpetlad0205@gmail.com</p>
                            </div>
                        </div>

                        {/* Map Placeholder */}
                        <div className="mt-8 h-64 bg-gray-800 rounded-xl border border-gray-700 overflow-hidden relative">
                            <div className="absolute inset-0 flex items-center justify-center text-gray-500 bg-gray-800/50">
                                Map View
                            </div>
                            <iframe
                                title="map"
                                src="https://maps.google.com/maps?q=Krishiv%20complex%2C%20Swaminarayan%20mandir%20Rd%2C%20Petlad&t=&z=15&ie=UTF8&iwloc=&output=embed"
                                width="100%"
                                height="100%"
                                style={{ border: 0, filter: 'invert(90%) hue-rotate(180deg)' }}
                                allowFullScreen
                                loading="lazy"
                            ></iframe>
                        </div>
                    </div>

                    {/* Form */}
                    <div className="bg-gray-800 p-8 rounded-2xl border border-gray-700">
                        <h2 className="text-2xl font-bold mb-6">Send Message</h2>
                        <form className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">First Name</label>
                                    <input type="text" className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500" placeholder="John" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Last Name</label>
                                    <input type="text" className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500" placeholder="Doe" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Email</label>
                                <input type="email" className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500" placeholder="john@example.com" />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Message</label>
                                <textarea rows={4} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500" placeholder="How can we help you?"></textarea>
                            </div>

                            <button type="button" className="w-full bg-yellow-500 hover:bg-yellow-400 text-slate-900 font-bold py-4 rounded-lg transition-colors flex items-center justify-center gap-2">
                                Send Message <Send size={20} />
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
