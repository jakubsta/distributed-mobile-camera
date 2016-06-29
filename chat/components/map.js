import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native';

import Meteor, { createContainer } from 'react-native-meteor';
import MapView from 'react-native-maps';

class Map extends Component {
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
      {this.renderPoints()}
    </MapView>
    </View>);
  }

  renderPoints() {
    return this.props.users.map((user) => (
      <MapView.Marker
        coordinate={{
            longitude: user.location.coords.longitude,
            latitude: user.location.coords.latitude}}
        title={user.name}
        description="my description"
      />
    ))
  }
}

export default createContainer(() => {
  const handler = Meteor.subscribe('users');

  return {
    status: handler.ready(),
    users: Meteor.collection('users').find({})
  }
}, Map)

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  map: {
    flex: 1
  }
});
