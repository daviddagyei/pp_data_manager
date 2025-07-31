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
  const [eventFilter, setEventFilter] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);
  const debouncedSearchQuery = useDebounce(localSearchQuery, 300);

  // Memoize filter options
  const filterOptions = useMemo(() => {
    const schools = Array.from(new Set(signIns.map(s => s.school).filter(Boolean))).sort();
    const gradYears = Array.from(new Set(signIns.map(s => s.gradYear).filter(Boolean))).sort();
    const events = Array.from(new Set(signIns.map(s => s.event).filter(Boolean))).sort();
    return { schools, gradYears, events };
  }, [signIns]);

  // Filter and search logic
  const filteredRows = useMemo(() => {
    return signIns.filter(row => {
      const matchesSearch = debouncedSearchQuery.trim() === '' ||
        row.firstName.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        row.lastName.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        row.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        row.email.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        row.school.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        row.phone.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        row.event.toLowerCase().includes(debouncedSearchQuery.toLowerCase());
      const matchesSchool = !schoolFilter || row.school === schoolFilter;
      const matchesGradYear = !gradYearFilter || row.gradYear === gradYearFilter;
      const matchesEvent = !eventFilter || row.event === eventFilter;
      return matchesSearch && matchesSchool && matchesGradYear && matchesEvent;
    });
  }, [signIns, debouncedSearchQuery, schoolFilter, gradYearFilter, eventFilter]);

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
    setEventFilter('');
  }, []);

  return (
    <Paper elevation={1} sx={{ p: 2, mb: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
        <Box sx={{ flexGrow: 1 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search sign-ins by name, email, school, phone, or event..."
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
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
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
            <FormControl sx={{ minWidth: 160 }}>
              <InputLabel>Event</InputLabel>
              <Select
                value={eventFilter}
                label="Event"
                onChange={e => setEventFilter(e.target.value)}
              >
                <MenuItem value="">All</MenuItem>
                {filterOptions.events.map(event => (
                  <MenuItem key={event} value={event}>{event}</MenuItem>
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
