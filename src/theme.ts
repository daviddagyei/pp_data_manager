import { createTheme } from '@mui/material/styles';

// Design System: Color Tokens (WCAG AA compliant)
export const colorTokens = {
  primary: {
    50: '#e3f2fd',
    100: '#bbdefb',
    200: '#90caf9',
    300: '#64b5f6',
    400: '#42a5f5',
    500: '#2196f3', // Main primary
    600: '#1e88e5',
    700: '#1976d2',
    800: '#1565c0',
    900: '#0d47a1',
  },
  secondary: {
    50: '#fce4ec',
    100: '#f8bbd9',
    200: '#f48fb1',
    300: '#f06292',
    400: '#ec407a',
    500: '#e91e63', // Main secondary
    600: '#d81b60',
    700: '#c2185b',
    800: '#ad1457',
    900: '#880e4f',
  },
  neutral: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
  },
  success: {
    50: '#f0fdf4',
    500: '#22c55e',
    700: '#15803d',
  },
  warning: {
    50: '#fffbeb',
    500: '#f59e0b',
    700: '#a16207',
  },
  error: {
    50: '#fef2f2',
    500: '#ef4444',
    700: '#b91c1c',
  },
};

// Design System: Spacing Scale (4px base unit)
export const spacingScale = {
  xs: '0.25rem',   // 4px
  sm: '0.5rem',    // 8px
  md: '1rem',      // 16px
  lg: '1.5rem',    // 24px
  xl: '2rem',      // 32px
  '2xl': '2.5rem', // 40px
  '3xl': '3rem',   // 48px
  '4xl': '4rem',   // 64px
  '5xl': '6rem',   // 96px
};

// Design System: Typography Scale
export const typographyTokens = {
  fontFamily: {
    sans: ['Inter', 'Roboto', '"Helvetica Neue"', 'Arial', 'sans-serif'].join(','),
    mono: ['JetBrains Mono', '"Fira Code"', 'Consolas', 'monospace'].join(','),
  },
  fontSize: {
    xs: '0.75rem',   // 12px
    sm: '0.875rem',  // 14px
    base: '1rem',    // 16px
    lg: '1.125rem',  // 18px
    xl: '1.25rem',   // 20px
    '2xl': '1.5rem', // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem',  // 36px
    '5xl': '3rem',     // 48px
  },
  fontWeight: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },
};

// MUI Typography Configuration
const typography = {
  fontFamily: typographyTokens.fontFamily.sans,
  h1: {
    fontSize: typographyTokens.fontSize['4xl'],
    fontWeight: typographyTokens.fontWeight.bold,
    lineHeight: typographyTokens.lineHeight.tight,
    letterSpacing: '-0.025em',
  },
  h2: {
    fontSize: typographyTokens.fontSize['3xl'],
    fontWeight: typographyTokens.fontWeight.semibold,
    lineHeight: typographyTokens.lineHeight.tight,
    letterSpacing: '-0.025em',
  },
  h3: {
    fontSize: typographyTokens.fontSize['2xl'],
    fontWeight: typographyTokens.fontWeight.semibold,
    lineHeight: typographyTokens.lineHeight.normal,
  },
  h4: {
    fontSize: typographyTokens.fontSize.xl,
    fontWeight: typographyTokens.fontWeight.semibold,
    lineHeight: typographyTokens.lineHeight.normal,
  },
  h5: {
    fontSize: typographyTokens.fontSize.lg,
    fontWeight: typographyTokens.fontWeight.medium,
    lineHeight: typographyTokens.lineHeight.normal,
  },
  h6: {
    fontSize: typographyTokens.fontSize.base,
    fontWeight: typographyTokens.fontWeight.medium,
    lineHeight: typographyTokens.lineHeight.normal,
  },
  body1: {
    fontSize: typographyTokens.fontSize.base,
    lineHeight: typographyTokens.lineHeight.relaxed,
  },
  body2: {
    fontSize: typographyTokens.fontSize.sm,
    lineHeight: typographyTokens.lineHeight.normal,
  },
  caption: {
    fontSize: typographyTokens.fontSize.xs,
    lineHeight: typographyTokens.lineHeight.normal,
  },
  button: {
    textTransform: 'none' as const,
    fontWeight: typographyTokens.fontWeight.medium,
    fontSize: typographyTokens.fontSize.sm,
  }
};

