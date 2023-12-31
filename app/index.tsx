import React, { useEffect, useRef, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  Keyboard,
} from "react-native";
import MapView, {
  Callout,
  LatLng,
  Marker,
  PROVIDER_GOOGLE,
  Region,
} from "react-native-maps";
import * as Location from "expo-location";
import { TextInput } from "react-native-gesture-handler";
import MapViewDirections from "react-native-maps-directions";

const initialRegion = {
  latitude: -37.32,
  longitude: -59.13,
  latitudeDelta: 0.7,
  longitudeDelta: 0.7,
};

const App: React.FC = () => {
  const [origin, setOrigin] = useState<LatLng>({
    latitude: -37.32,
    longitude: -59.13,
  });
  const [destination, setDestination] = useState<LatLng>({
    latitude: -37.22,
    longitude: -59.03,
  });
  const [region, setRegion] = useState<Region>(initialRegion);
  const [searchText, setSearchText] = useState<string>("");
  const [places, setPlaces] = useState<any[]>([]);
  const map = useRef<MapView | null>(null);

  const searchPlace = () => {
    if (!searchText.trim().length) return;
    setPlaces([]);

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
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      console.log("Location permission status:", status);

      if (status !== "granted") {
        console.log("Location permission denied");
        // Handle denial gracefully, e.g., show a message to the user
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error checking location permission:", error);
      // Handle the error, perhaps by returning false or rethrowing
      return false;
    }
  };

  const requestLocationPermission = async () => {
    try {
      const permissionGranted = await checkLocationPermission();

      if (!permissionGranted) {
        // Handle the case where permission is denied
        return;
      }

      const location = await Location.getCurrentPositionAsync();
      console.log("Location:", location);

      const { latitude, longitude } = location.coords;
      console.log("Latitude:", latitude, "Longitude:", longitude);

      setRegion({
        latitude,
        longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      });
    } catch (error) {
      console.error("Error getting location:", error);
      // Handle the error, perhaps by showing an error message to the user
    }
  };

  useEffect(() => {
    requestLocationPermission();
  }, []);

  // if (!initialRegion) {
  //   return (
  //     <View style={styles.container}>
  //       <ActivityIndicator size={"large"} color={"hotpink"} />
  //     </View>
  //   );
  // }

  return (
    <View style={styles.container}>
      <MapView
        style={StyleSheet.absoluteFillObject}
        // provider={PROVIDER_GOOGLE}
        // initialRegion={region} -> not necessary in this context
        region={region}
        showsCompass
        showsMyLocationButton
        //showsUserLocation -> IOS only
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
                >
                  <Callout>
                    <View style={styles.calloutContainer}>
                      <Text>{place.name}</Text>
                      <Text
                        style={
                          place.opening_hours?.open_now
                            ? styles.open
                            : styles.closed
                        }
                      >
                        {place.opening_hours?.open_now ? "Open" : "Closed"}
                      </Text>
                    </View>
                  </Callout>
                </Marker>
              );
            })
          : null}
        <Marker
          draggable
          title="origen"
          coordinate={origin}
          onDragEnd={direction => setOrigin(direction.nativeEvent.coordinate)}
        />
        <Marker
          draggable
          title="destino"
          coordinate={destination}
          onDragEnd={direction =>
            setDestination(direction.nativeEvent.coordinate)
          }
        />
        <MapViewDirections
          strokeColor="red"
          strokeWidth={5}
          origin={origin}
          destination={destination}
          apikey="AIzaSyDaXlAMBaEplUlHsEGtVMs1flnU2EyV8Ts"
        />
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
  calloutContainer: {
    flexWrap: "wrap",
    minHeight: 30,
    maxHeight: "auto",
    justifyContent: "center",
    alignItems: "center",
  },
  open: {
    color: "green",
  },
  closed: {
    color: "red",
  },
});

export default App;
