import { useState, useEffect } from 'react';
import { Package, Code, Bot, Wrench, Users, ArrowRight, MessageCircle } from 'lucide-react';

const Pricelist = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [activeCategory, setActiveCategory] = useState('aplikasi');

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const categories = [
    { id: 'aplikasi', name: 'Aplikasi Premium', icon: Package },
    { id: 'joki', name: 'Jasa Digital', icon: Wrench },
    { id: 'template', name: 'Template Bot', icon: Bot },
    { id: 'development', name: 'Web & Bot Development', icon: Code }
  ];

  const priceData = {
    aplikasi: [
      {
        name: 'Netflix',
        items: [
          { type: '1P1U', price: '20.000' },
          { type: 'Semi Private', price: '25.000' },
          { type: 'Private', price: '140.000' }
        ]
      },
      {
        name: 'Canva Member',
        items: [
          { type: 'Pro Desain 1 Bulan', price: '1.000' },
          { type: 'Pro Desain 2 Bulan', price: '2.000' },
          { type: 'Pro Desain 3 Bulan', price: '3.000' },
          { type: 'Pro Desain 1 Tahun', price: '12.000' }
        ]
      },
      {
        name: 'Canva Head',
        items: [
          { type: 'Head Pro 1 Bulan', price: '4.000' }
        ]
      },
      {
        name: 'Capcut Private',
        items: [
          { type: '35D Garansi 5D', price: '7.500' },
          { type: '28D Garansi 5D', price: '6.000' },
          { type: '21D Garansi 5D', price: '4.500' },
          { type: '7D Garansi 3D', price: '1.800' },
          { type: '35D Garansi 30D', price: '15.000' },
          { type: '90D Garansi 30D', price: '25.000' }
        ]
      },
      {
        name: 'Spotify',
        items: [
          { type: 'Famplan 1 Bulan', price: '18.000' },
          { type: 'Indplan 1 Bulan', price: '15.500' },
          { type: 'Student NoGar 1 Bulan', price: '8.000' }
        ]
      }
    ],
    joki: [
      {
        name: 'Joki Tugas Professional',
        description: 'Harga dan detail layanan tersedia di grup WhatsApp',
        cta: true
      }
    ],
    template: [
      {
        name: 'Template Bot WhatsApp',
        items: [
          { type: 'Auto Order', price: '60.000' },
          { type: 'Top Up Game (Digiflash)', price: '200.000' },
          { type: 'Top Up Game (Atlantic)', price: '150.000' }
        ]
      }
    ],
    development: [
      {
        name: 'Web & Bot Development',
        items: [
          { type: 'Landing Page', price: '50.000' },
          { type: 'Website Company', price: '1.000.000' },
          { type: 'Bot WhatsApp', price: '200.000' },
          { type: 'Custom Development', price: 'Nego' }
        ]
      }
    ]
  };

  return (
    <section id="pricelist" className="relative min-h-screen bg-gradient-to-b from-[#1F2A34] to-[#2E3A47] py-20 overflow-hidden">
      {/* Animated Background Elements - SAMA SEPERTI PROFILE */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-[#00B7FF] rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-[#CFFF00] rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-[#00B7FF] rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className={`text-center mb-16 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="inline-flex items-center space-x-2 bg-[#2E3A47]/80 backdrop-blur-sm border border-[#00B7FF]/30 rounded-full px-4 py-2 mb-6">
            <Package className="w-4 h-4 text-[#CFFF00]" />
            <span className="text-sm font-medium text-white">Daftar Harga</span>
          </div>
          
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Harga{' '}
            <span className="bg-gradient-to-r from-[#00B7FF] to-[#CFFF00] text-transparent bg-clip-text">
              Terjangkau
            </span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Pilih layanan yang sesuai dengan kebutuhan Anda dengan harga yang kompetitif
          </p>
        </div>

        {/* Category Tabs */}
        <div className={`flex flex-wrap justify-center gap-4 mb-12 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} style={{ transitionDelay: '200ms' }}>
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                  activeCategory === category.id
                    ? 'bg-gradient-to-r from-[#00B7FF] to-[#0095CC] text-white shadow-lg shadow-[#00B7FF]/30 scale-105'
                    : 'bg-[#2E3A47]/50 text-gray-300 hover:bg-[#2E3A47] hover:text-white border border-[#00B7FF]/20'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="hidden sm:inline">{category.name}</span>
              </button>
            );
          })}
        </div>

        {/* Price Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {priceData[activeCategory].map((service, index) => (
            <div
              key={index}
              className={`bg-[#2E3A47]/50 backdrop-blur-sm border border-[#00B7FF]/20 rounded-xl p-6 hover:border-[#00B7FF] transition-all duration-500 hover:transform hover:scale-105 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}
              style={{ transitionDelay: `${400 + index * 100}ms` }}
            >
              <h3 className="text-2xl font-bold text-white mb-4 pb-4 border-b border-[#00B7FF]/20">
                {service.name}
              </h3>
              
              {service.cta ? (
                <div className="space-y-4">
                  <p className="text-gray-300 leading-relaxed">{service.description}</p>
                  <a
                    href="https://chat.whatsapp.com/your-group-link"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-[#25D366] to-[#128C7E] text-white font-semibold py-3 rounded-lg hover:shadow-lg hover:shadow-[#25D366]/30 transition-all duration-300 hover:scale-105"
                  >
                    <MessageCircle className="w-5 h-5" />
                    Gabung Grup WhatsApp
                  </a>
                </div>
              ) : (
                <div className="space-y-3">
                  {service.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between items-center py-3 border-b border-[#00B7FF]/10 last:border-b-0 hover:bg-[#00B7FF]/5 px-2 rounded transition-colors duration-200"
                    >
                      <span className="text-gray-300">{item.type}</span>
                      <span className="text-[#CFFF00] font-bold">
                        Rp {item.price}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* CTA Card */}
        <div className={`bg-gradient-to-r from-[#2E3A47]/50 to-[#1F2A34]/50 backdrop-blur-sm border border-[#00B7FF]/20 rounded-2xl p-8 text-center transition-all duration-1000 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`} style={{ transitionDelay: '600ms' }}>
          <Users className="w-12 h-12 text-[#CFFF00] mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-white mb-3">
            Butuh Informasi Lebih Lanjut?
          </h3>
          <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
            Bergabunglah dengan grup WhatsApp kami untuk mendapatkan update harga terbaru, promo spesial, dan informasi layanan lainnya
          </p>
          <a
            href="https://chat.whatsapp.com/your-group-link"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-[#25D366] to-[#128C7E] text-white font-semibold px-8 py-4 rounded-xl hover:shadow-lg hover:shadow-[#25D366]/30 transition-all duration-300 hover:scale-105"
          >
            <MessageCircle className="w-5 h-5" />
            Gabung Grup WhatsApp
            <ArrowRight className="w-5 h-5" />
          </a>
        </div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }
        
        .animate-blob {
          animation: blob 7s infinite;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </section>
  );
};

export default Pricelist;