import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  IconButton
} from '@mui/material';
import {
  ExpandMore,
  Search,
  Clear,
  FilterList
} from '@mui/icons-material';
import { useData } from '../contexts/DataContext';
import type { FilterOptions } from '../types';

const SearchAndFilter: React.FC = () => {
  const { state, setSearchQuery, setFilters } = useData();
  const [localSearchQuery, setLocalSearchQuery] = useState(state.searchQuery);
  const [filters, setLocalFilters] = useState<FilterOptions>({});

  // Get unique values for filter options
  const graduationYears = Array.from(
    new Set(state.students.map(s => s.graduationYear))
  ).sort();
  
  const highSchools = Array.from(
    new Set(state.students.map(s => s.highSchool))
  ).sort();

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value;
    setLocalSearchQuery(query);
    setSearchQuery(query);
  };

  const handleFilterChange = (newFilters: Partial<FilterOptions>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setLocalFilters(updatedFilters);
    setFilters(updatedFilters);
  };

  const clearFilters = () => {
    setLocalFilters({});
    setFilters({});
    setLocalSearchQuery('');
    setSearchQuery('');
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== undefined) || localSearchQuery;

  return (
    <Paper elevation={1} sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
        <Box sx={{ flexGrow: 1 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search students by name, email, or school..."
            value={localSearchQuery}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: <Search sx={{ color: 'text.secondary', mr: 1 }} />,
              endAdornment: localSearchQuery && (
                <IconButton
                  size="small"
                  onClick={() => {
                    setLocalSearchQuery('');
                    setSearchQuery('');
                  }}
                >
                  <Clear />
                </IconButton>
              )
            }}
          />
        </Box>
        
        {hasActiveFilters && (
          <Button
            variant="outlined"
            startIcon={<Clear />}
            onClick={clearFilters}
          >
            Clear All
          </Button>
        )}
      </Box>

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FilterList />
            <Typography>Advanced Filters</Typography>
            {hasActiveFilters && (
              <Typography variant="caption" color="primary">
                (Active)
              </Typography>
            )}
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
            <Box sx={{ minWidth: 200, flex: 1 }}>
              <FormControl fullWidth>
                <InputLabel>Graduation Year</InputLabel>
                <Select
                  value={filters.graduationYear || ''}
                  label="Graduation Year"
                  onChange={(e) => handleFilterChange({ 
                    graduationYear: e.target.value ? Number(e.target.value) : undefined 
                  })}
                >
                  <MenuItem value="">All Years</MenuItem>
                  {graduationYears.map(year => (
                    <MenuItem key={year} value={year}>
                      {year}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            <Box sx={{ minWidth: 200, flex: 1 }}>
              <FormControl fullWidth>
                <InputLabel>High School</InputLabel>
                <Select
                  value={filters.highSchool || ''}
                  label="High School"
                  onChange={(e) => handleFilterChange({ 
                    highSchool: e.target.value || undefined 
                  })}
                >
                  <MenuItem value="">All Schools</MenuItem>
                  {highSchools.map(school => (
                    <MenuItem key={school} value={school}>
                      {school}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            <Box sx={{ minWidth: 150 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={filters.parentFormCompleted || false}
                    onChange={(e) => handleFilterChange({ 
                      parentFormCompleted: e.target.checked || undefined 
                    })}
                  />
                }
                label="Parent Form Completed"
              />
            </Box>

            <Box sx={{ minWidth: 150 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={filters.careerExplorationCompleted || false}
                    onChange={(e) => handleFilterChange({ 
                      careerExplorationCompleted: e.target.checked || undefined 
                    })}
                  />
                }
                label="Career Exploration"
              />
            </Box>

            <Box sx={{ minWidth: 150 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={filters.collegeExplorationCompleted || false}
                    onChange={(e) => handleFilterChange({ 
                      collegeExplorationCompleted: e.target.checked || undefined 
                    })}
                  />
                }
                label="College Exploration"
              />
            </Box>
          </Box>
        </AccordionDetails>
      </Accordion>
    </Paper>
  );
};

export default SearchAndFilter;
