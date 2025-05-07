import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, ArrowRight, Users, BarChart3, Award, ShieldCheck } from 'lucide-react';
import { useTheme } from '../../lib/ThemeContext';
import { useTranslation } from '../../lib/useTranslation';

// Custom CSS untuk animasi
const animationStyles = `
  @keyframes blob {
    0% {
      transform: scale(1);
    }
    33% {
      transform: scale(1.1) translate(20px, -10px);
    }
    66% {
      transform: scale(0.9) translate(-20px, 10px);
    }
    100% {
      transform: scale(1);
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
  .pattern-grid-lg {
    background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
  }

  /* Animasi untuk angka dashboard */
  .number-animate {
    transition: all 0.8s ease-out;
  }

  /* Tambahan styling untuk dashboard */
  .dashboard-preview {
    position: relative;
    overflow: hidden;
  }

  .dashboard-card {
    transition: all 0.3s ease;
  }
  
  .dashboard-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
  }
  
  /* Animasi untuk chart distribusi unit kerja */
  @keyframes barHeight1 {
    0% { height: 65%; }
    20% { height: 70%; }
    40% { height: 60%; }
    60% { height: 75%; }
    80% { height: 65%; }
    100% { height: 65%; }
  }
  
  @keyframes barHeight2 {
    0% { height: 80%; }
    25% { height: 85%; }
    50% { height: 75%; }
    75% { height: 90%; }
    100% { height: 80%; }
  }
  
  @keyframes barHeight3 {
    0% { height: 55%; }
    30% { height: 45%; }
    60% { height: 60%; }
    80% { height: 50%; }
    100% { height: 55%; }
  }
  
  @keyframes barHeight4 {
    0% { height: 95%; }
    20% { height: 85%; }
    40% { height: 90%; }
    70% { height: 100%; }
    90% { height: 90%; }
    100% { height: 95%; }
  }
  
  @keyframes barHeight5 {
    0% { height: 70%; }
    25% { height: 80%; }
    50% { height: 65%; }
    75% { height: 75%; }
    100% { height: 70%; }
  }
  
  @keyframes barHeight6 {
    0% { height: 60%; }
    20% { height: 65%; }
    50% { height: 55%; }
    80% { height: 70%; }
    100% { height: 60%; }
  }
  
  .bar-1 { animation: barHeight1 8s infinite; }
  .bar-2 { animation: barHeight2 9s infinite; }
  .bar-3 { animation: barHeight3 10s infinite; }
  .bar-4 { animation: barHeight4 11s infinite; }
  .bar-5 { animation: barHeight5 9.5s infinite; }
  .bar-6 { animation: barHeight6 10.5s infinite; }
`;

