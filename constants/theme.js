export const theme = {
    colors: {
        white: '#fff',
        black: '#000',
        grayBG: '#f5f5f5',
        primary: '#3b82f6',
        rose: '#f43f5e',
        neutral: (opacity) => `rgba(10, 10, 10, ${opacity})`,
        
        // Light theme colors
        light: {
            background: '#FFFFFF',
            surface: '#F8FAFC',
            card: '#FFFFFF',
            text: '#1E293B',
            textSecondary: '#64748B',
            border: '#E2E8F0',
            accent: '#3B82F6',
            success: '#10B981',
            warning: '#F59E0B',
            error: '#EF4444',
        },
        
        // Dark theme colors
        dark: {
            background: '#121212', // Charcoal black
            surface: '#1E1E1E', // Slightly lighter for cards/surfaces
            card: '#2A2A2A', // Card background
            text: '#E0E0E0', // Light gray text
            textSecondary: '#B0B0B0', // Medium gray for secondary text
            border: '#444444', // Dark gray borders
            accent: '#6B7280', // Charcoal grey accent (instead of blue)
            success: '#4CAF50',
            warning: '#FF9800',
            error: '#F44336',
        }
    },
    
    fontSizes: {
        xs: 12,
        sm: 14,
        base: 16,
        lg: 18,
        xl: 20,
        '2xl': 24,
        '3xl': 30,
        '4xl': 36,
    },
    
    fontWeights: {
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
    },
    
    radius: {
        xs: 10,
        sm: 12,
        md: 14,
        lg: 16,
        xl: 18,
        xxl: 24,
    },
    
    spacing: {
        xs: 4,
        sm: 8,
        md: 12,
        lg: 16,
        xl: 20,
        xxl: 24,
    },
    
    shadows: {
        light: {
            shadowColor: '#000',
            shadowOffset: {
                width: 0,
                height: 2,
            },
            shadowOpacity: 0.1,
            shadowRadius: 3.84,
            elevation: 5,
        },
        medium: {
            shadowColor: '#000',
            shadowOffset: {
                width: 0,
                height: 4,
            },
            shadowOpacity: 0.15,
            shadowRadius: 6.27,
            elevation: 8,
        },
        heavy: {
            shadowColor: '#000',
            shadowOffset: {
                width: 0,
                height: 8,
            },
            shadowOpacity: 0.2,
            shadowRadius: 10.32,
            elevation: 12,
        },
    }
}