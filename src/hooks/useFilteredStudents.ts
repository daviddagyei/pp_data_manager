import { useState, useEffect } from 'react';
import type { Student } from '../types';

export const useFilteredStudents = (initialStudents: Student[] = []) => {
  const [filteredStudents, setFilteredStudents] = useState<Student[]>(initialStudents);

  useEffect(() => {
    const handleFilteredStudentsChange = () => {
      const filtered = (window as any).__filteredStudents || initialStudents;
      setFilteredStudents(filtered);
    };

    // Listen for filtered students updates
    window.addEventListener('filteredStudentsChanged', handleFilteredStudentsChange);
    
    // Initial load
    handleFilteredStudentsChange();

    return () => {
      window.removeEventListener('filteredStudentsChanged', handleFilteredStudentsChange);
    };
  }, [initialStudents]);

  return filteredStudents;
};
