import { useEffect, useRef } from 'react';
import { ArrowUpRight, TrendingUp } from 'lucide-react';
import { formatNumber } from '../../lib/utils';

interface PromotionData {
  fromPosition: string;
  toPosition: string;
  count: number;
  avgYears: number;
}

interface CareerPathData {
  position: string;
  avgTenure: number;
  totalEmployees: number;
  promotions: PromotionData[];
}

interface CareerDevelopmentChartProps {
  data: CareerPathData[];
  onViewDetails?: () => void;
}

const CareerDevelopmentChart = ({
  data,
  onViewDetails
}: CareerDevelopmentChartProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Sort positions by total employees
  const sortedData = [...data].sort((a, b) => b.totalEmployees - a.totalEmployees);
  
  // Function to draw the chart
  const drawChart = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas dimensions
    canvas.width = Math.max(800, window.innerWidth * 0.7);
    canvas.height = 600;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Define positions on the canvas
    const positions: Record<string, { x: number, y: number, width: number, height: number }> = {};
    const paddingTop = 50;
    const paddingLeft = 50;
    const paddingRight = 50;
    const boxWidth = 200;
    const boxHeight = 80;
    const horizontalSpacing = (canvas.width - paddingLeft - paddingRight - boxWidth) / 5;
    
    // Map position levels
    const positionLevels: Record<string, number> = {
      'Pelaksana': 0,
      'Pejabat Fungsional Ahli Pertama': 1,
      'Pejabat Fungsional Ahli Muda': 1,
      'Pejabat Pengawas': 1,
      'Pejabat Fungsional Ahli Madya': 2,
      'Pejabat Administrator': 2,
      'Pejabat Fungsional Ahli Utama': 3,
      'Pejabat Pimpinan Tinggi Pratama': 3,
      'Pejabat Pimpinan Tinggi Madya': 4,
      'Pejabat Pimpinan Tinggi Utama': 5
    };
    
    // Group positions by level
    const positionsByLevel: Record<number, CareerPathData[]> = {};
    
    sortedData.forEach(position => {
      const level = positionLevels[position.position] || 0;
      if (!positionsByLevel[level]) {
        positionsByLevel[level] = [];
      }
      positionsByLevel[level].push(position);
    });
    
    // Calculate positions on canvas
    Object.keys(positionsByLevel).forEach(levelStr => {
      const level = parseInt(levelStr);
      const positions_at_level = positionsByLevel[level];
      const verticalSpacing = (canvas.height - paddingTop - boxHeight * positions_at_level.length) / (positions_at_level.length + 1);
      
      positions_at_level.forEach((position, idx) => {
        positions[position.position] = {
          x: paddingLeft + level * horizontalSpacing,
          y: paddingTop + idx * (boxHeight + verticalSpacing) + verticalSpacing,
          width: boxWidth,
          height: boxHeight
        };
      });
    });
    
    // Draw connections (promotions)
    data.forEach(position => {
      if (position.promotions && position.promotions.length > 0) {
        position.promotions.forEach(promotion => {
          const fromPos = positions[position.position];
          const toPos = positions[promotion.toPosition];
          
          if (fromPos && toPos) {
            // Calculate control points for curved lines
            const controlX = (fromPos.x + fromPos.width + toPos.x) / 2;
            
            // Draw curved path
            ctx.beginPath();
            ctx.moveTo(fromPos.x + fromPos.width, fromPos.y + fromPos.height / 2);
            ctx.quadraticCurveTo(
              controlX, 
              fromPos.y + fromPos.height / 2, 
              toPos.x, 
              toPos.y + toPos.height / 2
            );
            
            // Line style based on promotion count
            const lineWidth = Math.max(1, Math.min(5, promotion.count / 10));
            ctx.lineWidth = lineWidth;
            ctx.strokeStyle = 'rgba(59, 130, 246, 0.6)';
            ctx.stroke();
            
            // Draw arrow
            const arrowSize = 8;
            const angle = Math.atan2(
              toPos.y + toPos.height / 2 - fromPos.y - fromPos.height / 2,
              toPos.x - fromPos.x - fromPos.width
            );
            
            ctx.beginPath();
            ctx.moveTo(toPos.x, toPos.y + toPos.height / 2);
            ctx.lineTo(
              toPos.x - arrowSize * Math.cos(angle - Math.PI / 6),
              toPos.y + toPos.height / 2 - arrowSize * Math.sin(angle - Math.PI / 6)
            );
            ctx.lineTo(
              toPos.x - arrowSize * Math.cos(angle + Math.PI / 6),
              toPos.y + toPos.height / 2 - arrowSize * Math.sin(angle + Math.PI / 6)
            );
            ctx.closePath();
            ctx.fillStyle = 'rgba(59, 130, 246, 0.8)';
            ctx.fill();
            
            // Add promotion info
            const infoX = controlX;
            const infoY = (fromPos.y + fromPos.height / 2 + toPos.y + toPos.height / 2) / 2 - 15;
            
            ctx.font = '11px Arial';
            ctx.fillStyle = '#4b5563';
            ctx.textAlign = 'center';
            ctx.fillText(`${promotion.count} promosi`, infoX, infoY);
            ctx.fillText(`(~${promotion.avgYears} tahun)`, infoX, infoY + 15);
          }
        });
      }
    });
    
    // Draw position boxes
    Object.entries(positions).forEach(([posName, pos]) => {
      const posData = data.find(p => p.position === posName);
      
      if (posData) {
        // Draw gradient background
        const gradient = ctx.createLinearGradient(pos.x, pos.y, pos.x + pos.width, pos.y + pos.height);
        gradient.addColorStop(0, '#f0f9ff');
        gradient.addColorStop(1, '#dbeafe');
        
        ctx.fillStyle = gradient;
        ctx.strokeStyle = '#93c5fd';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(pos.x, pos.y, pos.width, pos.height, 8);
        ctx.fill();
        ctx.stroke();
        
        // Draw position name
        ctx.font = 'bold 12px Arial';
        ctx.fillStyle = '#1e3a8a';
        ctx.textAlign = 'center';
        ctx.fillText(
          posName.length > 25 ? posName.substring(0, 22) + '...' : posName, 
          pos.x + pos.width / 2, 
          pos.y + 20
        );
        
        // Draw employee count
        ctx.font = 'bold 14px Arial';
        ctx.fillStyle = '#1d4ed8';
        ctx.fillText(
          formatNumber(posData.totalEmployees), 
          pos.x + pos.width / 2, 
          pos.y + 42
        );
        
        // Draw avg tenure
        ctx.font = '11px Arial';
        ctx.fillStyle = '#6b7280';
        ctx.fillText(
          `Rata-rata ${posData.avgTenure} tahun`, 
          pos.x + pos.width / 2, 
          pos.y + 60
        );
      }
    });
    
    // Draw title
    ctx.font = 'bold 16px Arial';
    ctx.fillStyle = '#1f2937';
    ctx.textAlign = 'center';
    ctx.fillText('Jalur Karir & Promosi', canvas.width / 2, 30);
  };
  
  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      drawChart();
    };
    
    window.addEventListener('resize', handleResize);
    drawChart();
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [data]);
  
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <TrendingUp className="mr-2 h-5 w-5 text-gray-500" />
            <h3 className="text-lg font-semibold text-gray-800">Pengembangan Karir & Promosi</h3>
          </div>
          {onViewDetails && (
            <button 
              onClick={onViewDetails}
              className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
            >
              Lihat Detail
              <ArrowUpRight size={16} className="ml-1" />
            </button>
          )}
        </div>
      </div>
      
      <div className="p-6 overflow-x-auto">
        <div className="min-w-[800px]">
          <canvas ref={canvasRef} />
        </div>
        
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
            <h4 className="text-xs font-medium text-blue-500 uppercase tracking-wider mb-1">Promosi Tahunan</h4>
            <p className="text-2xl font-bold text-blue-900">{formatNumber(
              data.reduce((sum, pos) => 
                sum + pos.promotions.reduce((pSum, prom) => pSum + prom.count, 0), 0
              ) / 5
            )}</p>
            <p className="text-xs text-blue-600 mt-1">Rata-rata promosi per tahun</p>
          </div>
          
          <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100">
            <h4 className="text-xs font-medium text-indigo-500 uppercase tracking-wider mb-1">Rata-rata Masa Kerja</h4>
            <p className="text-2xl font-bold text-indigo-900">
              {(data.reduce((sum, pos) => sum + pos.avgTenure * pos.totalEmployees, 0) / 
                data.reduce((sum, pos) => sum + pos.totalEmployees, 0)).toFixed(1)} tahun
            </p>
            <p className="text-xs text-indigo-600 mt-1">Di posisi/jabatan saat ini</p>
          </div>
          
          <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
            <h4 className="text-xs font-medium text-purple-500 uppercase tracking-wider mb-1">Promosi Tercepat</h4>
            <p className="text-2xl font-bold text-purple-900">
              {Math.min(...data.flatMap(pos => 
                pos.promotions.map(prom => prom.avgYears)
              )).toFixed(1)} tahun
            </p>
            <p className="text-xs text-purple-600 mt-1">Rata-rata waktu promosi tercepat</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CareerDevelopmentChart; 