const LandingPage = () => {
  const [scrollY, setScrollY] = useState(0);
  const [showMockNotice, setShowMockNotice] = useState(false);
  const { isDark, language, toggleLanguage } = useTheme();
  const { t } = useTranslation();
  
  // State untuk angka-angka dashboard yang dinamis
  const [totalEmployees, setTotalEmployees] = useState(467);
  const [activeEmployees, setActiveEmployees] = useState(425);
  const [retiring, setRetiring] = useState(12);
  
  // State untuk kategori status pegawai (PNS, PPPK, Non ASN)
  const [pns, setPns] = useState(366);
  const [pppk, setPppk] = useState(37);
  const [nonAsn, setNonAsn] = useState(22);
  
  // State untuk nilai distribusi unit kerja
  const [unitData, setUnitData] = useState([
    { name: "Sekr", value: 68 },
    { name: "Dep 1", value: 85 },
    { name: "Dep 2", value: 60 },
    { name: "Dep 3", value: 95 },
    { name: "Insp", value: 45 },
    { name: "Pusat", value: 38 }
  ]);
  
  // Timer untuk update simulasi data real-time
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  // Random number generator dengan range
  const randomNumber = (min: number, max: number) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };
  
  // Random percentage change
  const randomChange = (value: number, percentRange: number) => {
    const changePercent = (Math.random() * percentRange * 2) - percentRange; // -range to +range
    const change = Math.floor(value * (changePercent / 100));
    return value + change;
  };
  
  useEffect(() => {
    // Menambahkan style ke head
    const styleElement = document.createElement('style');
    styleElement.innerHTML = animationStyles;
    document.head.appendChild(styleElement);
    
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    
    window.addEventListener('scroll', handleScroll);
    
    // Simulasi perubahan data real-time
    timerRef.current = setInterval(() => {
      // Update total employees (dengan fluktuasi kecil)
      const newTotal = randomChange(totalEmployees, 2);
      setTotalEmployees(newTotal);
      
      // Update active employees (sekitar 90-92% dari total)
      const newActive = Math.floor(newTotal * (randomNumber(90, 92) / 100));
      setActiveEmployees(newActive);
      
      // Update retiring (sekitar 2-5% dari total)
      const newRetiring = Math.floor(newTotal * (randomNumber(2, 5) / 100));
      setRetiring(newRetiring);
      
      // Update status pegawai dengan rasio yang terjaga
      const newPns = Math.floor(newActive * 0.86); // sekitar 86% PNS
      const newPppk = Math.floor(newActive * 0.09); // sekitar 9% PPPK
      const newNonAsn = newActive - newPns - newPppk; // sisanya Non ASN
      
      setPns(newPns);
      setPppk(newPppk);
      setNonAsn(newNonAsn);
      
      // Update data unit dengan sedikit fluktuasi
      setUnitData(prev => prev.map(unit => ({
        ...unit,
        value: Math.min(100, Math.max(30, unit.value + randomNumber(-5, 5)))
      })));
    }, 3000); // Update setiap 3 detik
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.head.removeChild(styleElement);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [totalEmployees, activeEmployees]);

  const features = [
    {
      icon: <Users className="h-12 w-12 text-emerald-600" />,
      title: 'Manajemen Pegawai',
      description: 'Kelola data pegawai dengan sistem yang terintegrasi'
    },
    {
      icon: <BarChart3 className="h-12 w-12 text-emerald-600" />,
      title: 'Dashboard Interaktif',
      description: 'Visualisasi data pegawai yang komprehensif dan real-time untuk mendukung pengambilan keputusan'
    },
    {
      icon: <Award className="h-12 w-12 text-emerald-600" />,
      title: 'Analisis Kepegawaian',
      description: 'Analisis distribusi pegawai berdasarkan jabatan, pendidikan, pangkat, dan demografis'
    },
    {
      icon: <ShieldCheck className="h-12 w-12 text-emerald-600" />,
      title: 'Multi-level Akses',
      description: 'Sistem keamanan dengan tiga level akses: Superadmin, Admin, dan User'
    }
  ];

  // Custom Dashboard Preview Component
  const DashboardPreview = () => (
    <div className="dashboard-preview bg-emerald-50 rounded-xl shadow-2xl p-6 transform transition-all hover:scale-105 duration-500">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-800">Dashboard Overview</h2>
        <p className="text-sm text-gray-600">Statistik dan informasi pegawai</p>
      </div>
      
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="dashboard-card bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">Total Pegawai</p>
          <h3 className="text-2xl font-bold text-emerald-600 number-animate">{totalEmployees}</h3>
          <p className="text-xs text-gray-500">+5% bulan ini</p>
        </div>
        
        <div className="dashboard-card bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">Pegawai Aktif</p>
          <h3 className="text-2xl font-bold text-emerald-600 number-animate">{activeEmployees}</h3>
          <p className="text-xs text-gray-500">{Math.round((activeEmployees/totalEmployees)*100)}% dari total</p>
        </div>
        
        <div className="dashboard-card bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">Pensiun Tahun Ini</p>
          <h3 className="text-2xl font-bold text-emerald-500 number-animate">{retiring}</h3>
          <p className="text-xs text-gray-500">{Math.round((retiring/30)*100)}% bulan mendatang</p>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="dashboard-card bg-white p-4 rounded-lg shadow">
          <p className="text-sm font-medium text-gray-700 mb-2">Distribusi Unit Kerja</p>
          <div className="h-40 flex items-end justify-around">
            {unitData.map((unit, index) => (
              <div key={index} className="flex flex-col items-center">
                <div 
                  className={`w-6 rounded-t-sm bg-emerald-500 opacity-90 bar-${index + 1}`} 
                  style={{ height: `${unit.value}%` }}
                ></div>
                <div className="text-xs text-gray-600 mt-1">{unit.name}</div>
                <div className="text-xs text-emerald-700 font-medium">{unit.value}</div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="dashboard-card bg-white p-4 rounded-lg shadow">
          <p className="text-sm font-medium text-gray-700 mb-2">Status Pegawai</p>
          <div className="flex flex-col">
            {/* PNS */}
            <div className="mb-2">
              <div className="flex justify-between text-xs mb-1">
                <span>PNS</span>
                <span className="font-medium">{pns}</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-emerald-500 rounded-full" 
                  style={{ width: `${(pns / (pns + pppk + nonAsn)) * 100}%` }}
                ></div>
              </div>
            </div>
            
            {/* PPPK */}
            <div className="mb-2">
              <div className="flex justify-between text-xs mb-1">
                <span>PPPK</span>
                <span className="font-medium">{pppk}</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-emerald-400 rounded-full" 
                  style={{ width: `${(pppk / (pns + pppk + nonAsn)) * 100}%` }}
                ></div>
              </div>
            </div>
            
            {/* Non ASN */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span>Non ASN</span>
                <span className="font-medium">{nonAsn}</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-emerald-300 rounded-full" 
                  style={{ width: `${(nonAsn / (pns + pppk + nonAsn)) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white dark:from-gray-900 dark:to-gray-800 overflow-hidden relative">
      {/* Floating Elements */}
      <div className="absolute top-0 right-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-96 h-96 bg-emerald-300/20 dark:bg-emerald-700/10 rounded-full animate-blob z-0"></div>
        <div className="absolute bottom-20 left-20 w-80 h-80 bg-emerald-200/20 dark:bg-emerald-700/10 rounded-full animate-blob animation-delay-2000 z-0"></div>
        <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-emerald-400/10 dark:bg-emerald-600/10 rounded-full animate-blob animation-delay-4000 z-0"></div>
      </div>
      
      {/* Navigation Bar */}
      <nav className="relative z-10 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center">
          <span className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">EmpDash</span>
        </div>
        <div className="flex items-center gap-4">
          {/* Language Toggle */}
          <button
            onClick={toggleLanguage}
            className="p-2 text-sm font-medium bg-white/80 dark:bg-gray-700/80 text-gray-600 dark:text-gray-300 hover:bg-emerald-100/50 dark:hover:bg-emerald-900/20 rounded-full transition-colors"
          >
            {language === 'id' ? 'ENG' : 'ID'}
          </button>
          
          <Link
            to="/login"
            className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2 rounded-full text-sm font-medium transition-colors shadow-sm"
          >
            {language === 'id' ? 'Masuk' : 'Login'}
          </Link>
        </div>
      </nav>
      
      {/* Mock Mode Notification */}
      {showMockNotice && (
        <div className="fixed top-0 left-0 right-0 bg-emerald-100 text-emerald-800 p-3 z-50 flex items-center justify-between">
          <div className="flex-1 text-center">
            <span className="font-medium">{language === 'id' ? 'Mode Demo' : 'Demo Mode'}:</span> {language === 'id' ? 
              'Aplikasi berjalan dengan data contoh karena server backend tidak aktif.' : 
              'Application is running with sample data because the backend server is not active.'}
          </div>
          <button 
            onClick={() => setShowMockNotice(false)}
            className="p-1 hover:bg-emerald-200 rounded-full"
          >
            ×
          </button>
        </div>
      )}
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white pb-12 pt-20 lg:pb-20 lg:pt-32">
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
                {language === 'id' ? (
                  <>Manajemen <span className="text-emerald-600">Pegawai</span> Modern</>
                ) : (
                  <>Modern <span className="text-emerald-600">Employee</span> Management</>
                )}
              </h1>
              <p className="mt-6 text-xl text-gray-600">
                {language === 'id' ? 
                  'Sistem pengelolaan dan analisis data pegawai yang komprehensif untuk mendukung pengambilan keputusan strategis.' : 
                  'Comprehensive employee data management and analysis system to support strategic decision making.'}
              </p>
              <div className="mt-8 flex items-center justify-center gap-x-6">
                <Link 
                  to="/login" 
                  className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-6 py-3 rounded-xl shadow-md transition flex items-center"
                >
                  {language === 'id' ? 'Masuk Sekarang' : 'Login Now'} <ChevronRight className="ml-2 h-5 w-5" />
                </Link>
                <a href="#features" className="text-sm font-semibold leading-6 text-gray-800 hover:text-emerald-600">
                  {language === 'id' ? 'Pelajari Fitur' : 'Explore Features'} <span aria-hidden="true">→</span>
                </a>
              </div>
            </div>
          </div>
        </div>
        
        {/* Abstract background gradient */}
        <div className="absolute -top-48 left-1/2 -z-10 -translate-x-1/2 transform-gpu blur-3xl sm:top-[-28rem] sm:ml-16 sm:translate-x-0 sm:transform-gpu">
          <div
            className="aspect-[1097/845] w-[68.5625rem] bg-gradient-to-tr from-emerald-300 to-emerald-400 opacity-20"
            style={{
              clipPath: 'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)'
            }}
          />
        </div>

        {/* Animated blobs */}
        <div className="absolute -top-52 right-0 -z-10 overflow-hidden">
          <div className="absolute -top-40 right-20 h-72 w-72 rounded-full bg-emerald-300 mix-blend-multiply blur-xl filter opacity-20 animate-blob"></div>
          <div className="absolute -top-40 right-20 h-72 w-72 rounded-full bg-emerald-400 mix-blend-multiply blur-xl filter opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute -top-40 right-20 h-72 w-72 rounded-full bg-emerald-200 mix-blend-multiply blur-xl filter opacity-20 animate-blob animation-delay-4000"></div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="relative overflow-hidden bg-emerald-50 py-12 sm:py-16 lg:py-20" id="features">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center">
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-emerald-700 sm:text-4xl">
              {language === 'id' ? 'Fitur Utama Aplikasi' : 'Main Application Features'}
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              {language === 'id' 
                ? 'Dengan Dashboard ASN, Anda mendapatkan alat yang lengkap untuk mengelola dan menyajikan data kepegawaian secara efektif.' 
                : 'With EmpDash, you get a complete tool to manage and present employee data effectively.'}
            </p>
          </div>
          <div className="mx-auto mt-12 max-w-7xl sm:mt-16 lg:mt-20">
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {features.map((feature, index) => (
                <div 
                  key={index} 
                  className="flex flex-col items-start bg-white rounded-xl p-8 shadow-sm hover:shadow-lg transition-shadow border border-emerald-100"
                >
                  <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-emerald-50 mb-5">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Pattern background */}
        <div className="absolute inset-0 -z-10 opacity-10 pattern-grid-lg"></div>
      </section>
      
      {/* Dashboard Showcase Section */}
      <section className="py-12 sm:py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center">
            <h2 className="text-3xl font-bold tracking-tight text-emerald-700 sm:text-4xl">
              {language === 'id' ? 'Informasi dalam Genggaman Anda' : 'Information at Your Fingertips'}
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              {language === 'id'
                ? 'Dashboard interaktif menyajikan data kepegawaian secara visual dan mudah dipahami.'
                : 'Interactive dashboard presents employee data visually and is easy to understand.'}
            </p>
          </div>
          
          <div className="mt-10 flex justify-center">
            <DashboardPreview />
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="relative py-16 sm:py-20">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-emerald-800"></div>
        <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              {language === 'id' ? 'Siap untuk memulai?' : 'Ready to get started?'}
            </h2>
            <p className="mt-4 text-lg text-emerald-100">
              {language === 'id'
                ? 'Akses sistem manajemen pegawai untuk mendapatkan insight tentang data kepegawaian dan mendukung pengambilan keputusan.'
                : 'Access the employee management system to gain insights about employee data and support decision making.'}
            </p>
            <div className="mt-10">
              <Link
                to="/login"
                className="rounded-xl bg-white px-6 py-3 text-lg font-semibold text-emerald-700 shadow-sm hover:bg-emerald-50 flex items-center justify-center w-auto max-w-xs mx-auto"
              >
                {language === 'id' ? 'Akses Sistem' : 'Access System'} <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <h3 className="text-xl font-bold mb-4">
                {language === 'id' ? 'Manajemen Pegawai BSKDN' : 'BSKDN Employee Management'}
              </h3>
              <p className="text-gray-400 mb-4 max-w-md">
                {language === 'id'
                  ? 'Sistem modern pengelolaan data pegawai Badan Strategi Kebijakan Dalam Negeri'
                  : 'Modern employee data management system for the Domestic Policy Strategy Agency'}
              </p>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">{language === 'id' ? 'Tautan Cepat' : 'Quick Links'}</h4>
              <ul className="space-y-2">
                <li><Link to="/login" className="text-gray-400 hover:text-emerald-400 transition-colors">Login</Link></li>
                <li><a href="#features" className="text-gray-400 hover:text-emerald-400 transition-colors">
                  {language === 'id' ? 'Fitur' : 'Features'}
                </a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">{language === 'id' ? 'Kontak' : 'Contact'}</h4>
              <ul className="space-y-2 text-gray-400">
                <li>{language === 'id' ? 'Badan Strategi Kebijakan Dalam Negeri' : 'Domestic Policy Strategy Agency'}</li>
                <li>Jakarta, Indonesia</li>
                <li>contact@bskdn.go.id</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-emerald-900 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400">© {language === 'id' ? 'Manajemen Pegawai BSKDN' : 'BSKDN Employee Management'}. {language === 'id' ? 'Hak Cipta Dilindungi' : 'All rights reserved'}.</p>
            <div className="mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-emerald-400 transition-colors">
                {language === 'id' ? 'Kebijakan Privasi' : 'Privacy Policy'}
              </a>
              <span className="mx-3 text-gray-600">|</span>
              <a href="#" className="text-gray-400 hover:text-emerald-400 transition-colors">
                {language === 'id' ? 'Ketentuan Layanan' : 'Terms of Service'}
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage; 