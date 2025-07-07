import { theme } from '../constants/theme';
import { useTheme } from '../contexts/ThemeContext';

export const useThemedStyles = () => {
  const { isDark } = useTheme();
  
  const colors = isDark ? theme.colors.dark : theme.colors.light;
  
  const getThemedStyle = (lightStyle, darkStyle) => {
    return isDark ? darkStyle : lightStyle;
  };
  
  return {
    colors,
    isDark,
    getThemedStyle,
    theme,
  };
};
