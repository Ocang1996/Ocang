import { useEffect, useRef } from 'react';
import { ArrowUpRight, Lightbulb } from 'lucide-react';
import { formatNumber } from '../../lib/utils';

interface CompetencyData {
  competency: string;
  level: number; // 1-5 scale
}

interface PositionCompetencyData {
  position: string;
  type: string;
  competencies: CompetencyData[];
  count: number;
}

interface PositionCompetencyHeatmapProps {
  data: PositionCompetencyData[];
  competencyTypes: string[];
  onViewDetails?: () => void;
}

const PositionCompetencyHeatmap = ({ 
  data, 
  competencyTypes,
  onViewDetails 
}: PositionCompetencyHeatmapProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Get position types for filtering
  const positionTypes = Array.from(new Set(data.map(item => item.type)));
  
  // Get unique positions
  const positions = data.map(item => item.position);
  
  // Sort data by position type and then by position name
  const sortedData = [...data].sort((a, b) => {
    if (a.type !== b.type) {
      return positionTypes.indexOf(a.type) - positionTypes.indexOf(b.type);
    }
    return a.position.localeCompare(b.position);
  });
  
  // Create matrix for heatmap
  const createHeatmapMatrix = () => {
    const matrix: number[][] = [];
    
    for (const item of sortedData) {
      const row: number[] = [];
      
      for (const competency of competencyTypes) {
        const competencyData = item.competencies.find(c => c.competency === competency);
        row.push(competencyData ? competencyData.level : 0);
      }
      
      matrix.push(row);
    }
    
    return matrix;
  };
  
  // Function to draw the heatmap
  const drawHeatmap = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const matrix = createHeatmapMatrix();
    const rowCount = sortedData.length;
    const colCount = competencyTypes.length;
    
    // Set canvas dimensions
    canvas.width = colCount * 60 + 200; // Cell width + margin for row labels
    canvas.height = rowCount * 30 + 100; // Cell height + margin for column labels
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw column headers (competency types)
    ctx.font = '12px Arial';
    ctx.fillStyle = '#6b7280';
    ctx.textAlign = 'center';
    
    competencyTypes.forEach((competency, colIndex) => {
      const x = 200 + colIndex * 60 + 30;
      const y = 70;
      
      // Adjust for long competency names
      const displayText = competency.length > 12 
        ? competency.substring(0, 10) + '...'
        : competency;
      
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(-Math.PI / 4); // Rotate -45 degrees
      ctx.fillText(displayText, 0, 0);
      ctx.restore();
    });
    
    // Draw position type groups
    let currentType = '';
    let groupStartY = 100;
    
    sortedData.forEach((item, rowIndex) => {
      const y = 100 + rowIndex * 30;
      
      // Draw position type group headers
      if (item.type !== currentType) {
        currentType = item.type;
        groupStartY = y;
        
        ctx.fillStyle = '#1f2937';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(item.type, 10, y - 5);
        
        // Draw line
        ctx.strokeStyle = '#e5e7eb';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(10, y + 10);
        ctx.lineTo(190, y + 10);
        ctx.stroke();
      }
      
      // Draw row labels (position names)
      ctx.font = '12px Arial';
      ctx.fillStyle = '#4b5563';
      ctx.textAlign = 'left';
      ctx.fillText(item.position, 10, y + 15);
      
      // Draw position count
      ctx.textAlign = 'right';
      ctx.fillStyle = '#9ca3af';
      ctx.fillText(`(${formatNumber(item.count)})`, 190, y + 15);
    });
    
    // Draw heatmap cells
    matrix.forEach((row, rowIndex) => {
      row.forEach((value, colIndex) => {
        const x = 200 + colIndex * 60;
        const y = 100 + rowIndex * 30;
        const width = 60;
        const height = 30;
        
        // Set color based on value (competency level)
        let cellColor;
        switch (value) {
          case 1: cellColor = '#fee2e2'; break; // Red-50
          case 2: cellColor = '#fef3c7'; break; // Amber-50
          case 3: cellColor = '#ecfccb'; break; // Lime-50
          case 4: cellColor = '#d1fae5'; break; // Emerald-50
          case 5: cellColor = '#bfdbfe'; break; // Blue-100
          default: cellColor = '#f9fafb'; // Gray-50
        }
        
        // Draw cell background
        ctx.fillStyle = cellColor;
        ctx.fillRect(x, y, width, height);
        
        // Draw cell border
        ctx.strokeStyle = '#e5e7eb';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, width, height);
        
        // Draw value text if value is not zero
        if (value > 0) {
          ctx.fillStyle = '#1f2937';
          ctx.font = 'bold 12px Arial';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(value.toString(), x + width / 2, y + height / 2);
        }
      });
    });
    
    // Draw legend
    const legendX = 10;
    const legendY = 100 + rowCount * 30 + 30;
    
    ctx.font = 'bold 12px Arial';
    ctx.fillStyle = '#1f2937';
    ctx.textAlign = 'left';
    ctx.fillText('Level Kompetensi:', legendX, legendY);
    
    const legendColors = ['#fee2e2', '#fef3c7', '#ecfccb', '#d1fae5', '#bfdbfe'];
    const legendLabels = ['Dasar (1)', 'Pemula (2)', 'Madya (3)', 'Mahir (4)', 'Ahli (5)'];
    
    legendColors.forEach((color, index) => {
      const x = legendX + index * 110;
      const y = legendY + 15;
      
      // Draw legend box
      ctx.fillStyle = color;
      ctx.fillRect(x, y, 20, 20);
      ctx.strokeStyle = '#e5e7eb';
      ctx.lineWidth = 1;
      ctx.strokeRect(x, y, 20, 20);
      
      // Draw legend text
      ctx.fillStyle = '#4b5563';
      ctx.font = '12px Arial';
      ctx.textAlign = 'left';
      ctx.fillText(legendLabels[index], x + 25, y + 15);
    });
  };
  
  useEffect(() => {
    drawHeatmap();
    
    // Resize handler
    const handleResize = () => {
      drawHeatmap();
    };
    
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [data, competencyTypes]);
  
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Lightbulb className="mr-2 h-5 w-5 text-gray-500" />
            <h3 className="text-lg font-semibold text-gray-800">Peta Kompetensi Jabatan</h3>
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
      
      <div className="p-6">
        <div className="mb-4">
          <p className="text-sm text-gray-500">
            Heatmap ini menunjukkan tingkat kompetensi untuk setiap jabatan berdasarkan skala 1-5.
            Semakin tinggi nilai, semakin tinggi tingkat kompetensi yang dibutuhkan.
          </p>
        </div>
        
        <div className="overflow-x-auto">
          <div className="min-w-[800px]">
            <canvas 
              ref={canvasRef} 
              className="w-full"
              style={{ height: `${sortedData.length * 30 + 150}px` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PositionCompetencyHeatmap; 