import React, { useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  Dimensions,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

// Define el tipo de navegación (ajustalo según tus rutas)
type RootStackParamList = {
  MainHome: undefined;
  Registrate1: undefined;
  Login: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const WelcomeScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (token) {
          navigation.navigate('MainHome');
        }
      } catch (error) {
        console.error('Error checking auth token:', error);
      }
    };

    checkAuth();
  }, [navigation]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollViewContainer}>
        <View style={styles.div}>
          <View style={styles.div2}>
            <View style={styles.overlapGroup}>
              <View style={styles.ellipse} />
              <View style={styles.ellipse2} />
            </View>
            <View style={styles.frame}>
              <Image
                style={styles.isologoVariante}
                source={require('../assets/isologo.png')}
              />
            </View>
          </View>
          <View style={styles.frame2}>
            <View style={styles.text}>
              <Text style={styles.bienvenidoAVive}>Bienvenido a Vive+ 👋</Text>
              <Text style={styles.body}>
                Te damos la bienvenida{'\n'}a una vida más saludable
              </Text>
            </View>
            <View style={styles.frame3}>
              <Text style={styles.textWrapper}>
                Si es la primera vez que utilizas la app
              </Text>
              <TouchableOpacity
                style={styles.btnSignUp}
                onPress={() => navigation.navigate('Registrate1')}
              >
                <Text style={styles.textWrapper2}>Registrate</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.frame4}>
              <View style={styles.divWrapper}>
                <Text style={styles.p}>si ya tienes creada una cuenta</Text>
              </View>
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={styles.btnSignUp2}
                  onPress={() => navigation.navigate('Login')}
                >
                  <Text style={styles.textWrapper2}>Ingresá</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollViewContainer: {
    flexGrow: 1, // Permite que el contenido se expanda dentro del ScrollView
  },
  div: {
    backgroundColor: "#ffffff",
    width: '100%',
  },
  div2: {
    height: height * 0.3,
    position: "absolute",
    top: 0,
    width: '100%',
  },
  overlapGroup: {
    borderRadius: (width > height) ? 300 : 265.5,
    height: (width > height) ? height * 0.7 : height * 0.65,
    left: width * -0.24,
    position: "relative",
    top: height * -0.3, 
    width: (width > height) ? height * 0.7 : width * 1.5,
  },
  ellipse: {
    backgroundColor: "#14d3a7",
    borderRadius: 265.5,
    height: '100%',
    left: 0,
    opacity: 0.1,
    position: "absolute",
    top: 0,
    width: '100%',
  },
  ellipse2: {
    backgroundColor: "#14d3a7",
    borderRadius: 204.5,
    height: '77%',
    left: '12%',
    opacity: 0.1,
    position: "absolute",
    top: '8%',
    width: '77%',
  },
  frame: {
    alignItems: "flex-start",
    flexDirection: "column",
    gap: 10,
    left: width * 0.30,
    position: "absolute",
    top: height * 0.12,
  },
  isologoVariante: {
    height: 61,
    width: 180,
    resizeMode: 'contain',
  },
  frame2: {
    alignItems: "center",
    flexDirection: "column",
    gap: 41,
    left: '5%',
    position: "absolute",
    top: height * 0.4,
  },
  text: {
    alignItems: "center",
    flexDirection: "column",
    gap: 8,
    justifyContent: "center",
  },
  bienvenidoAVive: {
    color: "#3a90e6",
    fontSize: 28,
    fontWeight: "400",
    letterSpacing: -0.2,
    lineHeight: 36.4,
    textAlign: "center",
  },
  body: {
    color: "#8b96ab",
    fontSize: 16,
    fontWeight: "400",
    letterSpacing: 0.3,
    lineHeight: 24,
    textAlign: "center",
  },
  frame3: {
    alignItems: "center",
    flexDirection: "column",
    gap: 26,
  },
  textWrapper: {
    color: "#8b96ab",
    fontSize: 16,
    fontWeight: "400",
    letterSpacing: -0.08,
    lineHeight: 16,
    width: width * 0.8,
    textAlign: "center",
  },
  btnSignUp: {
    alignItems: "center",
    backgroundColor: "#3a90e6",
    borderRadius: 16,
    height: 48,
    justifyContent: "center",
    paddingVertical: 15,
    paddingHorizontal: 45,
    width: width * 0.9,
  },
  textWrapper2: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "400",
    letterSpacing: -0.08,
    lineHeight: 16,
    textAlign: "center",
  },
  frame4: {
    alignItems: "center",
    flexDirection: "column",
    gap: 10,
  },
  divWrapper: {
    alignItems: "center",
    gap: 10,
    justifyContent: "center",
    padding: 10,
  },
  p: {
    color: "#8b96ab",
    fontSize: 16,
    fontWeight: "400",
    letterSpacing: -0.08,
    lineHeight: 16,
    textAlign: "center",
  },
  buttonContainer: { // <-- agregado
    width: width * 0.9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
  },
  btnSignUp2: {
    alignItems: "center",
    backgroundColor: "#14d3a7",
    borderRadius: 16,
    height: 48,
    justifyContent: "center",
    paddingVertical: 15, 
    paddingHorizontal: 45,
    width: width * 0.9,
  },
});


export default WelcomeScreen;
