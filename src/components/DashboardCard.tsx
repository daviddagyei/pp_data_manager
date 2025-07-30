import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardActions,
  Typography,
  Box,
  IconButton,
  Skeleton,
  useTheme,
} from '@mui/material';
import { motion } from 'framer-motion';

interface DashboardCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  loading?: boolean;
  height?: string | number;
  onClick?: () => void;
  hoverable?: boolean;
  icon?: React.ReactNode;
  headerAction?: React.ReactNode;
  className?: string;
}

export default function DashboardCard({
  title,
  subtitle,
  children,
  actions,
  loading = false,
  height = 'auto',
  onClick,
  hoverable = true,
  icon,
  headerAction,
  className,
}: DashboardCardProps) {
  const theme = useTheme();

  const cardVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.3,
        ease: [0.4, 0, 0.2, 1] as const,
      }
    },
    hover: hoverable ? {
      y: -4,
      transition: {
        duration: 0.2,
        ease: [0.4, 0, 0.2, 1] as const,
      }
    } : {},
  };

  const CardComponent = motion.div;

  return (
    <CardComponent
      variants={cardVariants}
      initial="initial"
      animate="animate"
      whileHover="hover"
      className={className}
    >
      <Card
        sx={{
          height,
          cursor: onClick ? 'pointer' : 'default',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 4,
            background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            opacity: 0,
            transition: 'opacity 0.3s ease',
          },
          '&:hover::before': hoverable ? {
            opacity: 1,
          } : {},
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
        onClick={onClick}
      >
        <CardHeader
          avatar={icon}
          action={headerAction}
          title={
            loading ? (
              <Skeleton variant="text" width="60%" height={28} />
            ) : (
              <Typography
                variant="h6"
                component="h2"
                sx={{
                  fontWeight: 600,
                  fontSize: '1.125rem',
                  color: 'text.primary',
                }}
              >
                {title}
              </Typography>
            )
          }
          subheader={
            loading ? (
              <Skeleton variant="text" width="40%" height={20} />
            ) : subtitle ? (
              <Typography
                variant="body2"
                sx={{
                  color: 'text.secondary',
                  mt: 0.5,
                }}
              >
                {subtitle}
              </Typography>
            ) : null
          }
          sx={{
            pb: 1,
            '& .MuiCardHeader-content': {
              overflow: 'hidden',
            },
          }}
        />

        <CardContent sx={{ pt: 0, pb: actions ? 1 : 2 }}>
          {loading ? (
            <Box>
              <Skeleton variant="text" width="100%" height={20} sx={{ mb: 1 }} />
              <Skeleton variant="text" width="80%" height={20} sx={{ mb: 1 }} />
              <Skeleton variant="rectangular" width="100%" height={100} sx={{ borderRadius: 1 }} />
            </Box>
          ) : (
            children
          )}
        </CardContent>

        {actions && !loading && (
          <CardActions sx={{ px: 2, pb: 2, pt: 0 }}>
            {actions}
          </CardActions>
        )}
      </Card>
    </CardComponent>
  );
}

// Specialized card components for common use cases

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  loading?: boolean;
}

export function StatCard({ title, value, subtitle, icon, loading }: StatCardProps) {
  return (
    <DashboardCard
      title={title}
      subtitle={subtitle}
      icon={icon}
      loading={loading}
      hoverable={true}
      height="200px"
    >
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        textAlign: 'center'
      }}>
        <Typography
          variant="h3"
          component="div"
          sx={{
            fontWeight: 700,
            fontSize: '2.25rem',
            color: 'text.primary',
            lineHeight: 1,
            mb: 1,
          }}
        >
          {value}
        </Typography>
        {subtitle && (
          <Typography variant="body2" color="text.secondary">
            {subtitle}
          </Typography>
        )}
      </Box>
    </DashboardCard>
  );
}

interface ChartCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  height?: string | number;
  loading?: boolean;
}

export function ChartCard({ title, subtitle, children, height = 300, loading }: ChartCardProps) {
  return (
    <DashboardCard
      title={title}
      subtitle={subtitle}
      height={height}
      loading={loading}
      hoverable={false}
    >
      <Box sx={{ height: '100%', minHeight: 200 }}>
        {children}
      </Box>
    </DashboardCard>
  );
}
