export const lightColors = {
  background: '#F2F2F7',
  surface: '#FFFFFF',
  primary: '#007AFF', // Classic iOS blue
  text: '#000000',
  textSecondary: '#8E8E93',
  border: '#E5E5EA',
  error: '#FF3B30',
  success: '#34C759',
  warning: '#FF9500',
  tabBar: '#FFFFFF',
  tabBarActive: '#007AFF',
  tabBarInactive: '#8E8E93',
  chatSender: '#007AFF',
  chatSenderText: '#FFFFFF',
  chatReceiver: '#E5E5EA',
  chatReceiverText: '#000000',
  badgeBeginner: '#E5F1FF',
  badgeInter: '#FFF0D9',
  badgeAdv: '#FFEBEB',
  inputBackground: '#F2F2F7',
};

export const darkColors = {
  background: '#121212',
  surface: '#1E1E1E',
  primary: '#00FF66', // Neon Green
  text: '#FFFFFF',
  textSecondary: '#A0A0A5',
  border: '#333333',
  error: '#FF453A',
  success: '#32D74B',
  warning: '#FF9F0A',
  tabBar: '#121212',
  tabBarActive: '#00FF66',
  tabBarInactive: '#666666',
  chatSender: '#00FF66',
  chatSenderText: '#000000',
  chatReceiver: '#1E1E1E',
  chatReceiverText: '#FFFFFF',
  badgeBeginner: '#1A3320', // Dark green tint
  badgeInter: '#332400', // Dark orange tint
  badgeAdv: '#331212', // Dark red tint
  inputBackground: '#2C2C2E',
};

export type ThemeColors = typeof lightColors;

export const useAppTheme = (isDark: boolean): ThemeColors => {
  return isDark ? darkColors : lightColors;
};
