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
  constructor() {
    super();
  }

  render() {
    return (<MapView
      style={{flex:1}}
      initialRegion={{
        latitude: 37.78825,
        longitude: -122.4324,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421
      }}
    />);
  }
}

const styles = StyleSheet.create({
});
