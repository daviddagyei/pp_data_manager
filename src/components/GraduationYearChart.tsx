import React, { useMemo } from 'react';
import { Box, Typography, Paper } from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { useData } from '../contexts/DataContext';

interface GraduationYearChartProps {
  bare?: boolean; // If true, renders without Paper wrapper and titles
}

const GraduationYearChart: React.FC<GraduationYearChartProps> = ({ bare = false }) => {
  const { state } = useData();

  // Process data for the chart
  const chartData = useMemo(() => {
    const yearCounts = state.students.reduce((acc, student) => {
      const year = student.graduationYear;
      if (year) {
        acc[year] = (acc[year] || 0) + 1;
      }
      return acc;
    }, {} as Record<number, number>);

    return Object.entries(yearCounts)
      .map(([year, count]) => ({
        year: year,
        count: count,
        label: `Class of ${year}`
      }))
      .sort((a, b) => parseInt(a.year) - parseInt(b.year));
  }, [state.students]);

  // Color scheme for bars - using Material-UI theme colors
  const colors = ['#1976d2', '#2196f3', '#42a5f5', '#64b5f6', '#90caf9', '#bbdefb'];

  if (chartData.length === 0) {
    const content = (
      <Box sx={{ textAlign: 'center', py: bare ? 4 : 0 }}>
        {!bare && (
          <Typography variant="h6" gutterBottom>
            Graduation Year Distribution
          </Typography>
        )}
        <Typography variant="body2" color="text.secondary">
          No graduation year data available
        </Typography>
      </Box>
    );

    return bare ? content : (
      <Paper elevation={2} sx={{ p: 3 }}>
        {content}
      </Paper>
    );
  }

  const chartContent = (
    <>
      {!bare && (
        <>
          <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
            Graduation Year Distribution
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Student count by graduation year
          </Typography>
        </>
      )}
      
      <Box sx={{ width: '100%', height: bare ? 350 : 300 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 20,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="year" 
              tick={{ fontSize: 12 }}
              tickLine={{ stroke: '#e0e0e0' }}
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              tickLine={{ stroke: '#e0e0e0' }}
              axisLine={{ stroke: '#e0e0e0' }}
            />
            <Tooltip 
              formatter={(value: any) => [value, 'Students']}
              labelFormatter={(label: any) => `Class of ${label}`}
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
              }}
            />
            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
              {chartData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Box>
      
      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="caption" color="text.secondary">
          Total: {state.students.length} students
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {chartData.length} graduation year{chartData.length !== 1 ? 's' : ''}
        </Typography>
      </Box>
    </>
  );

  return bare ? chartContent : (
    <Paper elevation={2} sx={{ p: 3 }}>
      {chartContent}
    </Paper>
  );
};

export default React.memo(GraduationYearChart);
