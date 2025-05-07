import { useEffect, useRef, useMemo } from 'react';
import { ArrowUpRight, Network } from 'lucide-react';
import { formatNumber } from '../../lib/utils';
import { useTheme } from '../../lib/ThemeContext';
import { useTranslation } from '../../lib/useTranslation';

interface PositionDistributionData {
  position: string;
  type: string;
  units: {
    unit: string;
    count: number;
  }[];
  total: number;
}

interface PositionUnitHeatmapProps {
  data: PositionDistributionData[];
  workUnits: string[];
  onViewDetails?: () => void;
}

const PositionUnitHeatmap = ({
  data,
  workUnits,
  onViewDetails
}: PositionUnitHeatmapProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { isDark, language } = useTheme();
  const { t } = useTranslation();
  
  // Get position types for filtering and sorting
  const positionTypes = [
    'Pejabat Pimpinan Tinggi',
    'Pejabat Administrator',
    'Pejabat Pengawas',
    'Pejabat Fungsional',
    'Pelaksana',
    'Non-ASN'
  ];
  
  // Sort data by position type (using predefined order) and then by position name
  const sortedData = [...data].sort((a, b) => {
    if (a.type !== b.type) {
      return positionTypes.indexOf(a.type) - positionTypes.indexOf(b.type);
    }
    return a.position.localeCompare(b.position);
  });
  
  // Filter data to show only important positions (based on total count)
  const topPositions = sortedData
    .filter(position => position.total > 20) // Only show positions with significant numbers
    .slice(0, 15); // Limit to top 15 positions for readability
  
  // Create matrix for heatmap
  const createHeatmapMatrix = () => {
    const matrix: number[][] = [];
    
    for (const position of topPositions) {
      const row: number[] = [];
      
      for (const workUnit of workUnits) {
        const unitData = position.units.find(u => u.unit === workUnit);
        row.push(unitData ? unitData.count : 0);
      }
      
      matrix.push(row);
    }
    
    return matrix;
  };

  // Function to normalize values for better color distribution
  const normalizeValue = (value: number, max: number) => {
    if (max === 0) return 0;
    // Use logarithmic scale for better visualization of distribution
    return Math.log(value + 1) / Math.log(max + 1);
  };
  
  // Function to draw the heatmap
  const drawHeatmap = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const matrix = createHeatmapMatrix();
    const rowCount = topPositions.length;
    const colCount = workUnits.length;
    
    // Find maximum value for color scaling
    let maxValue = 0;
    matrix.forEach(row => {
      row.forEach(value => {
        if (value > maxValue) maxValue = value;
      });
    });
    
    // Set canvas dimensions
    canvas.width = Math.max(colCount * 80 + 250, 800); // Cell width + margin for row labels
    canvas.height = rowCount * 40 + 150; // Cell height + margin for column labels
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw column headers (work units)
    ctx.font = '12px Arial';
    ctx.fillStyle = '#6b7280';
    ctx.textAlign = 'center';
    
    workUnits.forEach((unit, colIndex) => {
      const x = 250 + colIndex * 80 + 40;
      const y = 70;
      
      // Adjust for long unit names
      const displayText = unit.length > 15 
        ? unit.substring(0, 13) + '...'
        : unit;
      
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(-Math.PI / 4); // Rotate -45 degrees
      ctx.fillText(displayText, 0, 0);
      ctx.restore();
    });
    
    // Draw position type groups
    let currentType = '';
    
    topPositions.forEach((position, rowIndex) => {
      const y = 120 + rowIndex * 40;
      
      // Draw position type group headers
      if (position.type !== currentType) {
        currentType = position.type;
        
        ctx.fillStyle = '#1f2937';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(position.type, 10, y - 5);
        
        // Draw line
        ctx.strokeStyle = '#e5e7eb';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(10, y + 10);
        ctx.lineTo(240, y + 10);
        ctx.stroke();
      }
      
      // Draw row labels (position names)
      ctx.font = '12px Arial';
      ctx.fillStyle = '#4b5563';
      ctx.textAlign = 'left';
      ctx.fillText(position.position, 20, y + 15);
      
      // Draw position total count
      ctx.textAlign = 'right';
      ctx.fillStyle = '#9ca3af';
      ctx.fillText(`(${formatNumber(position.total)})`, 240, y + 15);
    });
    
    // Draw heatmap cells
    matrix.forEach((row, rowIndex) => {
      row.forEach((value, colIndex) => {
        const x = 250 + colIndex * 80;
        const y = 120 + rowIndex * 40;
        const width = 80;
        const height = 40;
        
        // Normalize value for color intensity
        const normalizedValue = normalizeValue(value, maxValue);
        
        // Set color based on normalized value
        let r = 255, g = 255, b = 255;
        
        if (value > 0) {
          // Use a blue gradient for cells with values
          r = Math.round(239 - normalizedValue * 200);
          g = Math.round(246 - normalizedValue * 190);
          b = Math.round(255 - normalizedValue * 100);
        }
        
        const cellColor = `rgb(${r}, ${g}, ${b})`;
        
        // Draw cell background
        ctx.fillStyle = cellColor;
        ctx.fillRect(x, y, width, height);
        
        // Draw cell border
        ctx.strokeStyle = '#e5e7eb';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, width, height);
        
        // Draw value text if value is not zero
        if (value > 0) {
          ctx.fillStyle = normalizedValue > 0.7 ? '#ffffff' : '#1f2937';
          ctx.font = 'bold 12px Arial';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(value.toString(), x + width / 2, y + height / 2);
        }
      });
    });
    
    // Draw legend
    const legendX = 10;
    const legendY = 120 + rowCount * 40 + 30;
    
    ctx.font = 'bold 12px Arial';
    ctx.fillStyle = '#1f2937';
    ctx.textAlign = 'left';
    ctx.fillText('Jumlah Pegawai:', legendX, legendY);
    
    // Create color stops for the legend
    const legendStops = 5;
    const legendWidth = 300;
    const legendHeight = 20;
    const legendStopWidth = legendWidth / legendStops;
    
    // Draw gradient legend
    for (let i = 0; i < legendStops; i++) {
      const normalizedValue = i / (legendStops - 1);
      const r = Math.round(239 - normalizedValue * 200);
      const g = Math.round(246 - normalizedValue * 190);
      const b = Math.round(255 - normalizedValue * 100);
      
      ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
      ctx.fillRect(legendX + i * legendStopWidth, legendY + 15, legendStopWidth, legendHeight);
      ctx.strokeStyle = '#e5e7eb';
      ctx.strokeRect(legendX + i * legendStopWidth, legendY + 15, legendStopWidth, legendHeight);
    }
    
    // Draw legend labels
    ctx.fillStyle = '#4b5563';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    
    // Calculate representative values for legend stops
    const legendValues = [];
    for (let i = 0; i < legendStops; i++) {
      const normalizedValue = i / (legendStops - 1);
      // Convert back from normalized to actual values
      const value = Math.round(Math.pow(maxValue + 1, normalizedValue) - 1);
      legendValues.push(value);
    }
    
    legendValues.forEach((value, i) => {
      ctx.fillText(
        value.toString(), 
        legendX + i * legendStopWidth + legendStopWidth / 2, 
        legendY + 15 + legendHeight + 15
      );
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
  }, [data, workUnits]);
  
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Network className="mr-2 h-5 w-5 text-gray-500" />
            <h3 className="text-lg font-semibold text-gray-800">
              {language === 'id' 
                ? 'Persebaran Jabatan pada Unit Kerja' 
                : 'Position Distribution by Work Unit'}
            </h3>
          </div>
          {onViewDetails && (
            <button 
              onClick={onViewDetails}
              className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
            >
              {language === 'id' ? 'Lihat Detail' : 'View Details'}
              <ArrowUpRight size={16} className="ml-1" />
            </button>
          )}
        </div>
      </div>
      
      <div className="p-6">
        <div className="mb-4">
          <p className="text-sm text-gray-500">
            {language === 'id'
              ? 'Heatmap ini menunjukkan distribusi jabatan di berbagai unit kerja. Semakin gelap warna sel, semakin banyak jumlah pegawai dengan jabatan tersebut di unit kerja terkait.'
              : 'This heatmap shows the distribution of positions across various work units. The darker the cell color, the higher number of employees with that position in the corresponding work unit.'}
          </p>
        </div>
        
        <div className="overflow-x-auto">
          <div className="min-w-[800px]">
            <canvas 
              ref={canvasRef} 
              className="w-full"
              style={{ height: `${topPositions.length * 40 + 200}px` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PositionUnitHeatmap; 