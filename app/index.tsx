import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import MapView, { PROVIDER_GOOGLE, Region } from "react-native-maps";
import * as Location from "expo-location";
import { TextInput } from "react-native-gesture-handler";

const initialRegion = {
  latitude: -37.32,
  longitude: -59.13,
  latitudeDelta: 0.1,
  longitudeDelta: 0.1,
};
const App: React.FC = () => {
  const [region, setRegion] = useState<Region>(initialRegion);
  const [searchText, setSearchText] = useState<string>("");

  const searchPlace = () => {
    if (!searchText.trim().length) return;
    console.log("starting func");
    console.log(searchText);
    const googleApisUrl =
      "https://maps.googleapis.com/maps/api/place/textsearch/json";
    const input = searchText.trim();
    const location = `${(region.latitude, region.longitude)}&radius=2500`; //meters
    const url = `${googleApisUrl}?query=${input}&${location}&key=AIzaSyDaXlAMBaEplUlHsEGtVMs1flnU2EyV8Ts`; //api key
    console.log(url);
    fetch(url)
      .then(res => res.json())
      .then(places => {
        if (places && places.results) {
          for (const place of places.results) {
            console.log(place.geometry.location.lat);
            console.log(place.geometry.location.lng);
          }
        } else console.log("Nothing here");
      })
      .catch(err => console.error(err));
  };
  const checkLocationPermission = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    console.log(status);
    if (status !== "granted") {
      console.log("Location permission denied");
      return;
    }
  };

  // const requestLocationPermission = async () => {
  //   try {
  //     console.log("await checkLocationPermission();");
  //     await checkLocationPermission();
  //     console.log("await Location.getCurrentPositionAsync({})");
  //     const location = await Location.getCurrentPositionAsync({});
  //     console.log("Ready");
  //     const { latitude, longitude } = location.coords;
  //     console.log(latitude, longitude);

  //     setRegion({
  //       latitude,
  //       longitude,
  //       latitudeDelta: 0.05,
  //       longitudeDelta: 0.05,
  //     });
  //   } catch (error) {
  //     console.error("Error getting location:", error);
  //   }
  // };

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
        initialRegion={region}
        region={region}
        showsCompass
        showsUserLocation
        showsMyLocationButton
        // onRegionChange={data => {}}
        onRegionChangeComplete={r => setRegion(r)}
      />
      <View style={styles.coordsContainer}>
        <Text>Lat: {region?.latitude.toFixed(2)}</Text>
        <Text>Lon: {region?.longitude.toFixed(2)}</Text>
      </View>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="search for a place..."
          onChangeText={setSearchText}
          autoCapitalize="characters"
        />
        <TouchableOpacity style={styles.btnSearch} onPress={searchPlace}>
          <Text>GO</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  coordsContainer: {
    alignItems: "center",
    width: 150,
    position: "absolute",
    bottom: 10,
    left: "50%", // Center horizontally
    marginLeft: -75, // Adjust based on the half of your container width
    backgroundColor: "rgba(255, 105, 180, 0.581)",
    padding: 10,
    borderRadius: 10,
  },
  searchContainer: {
    position: "absolute",
    width: "60%",
  },
  searchInput: {
    color: "black",
    backgroundColor: "white",
  },
  btnSearch: {
    width: 50,
    backgroundColor: "hotpink",
  },
});

export default App;
