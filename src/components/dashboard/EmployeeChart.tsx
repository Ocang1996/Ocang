import { useEffect, useRef, useState } from 'react';

const EmployeeChart = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'department' | 'rank'>('all');
  
  const drawChart = (ctx: CanvasRenderingContext2D, data: any[], type: 'bar' | 'pie') => {
    const width = ctx.canvas.width;
    const height = ctx.canvas.height;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    if (type === 'bar') {
      // Draw bar chart
      const barWidth = width / (data.length * 2); // Calculate bar width
      const maxValue = Math.max(...data.map(item => item.value));
      const scaleFactor = (height - 60) / maxValue; // Leave space for labels
      
      data.forEach((item, index) => {
        const x = index * barWidth * 2 + barWidth/2;
        const barHeight = item.value * scaleFactor;
        const y = height - barHeight - 30; // Leave space for x-axis labels
        
        // Draw bar
        ctx.fillStyle = item.color;
        ctx.fillRect(x, y, barWidth, barHeight);
        
        // Draw label (department/rank name)
        ctx.fillStyle = '#6B7280';
        ctx.font = '10px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(item.label, x + barWidth/2, height - 15);
        
        // Draw value on top of bar
        ctx.fillStyle = '#374151';
        ctx.font = '11px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(item.value.toString(), x + barWidth/2, y - 5);
      });
      
      // Draw y-axis
      ctx.strokeStyle = '#E5E7EB';
      ctx.beginPath();
      ctx.moveTo(20, 20);
      ctx.lineTo(20, height - 30);
      ctx.stroke();
      
      // Draw x-axis
      ctx.beginPath();
      ctx.moveTo(20, height - 30);
      ctx.lineTo(width - 20, height - 30);
      ctx.stroke();
    } else if (type === 'pie') {
      // Draw pie chart
      const centerX = width / 2;
      const centerY = height / 2 - 15; // Adjust for legend space
      const radius = Math.min(centerX, centerY) - 20;
      
      const total = data.reduce((sum, item) => sum + item.value, 0);
      let startAngle = 0;
      
      data.forEach((item) => {
        const sliceAngle = (item.value / total) * 2 * Math.PI;
        
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
        ctx.closePath();
        
        ctx.fillStyle = item.color;
        ctx.fill();
        
        // Calculate position for label
        const labelAngle = startAngle + sliceAngle / 2;
        const labelRadius = radius * 0.7;
        const labelX = centerX + Math.cos(labelAngle) * labelRadius;
        const labelY = centerY + Math.sin(labelAngle) * labelRadius;
        
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 12px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Only draw label for slices big enough
        if (sliceAngle > 0.2) {
          ctx.fillText(item.value.toString(), labelX, labelY);
        }
        
        startAngle += sliceAngle;
      });
      
      // Draw legend
      const legendY = height - 30;
      const legendX = width / 2 - (data.length * 80) / 2;
      
      data.forEach((item, index) => {
        const x = legendX + index * 80;
        
        // Draw color box
        ctx.fillStyle = item.color;
        ctx.fillRect(x, legendY, 12, 12);
        
        // Draw label
        ctx.fillStyle = '#6B7280';
        ctx.font = '12px Inter, sans-serif';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(item.label, x + 16, legendY + 6);
      });
    }
  };
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set up chart based on active filter
    if (activeFilter === 'department') {
      const departmentData = [
        { label: 'Sekretariat', value: 854, color: '#3B82F6' },
        { label: 'Keuangan', value: 426, color: '#10B981' },
        { label: 'Kepegawaian', value: 728, color: '#F59E0B' },
        { label: 'IT', value: 245, color: '#6366F1' },
        { label: 'Operasional', value: 912, color: '#EC4899' },
        { label: 'Lainnya', value: 262, color: '#8B5CF6' }
      ];
      drawChart(ctx, departmentData, 'bar');
    } else if (activeFilter === 'rank') {
      const rankData = [
        { label: 'Gol. I', value: 215, color: '#3B82F6' },
        { label: 'Gol. II', value: 943, color: '#10B981' },
        { label: 'Gol. III', value: 1520, color: '#F59E0B' },
        { label: 'Gol. IV', value: 749, color: '#EC4899' }
      ];
      drawChart(ctx, rankData, 'pie');
    } else {
      // Default combined view
      const combinedData = [
        { label: 'PNS', value: 2875, color: '#3B82F6' },
        { label: 'PPPK', value: 432, color: '#10B981' },
        { label: 'Honorer', value: 120, color: '#F59E0B' }
      ];
      drawChart(ctx, combinedData, 'pie');
    }
  }, [activeFilter]);
  
  return (
    <div>
      <div className="flex space-x-2 mb-4">
        <button
          className={`px-3 py-1.5 text-sm rounded-lg ${
            activeFilter === 'all'
              ? 'bg-blue-100 text-blue-700'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
          onClick={() => setActiveFilter('all')}
        >
          Semua ASN
        </button>
        <button
          className={`px-3 py-1.5 text-sm rounded-lg ${
            activeFilter === 'department'
              ? 'bg-blue-100 text-blue-700'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
          onClick={() => setActiveFilter('department')}
        >
          Berdasarkan Unit
        </button>
        <button
          className={`px-3 py-1.5 text-sm rounded-lg ${
            activeFilter === 'rank'
              ? 'bg-blue-100 text-blue-700'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
          onClick={() => setActiveFilter('rank')}
        >
          Berdasarkan Golongan
        </button>
      </div>
      
      <div className="h-[300px] w-full">
        <canvas ref={canvasRef} width={800} height={300} className="w-full h-full"></canvas>
      </div>
    </div>
  );
};

export default EmployeeChart;