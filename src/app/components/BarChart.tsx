import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const options: ChartOptions<'bar'> = {
  indexAxis: 'y', // ถูกต้อง
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    title: { display: false },
  },
  elements: {
    bar: {
      borderRadius: 6,
    },
  },
};

const labels = ['om', 'nds', 'italy', 'noe', 'pan', 'jtes', 'sina', 'any'];
const data = {
  labels,
  datasets: [
    {
      label: '',
      data: [350, 400, 500, 600, 900, 1100, 1200, 1350],
      backgroundColor: '#2563eb',
    },
  ],
};

export default function BarChart() {
  return (
    <div>
      {/* <div style={{display: 'flex', alignItems: 'center'}}>
        <span style={{fontWeight: 'bold', fontSize: '1.4rem', border: '3px solid #2563eb', padding:'2px 8px', color:'#2563eb', borderRadius: '3px'}}>Basic Bar Chart</span>
      </div> */}
      {/* <div style={{ height: 300 }}>
        <Bar data={data} options={options} />
      </div> */}
    </div>
  );
}