// MUI Color Palette Configuration
const palette = {
  primary: {
    main: colorTokens.primary[600],
    light: colorTokens.primary[400],
    dark: colorTokens.primary[800],
    contrastText: '#ffffff',
  },
  secondary: {
    main: colorTokens.secondary[600],
    light: colorTokens.secondary[400],
    dark: colorTokens.secondary[800],
    contrastText: '#ffffff',
  },
  error: {
    main: colorTokens.error[500],
    light: colorTokens.error[50],
    dark: colorTokens.error[700],
    contrastText: '#ffffff',
  },
  warning: {
    main: colorTokens.warning[500],
    light: colorTokens.warning[50],
    dark: colorTokens.warning[700],
    contrastText: '#ffffff',
  },
  success: {
    main: colorTokens.success[500],
    light: colorTokens.success[50],
    dark: colorTokens.success[700],
    contrastText: '#ffffff',
  },
  background: {
    default: colorTokens.neutral[50],
    paper: '#ffffff',
  },
  text: {
    primary: colorTokens.neutral[900],
    secondary: colorTokens.neutral[600],
    disabled: colorTokens.neutral[400],
  },
  divider: colorTokens.neutral[200],
  grey: colorTokens.neutral,
};

// Design System: Shadows
export const shadowTokens = {
  xs: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  sm: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
};

// Design System: Border Radius
export const radiusTokens = {
  none: '0',
  sm: '0.125rem',  // 2px
  md: '0.375rem',  // 6px
  lg: '0.5rem',    // 8px
  xl: '0.75rem',   // 12px
  '2xl': '1rem',   // 16px
  full: '9999px',
};

// Define spacing using 4px base unit
const spacing = 4;

// Create the modern Material-UI theme
const theme = createTheme({
  palette,
  typography,
  spacing,
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: palette.background.default,
          margin: 0,
          padding: 0,
          boxSizing: 'border-box',
          fontFamily: typography.fontFamily,
        },
        '*': {
          boxSizing: 'inherit',
        },
        '*::before': {
          boxSizing: 'inherit',
        },
        '*::after': {
          boxSizing: 'inherit',
        },
        // Improve global typography and spacing
        'p, span, div, td, th, li, a': {
          lineHeight: typographyTokens.lineHeight.relaxed,
        },
        // Smooth scrolling
        html: {
          scrollBehavior: 'smooth',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: palette.background.paper,
          color: palette.text.primary,
          boxShadow: shadowTokens.sm,
          borderBottom: `1px solid ${palette.divider}`,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: radiusTokens.lg,
          padding: `${spacingScale.sm} ${spacingScale.md}`,
          fontSize: typographyTokens.fontSize.sm,
          fontWeight: typographyTokens.fontWeight.medium,
          textTransform: 'none',
          minHeight: '40px',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:focus-visible': {
            outline: `2px solid ${colorTokens.primary[500]}`,
            outlineOffset: '2px',
          },
        },
        contained: {
          boxShadow: shadowTokens.sm,
          '&:hover': {
            boxShadow: shadowTokens.md,
            transform: 'translateY(-1px)',
          },
          '&:active': {
            transform: 'translateY(0)',
            boxShadow: shadowTokens.sm,
          },
        },
        outlined: {
          borderWidth: '1.5px',
          '&:hover': {
            borderWidth: '1.5px',
            backgroundColor: `${colorTokens.primary[50]}`,
          },
        },
        text: {
          '&:hover': {
            backgroundColor: `${colorTokens.primary[50]}`,
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: radiusTokens.xl,
          boxShadow: shadowTokens.sm,
          border: `1px solid ${palette.divider}`,
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            boxShadow: shadowTokens.md,
            transform: 'translateY(-2px)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: radiusTokens.lg,
          backgroundImage: 'none',
        },
        elevation1: {
          boxShadow: shadowTokens.sm,
        },
        elevation2: {
          boxShadow: shadowTokens.md,
        },
        elevation4: {
          boxShadow: shadowTokens.lg,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: radiusTokens.lg,
            '&:hover fieldset': {
              borderColor: colorTokens.primary[400],
            },
            '&.Mui-focused fieldset': {
              borderWidth: '2px',
              borderColor: colorTokens.primary[500],
            },
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          backgroundColor: colorTokens.neutral[50],
          fontWeight: typographyTokens.fontWeight.semibold,
          fontSize: typographyTokens.fontSize.sm,
          borderBottom: `2px solid ${palette.divider}`,
          padding: spacingScale.md,
        },
        body: {
          padding: spacingScale.md,
          borderBottom: `1px solid ${colorTokens.neutral[100]}`,
        },
      },
    },
    MuiTableContainer: {
      styleOverrides: {
        root: {
          borderRadius: radiusTokens.lg,
          border: `1px solid ${palette.divider}`,
          overflow: 'hidden',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: radiusTokens.md,
          fontWeight: typographyTokens.fontWeight.medium,
          fontSize: typographyTokens.fontSize.xs,
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: radiusTokens.xl,
          boxShadow: shadowTokens.xl,
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          borderRadius: radiusTokens.lg,
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            backgroundColor: colorTokens.neutral[100],
            transform: 'scale(1.05)',
          },
          '&:focus-visible': {
            outline: `2px solid ${colorTokens.primary[500]}`,
            outlineOffset: '2px',
          },
        },
      },
    },
  },
});

export default theme;
