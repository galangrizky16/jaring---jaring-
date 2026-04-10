import { useEffect, useRef, useState } from 'react';
import { Award, TrendingUp, Users, Clock, CheckCircle, Star } from 'lucide-react';

const Profile = () => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const stats = [
    { icon: Users, label: 'Happy Clients', value: '100+', color: '#00B7FF' },
    { icon: TrendingUp, label: 'Services', value: '7+', color: '#CFFF00' },
    { icon: Award, label: 'Quality', value: '100%', color: '#00B7FF' },
    { icon: Clock, label: 'Est. 2025', value: 'New', color: '#CFFF00' }
  ];

  const features = [
    {
      title: 'Aplikasi Premium & Akun ML',
      description: 'Jual aplikasi premium dan akun Mobile Legends berkualitas dengan harga terjangkau',
      icon: CheckCircle
    },
    {
      title: 'Layanan PPOB',
      description: 'Layanan pembayaran online lengkap untuk memudahkan transaksi Anda',
      icon: Clock
    },
    {
      title: 'Joki Tugas Professional',
      description: 'Jasa pengerjaan tugas dengan tim berpengalaman dan hasil terjamin',
      icon: TrendingUp
    },
    {
      title: 'Web & Bot Development',
      description: 'Pembuatan landing page, website, dan bot WhatsApp sesuai kebutuhan Anda',
      icon: Star
    }
  ];

  const timeline = [
    { year: 'Nov 2025', title: 'Grand Opening', description: 'MilKy Store resmi berdiri' },
    { year: 'Des 2025', title: 'Service Expansion', description: 'Menambah layanan PPOB' },
    { year: '2026', title: 'Growing', description: 'Target ekspansi layanan' },
    { year: 'Future', title: 'Innovation', description: 'Terus berinovasi untuk Anda' }
  ];

  return (
    <section id="profile" className="relative min-h-screen bg-gradient-to-b from-[#1F2A34] to-[#2E3A47] py-20 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-[#00B7FF] rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-[#CFFF00] rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-[#00B7FF] rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className={`text-center mb-16 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="inline-flex items-center space-x-2 bg-[#2E3A47]/80 backdrop-blur-sm border border-[#00B7FF]/30 rounded-full px-4 py-2 mb-6">
            <Award className="w-4 h-4 text-[#CFFF00]" />
            <span className="text-sm font-medium text-white">Tentang Kami</span>
          </div>
          
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Kenapa Pilih{' '}
            <span className="bg-gradient-to-r from-[#00B7FF] to-[#CFFF00] text-transparent bg-clip-text">
              MilKy Store
            </span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Platform terpadu untuk aplikasi premium, akun ML, PPOB, joki tugas, dan jasa pembuatan web & bot
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className={`bg-[#2E3A47]/50 backdrop-blur-sm border border-[#00B7FF]/20 rounded-xl p-6 text-center hover:border-[#00B7FF] transition-all duration-500 hover:transform hover:scale-105 ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div 
                  className="w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4"
                  style={{ backgroundColor: `${stat.color}20` }}
                >
                  <Icon className="w-6 h-6" style={{ color: stat.color }} />
                </div>
                <div className="text-3xl font-bold text-white mb-2">{stat.value}</div>
                <div className="text-gray-400 text-sm">{stat.label}</div>
              </div>
            );
          })}
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className={`group bg-[#2E3A47]/50 backdrop-blur-sm border border-[#00B7FF]/20 rounded-xl p-8 hover:border-[#00B7FF] transition-all duration-500 hover:transform hover:scale-105 ${
                  isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'
                }`}
                style={{ transitionDelay: `${200 + index * 100}ms` }}
              >
                <div className="flex items-start gap-4">
                  <div className="bg-[#00B7FF]/10 w-14 h-14 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-[#00B7FF]/20 transition-colors duration-300">
                    <Icon className="w-7 h-7 text-[#00B7FF]" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                    <p className="text-gray-400">{feature.description}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Timeline */}
        <div className={`mb-20 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} style={{ transitionDelay: '600ms' }}>
          <h3 className="text-3xl font-bold text-white text-center mb-12">Perjalanan Kami</h3>
          <div className="relative">
            {/* Timeline Line */}
            <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-[#00B7FF] to-[#CFFF00] opacity-30"></div>
            
            {/* Timeline Items */}
            <div className="space-y-12">
              {timeline.map((item, index) => (
                <div
                  key={index}
                  className={`relative flex items-center ${
                    index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                  } flex-col`}
                >
                  {/* Content */}
                  <div className={`w-full md:w-5/12 ${index % 2 === 0 ? 'md:text-right md:pr-12' : 'md:text-left md:pl-12'} text-center`}>
                    <div className="bg-[#2E3A47]/50 backdrop-blur-sm border border-[#00B7FF]/20 rounded-xl p-6 hover:border-[#00B7FF] transition-all duration-300 hover:transform hover:scale-105">
                      <div className="text-[#CFFF00] font-bold text-lg mb-2">{item.year}</div>
                      <h4 className="text-xl font-bold text-white mb-2">{item.title}</h4>
                      <p className="text-gray-400">{item.description}</p>
                    </div>
                  </div>

                  {/* Center Dot */}
                  <div className="hidden md:flex absolute left-1/2 transform -translate-x-1/2 w-6 h-6 bg-[#00B7FF] rounded-full border-4 border-[#1F2A34] z-10"></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Mission Statement */}
        <div className={`text-center bg-gradient-to-r from-[#2E3A47]/50 to-[#1F2A34]/50 backdrop-blur-sm border border-[#00B7FF]/20 rounded-2xl p-12 transition-all duration-1000 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`} style={{ transitionDelay: '800ms' }}>
          <h3 className="text-3xl font-bold text-white mb-6">Visi & Misi Kami</h3>
          <p className="text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
            Menjadi platform digital terpercaya yang menyediakan berbagai layanan berkualitas untuk memenuhi kebutuhan Anda. 
            Kami berkomitmen memberikan pelayanan terbaik, harga kompetitif, dan kepuasan pelanggan yang maksimal.
          </p>
          <div className="mt-8 inline-flex items-center gap-2 text-[#CFFF00] font-semibold">
            <Star className="w-5 h-5" />
            <span>Dipercaya oleh Ratusan Pelanggan</span>
            <Star className="w-5 h-5" />
          </div>
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

export default Profile;