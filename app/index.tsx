import React, { useEffect, useState } from "react";
import { StyleSheet, View, ActivityIndicator } from "react-native";
import MapView, { PROVIDER_GOOGLE, Region } from "react-native-maps";
import * as Location from "expo-location";

const App: React.FC = () => {
  const [initialRegion, setInitialRegion] = useState<Region | undefined>(
    undefined
  );

  const checkLocationPermission = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      console.log("Location permission denied");
      return;
    }
  };

  useEffect(() => {
    const requestLocationPermission = async () => {
      try {
        await checkLocationPermission();

        const location = await Location.getCurrentPositionAsync({});
        const { latitude, longitude } = location.coords;

        setInitialRegion({
          latitude,
          longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
      } catch (error) {
        console.error("Error getting location:", error);
      }
    };

    requestLocationPermission();
  }, []);

  if (!initialRegion) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size={"large"} color={"hotpink"} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        style={StyleSheet.absoluteFillObject}
        provider={PROVIDER_GOOGLE}
        initialRegion={initialRegion}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
