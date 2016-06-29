import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native';

import MapView from 'react-native-maps';

export default class Map extends Component {

  fakeMarkers = [{
    coordinates: {
      latitude: 37.78825,
      longitude: -122.4324
    },
    title: 'title 1',
    description: 'description 1'
  }];

  constructor() {
    super();
  }

  render() {
    return (<View style={styles.container}><MapView
      style={styles.map}
      initialRegion={{
        latitude: 37.78825,
        longitude: -122.4324,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421
              }}>
      {this.fakeMarkers.map(marker => (
        <MapView.Marker
          coordinate={marker.coordinates}
          title={marker.title}
          description={marker.description}
        />
      ))}
    </MapView>
    </View>);
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  map: {
    flex: 1
  }
});
