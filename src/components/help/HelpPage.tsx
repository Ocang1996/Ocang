import { useState } from 'react';
import Sidebar from '../layout/Sidebar';
import Header from '../layout/Header';
import { HelpCircle, Search, FileText, Play, Book, MessageCircle, LifeBuoy, ExternalLink, Phone, Mail, ChevronDown, ChevronRight } from 'lucide-react';
import { useTheme } from '../../lib/ThemeContext';
import { useTranslation } from '../../lib/useTranslation';

interface HelpPageProps {
  onLogout: () => void;
}

const HelpPage = ({ onLogout }: HelpPageProps) => {
  const { isDark } = useTheme();
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  // Data FAQ
  const faqItems = [
    {
      question: 'Bagaimana cara mengubah profil pengguna?',
      answer: 'Untuk mengubah profil pengguna, klik pada ikon profil di bagian kanan atas, lalu pilih "Profil". Anda dapat mengedit informasi profil dan menyimpan perubahan dengan mengklik tombol "Simpan".'
    },
    {
      question: 'Bagaimana cara menambahkan pegawai baru?',
      answer: 'Untuk menambahkan pegawai baru, navigasi ke halaman "Daftar Pegawai" melalui sidebar, kemudian klik tombol "Tambah Pegawai". Isi formulir dengan data pegawai yang diperlukan dan klik "Simpan".'
    },
    {
      question: 'Bagaimana cara mengekspor data ke Excel?',
      answer: 'Untuk mengekspor data, buka halaman yang memiliki data yang ingin Anda ekspor (seperti Daftar Pegawai), klik tombol "Ekspor" dan pilih format "Excel" dari menu dropdown.'
    },
    {
      question: 'Bagaimana cara mengubah bahasa aplikasi?',
      answer: 'Untuk mengubah bahasa aplikasi, buka halaman "Pengaturan" melalui sidebar, pilih tab "Tampilan", kemudian pilih bahasa yang diinginkan dari dropdown bahasa.'
    },
    {
      question: 'Bagaimana cara mengaktifkan mode gelap?',
      answer: 'Untuk mengaktifkan mode gelap, Anda dapat mengklik ikon matahari/bulan di header aplikasi untuk beralih antara mode terang dan gelap. Atau, buka halaman "Pengaturan", pilih tab "Tampilan", dan pilih tema "Gelap".'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <Sidebar activeItem="help" onLogout={onLogout} />
      
      <div className="w-full min-h-screen">
        <Header title={t('nav_help')} onLogout={onLogout} />
        
        <div className="mx-auto px-4 pt-24 pb-8 lg:ml-28 lg:mr-6 max-w-7xl">
          <div className="mb-6 mt-2">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-400 dark:from-emerald-400 dark:to-emerald-300 text-transparent bg-clip-text">
              {t('nav_help')}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Pusat bantuan dan panduan penggunaan aplikasi
            </p>
          </div>

          {/* Pencarian */}
          <div className="mb-8">
            <div className="relative">
              <input
                type="text"
                placeholder="Cari bantuan..."
                className="w-full px-4 py-3 pl-12 rounded-xl border border-gray-200/50 dark:border-gray-700/50 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
            </div>
          </div>

          {/* Konten Bantuan */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Kolom Kiri: Quick Links */}
            <div className="lg:col-span-1">
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-xl shadow-sm border border-gray-200/30 dark:border-gray-700/30 overflow-hidden">
                <div className="p-5 border-b border-gray-200/50 dark:border-gray-700/50">
                  <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Bantuan Cepat</h2>
                </div>
                <div className="p-5 space-y-4">
                  <a href="#panduan" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100/50 dark:hover:bg-gray-700/50 transition-colors">
                    <FileText className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
                    <span className="text-gray-700 dark:text-gray-300">Panduan Pengguna</span>
                  </a>
                  <a href="#video" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100/50 dark:hover:bg-gray-700/50 transition-colors">
                    <Play className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
                    <span className="text-gray-700 dark:text-gray-300">Video Tutorial</span>
                  </a>
                  <a href="#faq" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100/50 dark:hover:bg-gray-700/50 transition-colors">
                    <HelpCircle className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
                    <span className="text-gray-700 dark:text-gray-300">FAQ</span>
                  </a>
                  <a href="#glossary" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100/50 dark:hover:bg-gray-700/50 transition-colors">
                    <Book className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
                    <span className="text-gray-700 dark:text-gray-300">Glosarium</span>
                  </a>
                </div>
              </div>

              {/* Kontak Support */}
              <div className="mt-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-xl shadow-sm border border-gray-200/30 dark:border-gray-700/30 overflow-hidden">
                <div className="p-5 border-b border-gray-200/50 dark:border-gray-700/50">
                  <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Butuh Bantuan?</h2>
                </div>
                <div className="p-5 space-y-4">
                  <div className="flex items-center space-x-3 p-3">
                    <MessageCircle className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
                    <div>
                      <p className="text-gray-700 dark:text-gray-300">Live Chat</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Senin-Jumat, 09:00-17:00</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3">
                    <Mail className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
                    <div>
                      <p className="text-gray-700 dark:text-gray-300">Email</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">support@app.com</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3">
                    <Phone className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
                    <div>
                      <p className="text-gray-700 dark:text-gray-300">Telepon</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">(021) 1234-5678</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Kolom Kanan: Main Content */}
            <div className="lg:col-span-2">
              {/* FAQ Section */}
              <div id="faq" className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-xl shadow-sm border border-gray-200/30 dark:border-gray-700/30 overflow-hidden mb-6">
                <div className="p-5 border-b border-gray-200/50 dark:border-gray-700/50">
                  <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Pertanyaan yang Sering Diajukan</h2>
                </div>
                <div className="p-5 space-y-4">
                  {faqItems.map((item, index) => (
                    <div key={index} className="border border-gray-200/50 dark:border-gray-700/50 rounded-lg overflow-hidden">
                      <button
                        onClick={() => toggleFaq(index)}
                        className="w-full flex justify-between items-center p-4 text-left focus:outline-none"
                      >
                        <span className="font-medium text-gray-800 dark:text-gray-200">{item.question}</span>
                        {expandedFaq === index ? (
                          <ChevronDown className="h-5 w-5 text-emerald-500 dark:text-emerald-400" />
                        ) : (
                          <ChevronRight className="h-5 w-5 text-emerald-500 dark:text-emerald-400" />
                        )}
                      </button>
                      {expandedFaq === index && (
                        <div className="p-4 bg-gray-50/50 dark:bg-gray-700/50 border-t border-gray-200/50 dark:border-gray-700/50">
                          <p className="text-gray-600 dark:text-gray-300">{item.answer}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Panduan Pengguna */}
              <div id="panduan" className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-xl shadow-sm border border-gray-200/30 dark:border-gray-700/30 overflow-hidden mb-6">
                <div className="p-5 border-b border-gray-200/50 dark:border-gray-700/50">
                  <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Panduan Pengguna</h2>
                </div>
                <div className="p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <FileText className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
                      <span className="text-gray-700 dark:text-gray-300">Panduan Dashboard</span>
                    </div>
                    <a href="#" className="text-emerald-500 dark:text-emerald-400 hover:underline flex items-center">
                      <span>Lihat</span>
                      <ExternalLink className="w-4 h-4 ml-1" />
                    </a>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <FileText className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
                      <span className="text-gray-700 dark:text-gray-300">Panduan Manajemen Pegawai</span>
                    </div>
                    <a href="#" className="text-emerald-500 dark:text-emerald-400 hover:underline flex items-center">
                      <span>Lihat</span>
                      <ExternalLink className="w-4 h-4 ml-1" />
                    </a>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <FileText className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
                      <span className="text-gray-700 dark:text-gray-300">Panduan Pembuatan Laporan</span>
                    </div>
                    <a href="#" className="text-emerald-500 dark:text-emerald-400 hover:underline flex items-center">
                      <span>Lihat</span>
                      <ExternalLink className="w-4 h-4 ml-1" />
                    </a>
                  </div>
                </div>
              </div>

              {/* Video Tutorial */}
              <div id="video" className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-xl shadow-sm border border-gray-200/30 dark:border-gray-700/30 overflow-hidden">
                <div className="p-5 border-b border-gray-200/50 dark:border-gray-700/50">
                  <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Video Tutorial</h2>
                </div>
                <div className="p-5 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg overflow-hidden">
                      <div className="aspect-video bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                        <Play className="w-12 h-12 text-emerald-500 dark:text-emerald-400" />
                      </div>
                      <div className="p-3">
                        <p className="font-medium text-gray-800 dark:text-gray-200">Pengenalan Aplikasi</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">3:45 menit</p>
                      </div>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg overflow-hidden">
                      <div className="aspect-video bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                        <Play className="w-12 h-12 text-emerald-500 dark:text-emerald-400" />
                      </div>
                      <div className="p-3">
                        <p className="font-medium text-gray-800 dark:text-gray-200">Cara Menggunakan Dashboard</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">5:12 menit</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpPage; 