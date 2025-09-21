import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import HomeTabs from './Home';
import CustomDrawer from './CustomDrawer';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

// Define tus rutas si no lo hiciste aún
type RootStackParamList = {
  Welcome: undefined;
  MainHome: undefined;
};

type DrawerNavigatorProps = {
  navigation: NativeStackNavigationProp<RootStackParamList>;
};

const DrawerNavigator: React.FC<DrawerNavigatorProps> = ({ navigation }) => {
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);

  const toggleDrawer = () => setDrawerOpen(!drawerOpen);
  const closeDrawer = () => drawerOpen && setDrawerOpen(false);

  return (
    <View style={styles.container}>
      {drawerOpen && (
        <TouchableOpacity style={styles.overlay} onPress={closeDrawer}>
          <View style={styles.drawer}>
            <CustomDrawer navigation={navigation as any} />
          </View>
        </TouchableOpacity>
      )}
      <View style={styles.content}>
        <TouchableOpacity style={styles.menuButton} onPress={toggleDrawer}>
          <Ionicons name="menu" size={32} color="#000" />
        </TouchableOpacity>
        <HomeTabs />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    position: 'absolute',
    width: '100%',
    height: '100%',
    zIndex: 1,
  },
  drawer: {
    width: '60%',
    backgroundColor: '#fff',
    height: '100%',
  },
  content: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  menuButton: {
    padding: 20,
  },
});


export default DrawerNavigator;
