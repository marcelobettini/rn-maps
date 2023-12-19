import React, { useRef, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  Keyboard,
} from "react-native";
import MapView, {
  LatLng,
  Marker,
  PROVIDER_GOOGLE,
  Region,
} from "react-native-maps";
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
  const [places, setPlaces] = useState<any[]>([]);
  const map = useRef<MapView | null>(null);

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
          const coords: LatLng[] = [];
          for (const place of places.results) {
            coords.push({
              latitude: place.geometry.location.lat,
              longitude: place.geometry.location.lng,
            });
            console.log(places.results[0]);
          }
          setPlaces(places.results);
          //ajustaremos el zoom del mapa para que revele todos los lugares encontrados
          if (coords.length) {
            map.current?.fitToCoordinates(coords, {
              edgePadding: {
                top: 50,
                right: 50,
                bottom: 50,
                left: 50,
              },
              animated: true,
            });
            Keyboard.dismiss();
          }
        }
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
        showsMyLocationButton={true}
        // showsUserLocation
        // onRegionChange={data => {}}
        onRegionChangeComplete={r => setRegion(r)}
        ref={map} //to later zoom the map according to places found
      >
        {places.length
          ? places.map((place, idx) => {
              const coord: LatLng = {
                latitude: place.geometry.location.lat,
                longitude: place.geometry.location.lng,
              };
              return (
                <Marker
                  key={`coord-marker-${idx}`}
                  coordinate={coord}
                  title={place.name}
                  description={place.formatted_address}
                />
              );
            })
          : null}
      </MapView>
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
          <Text style={styles.btnText}>GO</Text>
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
    width: 260,
    top: 10,
    alignSelf: "center",
    alignItems: "center",
    left: "50%", // Center horizontally
    marginLeft: -130, // Adjust based on the half of your container width
    backgroundColor: "rgba(255, 105, 180, 0.581)",
    paddingVertical: 10,
    borderRadius: 10,
  },
  searchInput: {
    color: "black",
    backgroundColor: "white",
    width: "90%",
    borderRadius: 10,
    height: 35,
    paddingHorizontal: 5,
  },
  btnSearch: {
    marginTop: 10,
    justifyContent: "center",
    alignItems: "center",
    width: 100,
    backgroundColor: "white",
    borderRadius: 10,
    height: 35,
  },
  btnText: {
    fontSize: 20,
    fontWeight: "800",
  },
});

export default App;
