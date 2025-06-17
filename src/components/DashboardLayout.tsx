import React from 'react';
import { Grid, Container } from '@mui/material';
import { motion } from 'framer-motion';

interface DashboardLayoutProps {
  children: React.ReactNode;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | false;
  spacing?: number;
}

export default function DashboardLayout({ 
  children, 
  maxWidth = 'xl', 
  spacing = 3 
}: DashboardLayoutProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
  };

  return (
    <Container 
      maxWidth={maxWidth} 
      sx={{ 
        py: { xs: 2, md: 4 },
        px: { xs: 2, md: 3 },
      }}
    >
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <Grid container spacing={spacing}>
          {children}
        </Grid>
      </motion.div>
    </Container>
  );
}

// Grid item wrapper with consistent spacing and responsive behavior
interface DashboardGridItemProps {
  children: React.ReactNode;
  xs?: number;
  sm?: number;
  md?: number;
  lg?: number;
  xl?: number;
  className?: string;
}

export function DashboardGridItem({
  children,
  xs = 12,
  sm,
  md,
  lg,
  xl,
  className,
}: DashboardGridItemProps) {
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: [0.4, 0, 0.2, 1] as const,
      },
    },
  };

  return (
    <Grid item xs={xs} sm={sm} md={md} lg={lg} xl={xl} className={className}>
      <motion.div variants={itemVariants}>
        {children}
      </motion.div>
    </Grid>
  );
}

// Common layout patterns
interface StatsGridProps {
  children: React.ReactNode;
}

export function StatsGrid({ children }: StatsGridProps) {
  return (
    <DashboardLayout spacing={3}>
      {React.Children.map(children, (child, index) => (
        <DashboardGridItem 
          key={index}
          xs={12} 
          sm={6} 
          md={3}
        >
          {child}
        </DashboardGridItem>
      ))}
    </DashboardLayout>
  );
}

interface TwoColumnLayoutProps {
  leftColumn: React.ReactNode;
  rightColumn: React.ReactNode;
  leftColumnSize?: number;
  rightColumnSize?: number;
}

export function TwoColumnLayout({ 
  leftColumn, 
  rightColumn, 
  leftColumnSize = 8, 
  rightColumnSize = 4 
}: TwoColumnLayoutProps) {
  return (
    <DashboardLayout>
      <DashboardGridItem xs={12} lg={leftColumnSize}>
        {leftColumn}
      </DashboardGridItem>
      <DashboardGridItem xs={12} lg={rightColumnSize}>
        {rightColumn}
      </DashboardGridItem>
    </DashboardLayout>
  );
}

interface ThreeColumnLayoutProps {
  children: React.ReactNode;
}

export function ThreeColumnLayout({ children }: ThreeColumnLayoutProps) {
  return (
    <DashboardLayout>
      {React.Children.map(children, (child, index) => (
        <DashboardGridItem 
          key={index}
          xs={12} 
          md={6} 
          lg={4}
        >
          {child}
        </DashboardGridItem>
      ))}
    </DashboardLayout>
  );
}
