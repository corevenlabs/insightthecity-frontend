import * as Location from "expo-location";

export const getLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
        return null;
    }
    let location = await Location.getCurrentPositionAsync({});
    return {
        lat: location.coords.latitude,
        lng: location.coords.longitude,
    };
};