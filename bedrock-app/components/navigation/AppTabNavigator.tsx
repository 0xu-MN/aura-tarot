import React from 'react';
import { View, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Txt } from '@toss/tds-react-native';
import { Route as HomeRoute } from '../../pages/home';
import { Route as LoungeRoute } from '../../pages/lounge';

interface AppTabNavigatorProps {
  currentPath?: string;
}

export const AppTabNavigator: React.FC<AppTabNavigatorProps> = ({ currentPath }) => {
  // We use the Route's push method directly for simplicity in this framework
  const homeNav = HomeRoute.useNavigation();
  const loungeNav = LoungeRoute.useNavigation();

  // Highlight logic based on path
  const isHome = currentPath?.includes('/home');
  const isLounge = currentPath?.includes('/lounge');

  // If we are not on either, we might want to hide (handled by parent)
  
  return (
    <View style={s.container}>
      <TouchableOpacity 
        style={s.tab} 
        onPress={() => homeNav.push('/home')}
        activeOpacity={0.7}
      >
        <Txt style={[s.icon, isHome && s.iconActive]}>✨</Txt>
        <Txt style={[s.label, isHome && s.labelActive]}>타로 홈</Txt>
      </TouchableOpacity>

      <TouchableOpacity 
        style={s.tab} 
        onPress={() => loungeNav.push('/lounge')}
        activeOpacity={0.7}
      >
        <Txt style={[s.icon, isLounge && s.iconActive]}>🏛️</Txt>
        <Txt style={[s.label, isLounge && s.labelActive]}>라운지</Txt>
      </TouchableOpacity>
    </View>
  );
};

const s = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: Platform.OS === 'ios' ? 84 : 64,
    backgroundColor: '#111113',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
    paddingBottom: Platform.OS === 'ios' ? 24 : 0,
    // Note: Parent will handle absolute positioning if needed
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  icon: {
    fontSize: 20,
    opacity: 0.5,
  },
  iconActive: {
    opacity: 1,
  },
  label: {
    fontSize: 10,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.4)',
  },
  labelActive: {
    color: '#DAA520',
  },
});
