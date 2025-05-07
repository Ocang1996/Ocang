import { UserPlus, LineChart as ChartLine, RotateCw } from 'lucide-react';

const activities = [
  {
    id: 1,
    type: 'new-employee',
    title: 'ASN Baru Ditambahkan',
    description: 'Nama: Dr. Ahmad Fauzi, S.T., M.T. (Gol. IV/a)',
    time: '2 menit yang lalu',
    icon: <UserPlus size={16} />,
    iconColor: 'text-purple-500',
    iconBg: 'bg-purple-100'
  },
  {
    id: 2,
    type: 'report',
    title: 'Laporan Tahunan Dibuat',
    description: 'Laporan Distribusi ASN 2023 telah selesai',
    time: '15 menit yang lalu',
    icon: <ChartLine size={16} />,
    iconColor: 'text-blue-500',
    iconBg: 'bg-blue-100'
  },
  {
    id: 3,
    type: 'mutation',
    title: 'Mutasi ASN',
    description: '5 ASN dipindahkan ke unit kerja berbeda',
    time: '1 jam yang lalu',
    icon: <RotateCw size={16} />,
    iconColor: 'text-pink-500',
    iconBg: 'bg-pink-100'
  }
];

const ActivityFeed = () => {
  return (
    <div className="space-y-4">
      {activities.map((activity) => (
        <div key={activity.id} className="flex space-x-3">
          <div className={`flex-shrink-0 w-9 h-9 ${activity.iconBg} ${activity.iconColor} rounded-full flex items-center justify-center`}>
            {activity.icon}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-800">{activity.title}</p>
            <p className="text-sm text-gray-500">{activity.description}</p>
            <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
          </div>
        </div>
      ))}
      
      <button className="w-full py-2 mt-2 text-sm text-center text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
        Lihat semua aktivitas
      </button>
    </div>
  );
};

export default ActivityFeed;