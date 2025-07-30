import React, { useMemo } from 'react';
import { Box, Typography, Paper, Chip } from '@mui/material';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend
} from 'recharts';
import { useData } from '../contexts/DataContext';

const HighSchoolChart: React.FC = () => {
  const { state } = useData();

  // Process data for the chart
  const chartData = useMemo(() => {
    const schoolCounts = state.students.reduce((acc, student) => {
      const school = student.highSchool?.trim();
      if (school) {
        acc[school] = (acc[school] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(schoolCounts)
      .map(([school, count]) => ({
        name: school,
        value: count,
        percentage: ((count / state.students.length) * 100).toFixed(1)
      }))
      .sort((a, b) => b.value - a.value); // Sort by count descending
  }, [state.students]);

  // Color scheme for pie slices
  const colors = [
    '#1976d2', '#2196f3', '#42a5f5', '#64b5f6', '#90caf9', '#bbdefb',
    '#f44336', '#e57373', '#ffb74d', '#ffd54f', '#aed581', '#81c784',
    '#4db6ac', '#4dd0e1', '#9575cd', '#ba68c8', '#ff8a65', '#ffab91'
  ];

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <Box
          sx={{
            backgroundColor: 'white',
            border: '1px solid #e0e0e0',
            borderRadius: '8px',
            padding: '12px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
          }}
        >
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {data.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {data.value} students ({data.percentage}%)
          </Typography>
        </Box>
      );
    }
    return null;
  };

  // Custom legend
  const CustomLegend = ({ payload }: any) => {
    if (!payload) return null;
    
    return (
      <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center' }}>
        {payload.slice(0, 8).map((entry: any, index: number) => (
          <Chip
            key={`legend-${index}`}
            label={`${entry.value} (${entry.payload.value})`}
            size="small"
            sx={{
              backgroundColor: entry.color,
              color: 'white',
              '& .MuiChip-label': {
                fontSize: '0.75rem'
              }
            }}
          />
        ))}
        {payload.length > 8 && (
          <Chip
            label={`+${payload.length - 8} more`}
            size="small"
            variant="outlined"
            sx={{ fontSize: '0.75rem' }}
          />
        )}
      </Box>
    );
  };

  if (chartData.length === 0) {
    return (
      <Paper elevation={2} sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" gutterBottom>
          High School Distribution
        </Typography>
        <Typography variant="body2" color="text.secondary">
          No high school data available
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper elevation={2} sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
        High School Distribution
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Student distribution across high schools
      </Typography>
      
      <Box sx={{ width: '100%', height: 350 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="45%"
              outerRadius={100}
              innerRadius={40}
              fill="#8884d8"
              dataKey="value"
              label={({ percentage }) => `${percentage}%`}
              labelLine={false}
            >
              {chartData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend content={<CustomLegend />} />
          </PieChart>
        </ResponsiveContainer>
      </Box>
      
      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="caption" color="text.secondary">
          Total: {state.students.length} students
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {chartData.length} high school{chartData.length !== 1 ? 's' : ''}
        </Typography>
      </Box>
    </Paper>
  );
};

export default React.memo(HighSchoolChart);
