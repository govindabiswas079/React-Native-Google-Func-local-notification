import { View, Pressable, Text, StatusBar, StyleSheet, Dimensions } from 'react-native'
import React, { Fragment, useRef, useEffect, useState } from 'react'
import moment from 'moment'
import MapView, { Polyline, Circle, PROVIDER_GOOGLE } from 'react-native-maps'
import { DRIVING } from './DRIVING';
import { WALKING, coordinates } from './WALKING';
import { accelerometer } from "react-native-sensors";

const screen = Dimensions.get('window');
export const App = () => {
  const MapRef = useRef();
  const [values, setValues] = useState([])
  const [selectedRoute, setSelectedRoute] = useState(0);

  const decode = (point) => {
    let points = [];
    for (let step of point) {
      let encoded = step?.polyline?.points;
      let index = 0, len = encoded?.length;
      let lat = 0, lng = 0;
      while (index < len) {
        let b, shift = 0, result = 0;
        do {
          b = encoded.charAt(index++).charCodeAt(0) - 63;
          result |= (b & 0x1f) << shift;
          shift += 5;
        } while (b >= 0x20);

        let dlat = ((result & 1) != 0 ? ~(result >> 1) : (result >> 1));
        lat += dlat;
        shift = 0;
        result = 0;
        do {
          b = encoded.charAt(index++).charCodeAt(0) - 63;
          result |= (b & 0x1f) << shift;
          shift += 5;
        } while (b >= 0x20);
        let dlng = ((result & 1) != 0 ? ~(result >> 1) : (result >> 1));
        lng += dlng;

        points.push({ latitude: (lat / 1E5), longitude: (lng / 1E5) });
      }
    }
    return points;
  }

  const precision = 'high';
  const getDecode = () => {
    if (WALKING?.routes?.length) {

      const route = WALKING?.routes;

      return Promise.resolve(
        route?.map((value, index) => ({
          // distance: value?.legs.reduce((carry, curr) => {
          //   return Math.round(carry + curr?.distance?.value);
          // }, 0) / 1000,
          // duration: value?.legs.reduce((carry, curr) => {
          //   return carry + (curr?.duration_in_traffic ? curr?.duration_in_traffic?.value : curr?.duration?.value);
          // }, 0) / 60,
          distance: value?.legs?.map((value) => { return value?.distance?.text })[0],
          duration: value?.legs?.map((value) => { return value?.duration?.text })[0],
          start_address: value?.legs?.map((value) => { return value?.start_address })[0],
          end_address: value?.legs?.map((value) => { return value?.end_address })[0],
          start_location: value?.legs?.map((value) => { return value?.start_location })[0],
          end_location: value?.legs?.map((value) => { return value?.end_location })[0],
          coordinates: (
            (precision === 'low') ?
              decode([{ polyline: value?.overview_polyline }]) :
              value?.legs?.reduce((carry, curr) => {
                return [...carry, ...decode(curr?.steps),]
              }, [])
          ),
          fare: value?.fare,
          waypointOrder: value?.waypoint_order,
          legs: value?.legs,
          summary: value?.summary
        }))
      )
    } else {
      return Promise.reject();
    }
  }

  useEffect(() => {
    getDecode()
      .then((response) => {
        setValues(response)
      })
      .catch((error) => {
        console.log(error)
      })
  }, []);

  const onZoomInPress = () => {
    MapRef?.current?.getCamera().then((cam) => {
      if (Platform.OS === 'android') {
        cam.zoom += 1;
      } else {
        cam.altitude /= 2;
      }
      MapRef?.current?.animateCamera(cam);
    });
  };

  const onZoomOutPress = () => {
    MapRef?.current?.getCamera().then((cam) => {
      if (Platform.OS === 'android') {
        cam.zoom -= 1;
      } else {
        cam.altitude *= 2;
      }
      MapRef?.current?.animateCamera(cam);
    });
  };

  var t = new Date(1690182000000)
  var formatted = moment('2023-07-25T12:30:00.999999999Z');

  const exactDate = '07/24/2023 12:30:00';
  const exactDateTimestamp = new Date(exactDate).getTime();

  // console.log('exactDateTimestamp', t); // 1663574293000

  // console.log('formatted', t)


  const str = new Date().toLocaleString('en-US', { timeZone: 'Asia/Calcutta' });
  // console.log('str', str);

  // accelerometer.subscribe(({ x, y, z, timestamp }) =>
  //   console.log({ x, y, z, timestamp })
  // );

  return (
    <Fragment>
      <StatusBar barStyle={'dark-content'} backgroundColor={'transparent'} translucent={true} animated={true} />
      {/* <View style={{
        flex: 1,
        backgroundColor: "#FFFFFF"
      }}>
        <MapView
          mapType='standard'
          initialRegion={{
            latitude: 17.4026936,
            longitude: 78.3799043,
            latitudeDelta: 0.0922,
            longitudeDelta: screen.width / screen.height,
          }}
          annotations={20}
          ref={MapRef}
          provider={PROVIDER_GOOGLE}
          style={{
            ...StyleSheet.absoluteFillObject,
          }}
          loadingEnabled={true}
          minZoomLevel={1}
          maxZoomLevel={50}
          zoom={5}
        >

          {!values?.length ? null :
            values?.map((value, index) => (
              <Polyline
                key={index}
                strokeColor={index === selectedRoute ? 'blue' : 'gray'}
                zIndex={index === selectedRoute ? 999 : 0}
                geodesic={false}
                fillColor={'red'}
                lineDashPhase={1}
                lineDashPattern={[100, 100, 100, 100, 100, 100, 100, 100, 100, 100,]}
                // lineDashPattern={''}
                lineCap={'round'} // round // square
                tappable={true}
                strokeWidth={6}
                onPress={() => { setSelectedRoute(index) }}
                coordinates={value?.coordinates?.map((value, index) => ({ ...value }))}
              />
            ))
          }

        </MapView>
        <View style={{ position: 'absolute', right: 10, bottom: 10 }}>
          <Pressable onPress={() => { onZoomInPress() }} style={{ width: 30, height: 30, borderRadius: 5, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center', marginTop: 5 }}>
            <Text style={{ fontWeight: '700', fontSize: 25, color: '#000000' }}>+</Text>
          </Pressable>
          <Pressable onPress={() => { onZoomOutPress() }} style={{ width: 30, height: 30, borderRadius: 5, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center', marginTop: 5 }}>
            <Text style={{ fontWeight: '700', fontSize: 25, color: '#000000' }}>-</Text>
          </Pressable>
        </View>
      </View> */}
    </Fragment>
  )
}

