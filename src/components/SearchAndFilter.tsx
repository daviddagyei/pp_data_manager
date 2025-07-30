/**
 * SearchAndFilter Component - Hybrid Local Filtering Implementation
 * 
 * This component provides search and filtering functionality with local state management
 * for maximum smoothness, similar to the sign-ins page approach:
 * 
 * 1. LOCAL FILTERING:
 *    - All filtering happens locally using useMemo
 *    - No context updates during search/filter operations
 *    - Results passed up via callback to parent
 * 
 * 2. DEBOUNCED SEARCH INPUT:
 *    - Uses local state for immediate UI feedback
 *    - 300ms debounce for optimal responsiveness
 *    - No context state changes during typing
 * 
 * 3. MEMOIZED FILTER OPTIONS & RESULTS:
 *    - Filter options computed only when raw students data changes
 *    - Filtered results computed only when filters or search change
 *    - Prevents unnecessary recalculations
 * 
 * 4. CALLBACK-BASED UPDATES:
 *    - Uses onFilter callback to update parent component
 *    - Similar to sign-ins page architecture
 *    - Minimal context state changes
 * 
 * Performance Benefits:
 * - Eliminates context cascade re-renders during search
 * - Matches sign-ins page smoothness exactly
 * - Maintains responsive UI without context overhead
 * - Local state changes only, global state stable
 */

import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
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
import ExportButton from './ExportButton';
import type { Student } from '../types';

interface SearchAndFilterProps {
  onFilter: (filteredStudents: Student[]) => void;
}

const SearchAndFilter: React.FC<SearchAndFilterProps> = ({ onFilter }) => {
  const { state } = useData(); // Only read students data, no setters
  
  // Local filter state
  const [localSearchQuery, setLocalSearchQuery] = useState('');
  const [graduationYearFilter, setGraduationYearFilter] = useState<number | undefined>();
  const [highSchoolFilter, setHighSchoolFilter] = useState<string | undefined>();
  const [parentFormFilter, setParentFormFilter] = useState<boolean | undefined>();
  const [careerExplorationFilter, setCareerExplorationFilter] = useState<boolean | undefined>();
  const [collegeExplorationFilter, setCollegeExplorationFilter] = useState<boolean | undefined>();
  
  const searchInputRef = useRef<HTMLInputElement>(null);
  const debouncedSearchQuery = useDebounce(localSearchQuery, 300);

  // Memoize filter options
  const filterOptions = useMemo(() => {
    const graduationYears = Array.from(
      new Set(state.students.map(s => s.graduationYear).filter(year => year))
    ).sort((a, b) => b - a);
    
    const highSchools = Array.from(
      new Set(state.students.map(s => s.highSchool).filter(school => school?.trim()))
    ).sort();

    return { graduationYears, highSchools };
  }, [state.students]);

  // Local filtering logic - similar to sign-ins page
  const filteredStudents = useMemo(() => {
    return state.students.filter(student => {
      // Search filter
      const matchesSearch = debouncedSearchQuery.trim() === '' ||
        student.firstName.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        student.lastName.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        student.email.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        student.highSchool.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        (student.parentName?.toLowerCase().includes(debouncedSearchQuery.toLowerCase())) ||
        (student.parentEmail?.toLowerCase().includes(debouncedSearchQuery.toLowerCase()));
      
      // Other filters
      const matchesGradYear = !graduationYearFilter || student.graduationYear === graduationYearFilter;
      const matchesHighSchool = !highSchoolFilter || student.highSchool.toLowerCase().includes(highSchoolFilter.toLowerCase());
      const matchesParentForm = parentFormFilter === undefined || student.parentForm === parentFormFilter;
      const matchesCareerExploration = careerExplorationFilter === undefined || 
        (careerExplorationFilter ? !!student.careerExploration : !student.careerExploration);
      const matchesCollegeExploration = collegeExplorationFilter === undefined ||
        (collegeExplorationFilter ? !!student.collegeExploration : !student.collegeExploration);
      
      return matchesSearch && matchesGradYear && matchesHighSchool && 
             matchesParentForm && matchesCareerExploration && matchesCollegeExploration;
    });
  }, [state.students, debouncedSearchQuery, graduationYearFilter, highSchoolFilter, 
      parentFormFilter, careerExplorationFilter, collegeExplorationFilter]);

  // Call onFilter whenever filteredStudents changes
  useEffect(() => {
    onFilter(filteredStudents);
  }, [filteredStudents, onFilter]);

  // Auto-focus search input
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInputRef.current && !document.querySelector('[role="dialog"]')) {
        searchInputRef.current.focus();
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [filteredStudents.length]);

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    return localSearchQuery.trim() !== '' || 
           graduationYearFilter !== undefined || 
           highSchoolFilter !== undefined ||
           parentFormFilter !== undefined ||
           careerExplorationFilter !== undefined ||
           collegeExplorationFilter !== undefined;
  }, [localSearchQuery, graduationYearFilter, highSchoolFilter, parentFormFilter, careerExplorationFilter, collegeExplorationFilter]);

  // Event handlers
  const handleSearchChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setLocalSearchQuery(event.target.value);
  }, []);

  const clearAllFilters = useCallback(() => {
    setLocalSearchQuery('');
    setGraduationYearFilter(undefined);
    setHighSchoolFilter(undefined);
    setParentFormFilter(undefined);
    setCareerExplorationFilter(undefined);
    setCollegeExplorationFilter(undefined);
  }, []);

  const clearSearch = useCallback(() => {
    setLocalSearchQuery('');
  }, []);

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
            inputRef={searchInputRef}
            InputProps={{
              startAdornment: <Search sx={{ color: 'text.secondary', mr: 1 }} />,
              endAdornment: localSearchQuery && (
                <IconButton size="small" onClick={clearSearch}>
                  <Clear />
                </IconButton>
              )
            }}
          />
        </Box>
        
        <ExportButton 
          filteredStudents={filteredStudents}
          disabled={state.loading}
        />
        
        {hasActiveFilters && (
          <Button
            variant="outlined"
            startIcon={<Clear />}
            onClick={clearAllFilters}
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
                  value={graduationYearFilter || ''}
                  label="Graduation Year"
                  onChange={(e) => setGraduationYearFilter(e.target.value ? Number(e.target.value) : undefined)}
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
                  value={highSchoolFilter || ''}
                  label="High School"
                  onChange={(e) => setHighSchoolFilter(e.target.value || undefined)}
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
                    checked={parentFormFilter || false}
                    onChange={(e) => setParentFormFilter(e.target.checked || undefined)}
                  />
                }
                label="Parent Form Completed"
              />
            </Box>

            <Box sx={{ minWidth: 150 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={careerExplorationFilter || false}
                    onChange={(e) => setCareerExplorationFilter(e.target.checked || undefined)}
                  />
                }
                label="Career Exploration"
              />
            </Box>

            <Box sx={{ minWidth: 150 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={collegeExplorationFilter || false}
                    onChange={(e) => setCollegeExplorationFilter(e.target.checked || undefined)}
                  />
                }
                label="College Exploration"
              />
            </Box>
          </Box>
        </AccordionDetails>
      </Accordion>
      
      <Box sx={{ mt: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Showing {filteredStudents.length} of {state.students.length} students
        </Typography>
      </Box>
    </Paper>
  );
};

export default React.memo(SearchAndFilter);
