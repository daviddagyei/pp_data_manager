/**
 * SearchAndFilter Component - Optimized Performance Implementation
 * 
 * This component provides search and filtering functionality for the student data
 * with several performance optimizations:
 * 
 * 1. DEBOUNCED SEARCH INPUT:
 *    - Uses local state for immediate UI feedback (localSearchQuery)
 *    - Debounces context updates with 300ms delay to prevent excessive filtering
 *    - Only triggers context updates when the debounced value actually changes
 * 
 * 2. MEMOIZED FILTER OPTIONS:
 *    - Filter dropdown options (graduation years, high schools) are computed only
 *      when the students array changes, not on every render
 *    - Uses useMemo to cache expensive Set operations and array sorting
 * 
 * 3. OPTIMIZED EVENT HANDLERS:
 *    - All event handlers are wrapped in useCallback to prevent recreation
 *    - Filter changes update context immediately (no debouncing needed)
 *    - Search input changes only update local state immediately
 * 
 * 4. EFFICIENT STATE MANAGEMENT:
 *    - Separates immediate UI updates from expensive filtering operations
 *    - Uses context state as single source of truth for filter values
 *    - Automatically syncs local search with context when cleared externally
 * 
 * Performance Benefits:
 * - Reduces context updates from every keystroke to once per 300ms pause
 * - Eliminates redundant calculations of filter options
 * - Prevents unnecessary re-renders of components that consume context
 * - Maintains responsive UI while optimizing heavy operations
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
import { useDebounce } from '../hooks/useDebounce';
import type { FilterOptions } from '../types';

const SearchAndFilter: React.FC = () => {
  const { state, setSearchQuery, setFilters } = useData();
  
  // Local state for immediate UI updates
  const [localSearchQuery, setLocalSearchQuery] = useState(state.searchQuery);
  
  // Debounce the search query to prevent excessive filtering operations
  const debouncedSearchQuery = useDebounce(localSearchQuery, 300);
  
  // Apply debounced search query to the context only when it changes
  useEffect(() => {
    if (debouncedSearchQuery !== state.searchQuery) {
      setSearchQuery(debouncedSearchQuery);
    }
  }, [debouncedSearchQuery, setSearchQuery, state.searchQuery]);

  // Sync local search query with context when context changes (e.g., from clear all)
  useEffect(() => {
    if (state.searchQuery !== localSearchQuery && state.searchQuery !== debouncedSearchQuery) {
      setLocalSearchQuery(state.searchQuery);
    }
  }, [state.searchQuery, localSearchQuery, debouncedSearchQuery]);

  // Memoize filter options to avoid recalculating on every render
  const filterOptions = useMemo(() => {
    const graduationYears = Array.from(
      new Set(state.students.map(s => s.graduationYear).filter(year => year))
    ).sort((a, b) => b - a); // Sort descending (newest first)
    
    const highSchools = Array.from(
      new Set(state.students.map(s => s.highSchool).filter(school => school?.trim()))
    ).sort();

    return { graduationYears, highSchools };
  }, [state.students]); // Only recalculate when students data changes

  // Memoize active filters check to avoid recalculating on every render
  const hasActiveFilters = useMemo(() => {
    return Object.values(state.filters).some(value => value !== undefined && value !== '') || 
           localSearchQuery.trim() !== '';
  }, [state.filters, localSearchQuery]);
  // Optimized search input handler - only updates local state immediately
  const handleSearchChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value;
    setLocalSearchQuery(query);
    // The debounced effect above will handle updating the context after 300ms
  }, []);

  // Optimized filter change handler - updates context immediately for filters
  // (filters don't need debouncing as they're not typed character by character)
  const handleFilterChange = useCallback((newFilters: Partial<FilterOptions>) => {
    const updatedFilters = { ...state.filters, ...newFilters };
    setFilters(updatedFilters);
  }, [state.filters, setFilters]);

  // Clear all filters and search query
  const clearFilters = useCallback(() => {
    setFilters({});
    setLocalSearchQuery('');
    setSearchQuery('');
  }, [setFilters, setSearchQuery]);

  // Clear search input handler  
  const clearSearch = useCallback(() => {
    setLocalSearchQuery('');
    setSearchQuery('');
  }, [setSearchQuery]);

  return (
    <Paper elevation={1} sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
        <Box sx={{ flexGrow: 1 }}>            <TextField
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
                  onClick={clearSearch}
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
                  value={state.filters.graduationYear || ''}
                  label="Graduation Year"
                  onChange={(e) => handleFilterChange({ 
                    graduationYear: e.target.value ? Number(e.target.value) : undefined 
                  })}
                >
                  <MenuItem value="">All Years</MenuItem>
                  {filterOptions.graduationYears.map((year: number) => (
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
                  value={state.filters.highSchool || ''}
                  label="High School"
                  onChange={(e) => handleFilterChange({ 
                    highSchool: e.target.value || undefined 
                  })}
                >
                  <MenuItem value="">All Schools</MenuItem>
                  {filterOptions.highSchools.map((school: string) => (
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
                    checked={state.filters.parentFormCompleted || false}
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
                    checked={state.filters.careerExplorationCompleted || false}
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
                    checked={state.filters.collegeExplorationCompleted || false}
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
