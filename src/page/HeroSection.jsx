import { useEffect, useRef } from 'react';
import { ArrowRight, Zap, Shield, Users } from 'lucide-react';

const HeroSection = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let particles = [];

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Particle class
    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
        this.radius = Math.random() * 2 + 1;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
        if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 183, 255, 0.5)';
        ctx.fill();
      }
    }

    // Create particles
    const particleCount = 80;
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update and draw particles
      particles.forEach(particle => {
        particle.update();
        particle.draw();
      });

      // Draw connections
      particles.forEach((p1, i) => {
        particles.slice(i + 1).forEach(p2 => {
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 150) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(0, 183, 255, ${0.2 * (1 - distance / 150)})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        });
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#1F2A34] via-[#2E3A47] to-[#1F2A34]">
      {/* Animated Network Background */}
      <canvas
        ref={canvasRef}
        className="absolute top-0 left-0 w-full h-full"
      />

      {/* Overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#1F2A34]/50 to-[#1F2A34]" />

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          {/* Badge */}
          <div className="inline-flex items-center space-x-2 bg-[#2E3A47]/80 backdrop-blur-sm border border-[#00B7FF]/30 rounded-full px-4 py-2 mb-8 animate-pulse">
            <Zap className="w-4 h-4 text-[#CFFF00]" />
            <span className="text-sm font-medium text-white">Trusted Gaming Solution</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Welcome to{' '}
            <span className="bg-gradient-to-r from-[#00B7FF] to-[#CFFF00] text-transparent bg-clip-text">
              Milky Store
            </span>
          </h1>

          {/* Subheading */}
          <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto">
            Your trusted partner for premium gaming top-ups, fast transactions, and secure payment solutions
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <button className="group bg-[#CFFF00] text-[#1F2A34] px-8 py-4 rounded-lg font-bold text-lg hover:bg-[#00B7FF] hover:text-white transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-[#00B7FF]/50 flex items-center gap-2">
              Get Started Now
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
            </button>
            <button className="bg-transparent border-2 border-[#00B7FF] text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-[#00B7FF]/10 transition-all duration-300 transform hover:scale-105">
              Learn More
            </button>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="bg-[#2E3A47]/50 backdrop-blur-sm border border-[#00B7FF]/20 rounded-xl p-6 hover:border-[#00B7FF] transition-all duration-300 hover:transform hover:scale-105">
              <div className="bg-[#00B7FF]/10 w-14 h-14 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Zap className="w-7 h-7 text-[#00B7FF]" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Lightning Fast</h3>
              <p className="text-gray-400">Instant top-up delivery in seconds</p>
            </div>

            <div className="bg-[#2E3A47]/50 backdrop-blur-sm border border-[#00B7FF]/20 rounded-xl p-6 hover:border-[#00B7FF] transition-all duration-300 hover:transform hover:scale-105">
              <div className="bg-[#00B7FF]/10 w-14 h-14 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Shield className="w-7 h-7 text-[#00B7FF]" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">100% Secure</h3>
              <p className="text-gray-400">Protected transactions guaranteed</p>
            </div>

            <div className="bg-[#2E3A47]/50 backdrop-blur-sm border border-[#00B7FF]/20 rounded-xl p-6 hover:border-[#00B7FF] transition-all duration-300 hover:transform hover:scale-105">
              <div className="bg-[#00B7FF]/10 w-14 h-14 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Users className="w-7 h-7 text-[#00B7FF]" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">24/7 Support</h3>
              <p className="text-gray-400">Always here to help you</p>
            </div>
          </div>
        </div>
      </div>


    </section>
  );
};

export default HeroSection;