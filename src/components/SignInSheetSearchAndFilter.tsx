import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import {
  Box,
  TextField,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton
} from '@mui/material';
import {
  ExpandMore,
  Search,
  Clear,
  FilterList
} from '@mui/icons-material';
import { useDebounce } from '../hooks/useDebounce';

interface SignInSheetSearchAndFilterProps {
  signIns: any[];
  onFilter: (rows: any[]) => void;
}

const SignInSheetSearchAndFilter: React.FC<SignInSheetSearchAndFilterProps> = ({ signIns, onFilter }) => {
  const [localSearchQuery, setLocalSearchQuery] = useState('');
  const [schoolFilter, setSchoolFilter] = useState('');
  const [gradYearFilter, setGradYearFilter] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);
  const debouncedSearchQuery = useDebounce(localSearchQuery, 300);

  // Memoize filter options
  const filterOptions = useMemo(() => {
    const schools = Array.from(new Set(signIns.map(s => s.school).filter(Boolean))).sort();
    const gradYears = Array.from(new Set(signIns.map(s => s.gradYear).filter(Boolean))).sort();
    return { schools, gradYears };
  }, [signIns]);

  // Filter and search logic
  const filteredRows = useMemo(() => {
    return signIns.filter(row => {
      const matchesSearch = debouncedSearchQuery.trim() === '' ||
        row.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        row.email.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        row.school.toLowerCase().includes(debouncedSearchQuery.toLowerCase());
      const matchesSchool = !schoolFilter || row.school === schoolFilter;
      const matchesGradYear = !gradYearFilter || row.gradYear === gradYearFilter;
      return matchesSearch && matchesSchool && matchesGradYear;
    });
  }, [signIns, debouncedSearchQuery, schoolFilter, gradYearFilter]);

  // Call onFilter whenever filteredRows changes
  useEffect(() => {
    onFilter(filteredRows);
  }, [filteredRows, onFilter]);

  // Auto-focus search input
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInputRef.current && !document.querySelector('[role="dialog"]')) {
        searchInputRef.current.focus();
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [filteredRows.length]);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setLocalSearchQuery('');
    setSchoolFilter('');
    setGradYearFilter('');
  }, []);

  return (
    <Paper elevation={1} sx={{ p: 2, mb: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
        <Box sx={{ flexGrow: 1 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search sign-ins by name, email, or school..."
            value={localSearchQuery}
            onChange={e => setLocalSearchQuery(e.target.value)}
            inputRef={searchInputRef}
            InputProps={{
              startAdornment: <Search sx={{ color: 'text.secondary', mr: 1 }} />,
              endAdornment: localSearchQuery && (
                <IconButton size="small" onClick={() => setLocalSearchQuery('')}>
                  <Clear />
                </IconButton>
              )
            }}
          />
        </Box>
        <IconButton onClick={clearFilters} title="Clear Filters">
          <FilterList />
        </IconButton>
      </Box>
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Typography>Advanced Filters</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <FormControl sx={{ minWidth: 160 }}>
              <InputLabel>School</InputLabel>
              <Select
                value={schoolFilter}
                label="School"
                onChange={e => setSchoolFilter(e.target.value)}
              >
                <MenuItem value="">All</MenuItem>
                {filterOptions.schools.map(school => (
                  <MenuItem key={school} value={school}>{school}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl sx={{ minWidth: 120 }}>
              <InputLabel>Grad Year</InputLabel>
              <Select
                value={gradYearFilter}
                label="Grad Year"
                onChange={e => setGradYearFilter(e.target.value)}
              >
                <MenuItem value="">All</MenuItem>
                {filterOptions.gradYears.map(year => (
                  <MenuItem key={year} value={year}>{year}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </AccordionDetails>
      </Accordion>
      <Box sx={{ mt: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Showing {filteredRows.length} of {signIns.length} sign-ins
        </Typography>
      </Box>
    </Paper>
  );
};

export default SignInSheetSearchAndFilter;
