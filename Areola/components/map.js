import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View
} from 'react-native';

import Meteor, { createContainer } from 'react-native-meteor';
import MapView from 'react-native-maps';
import Button from 'apsl-react-native-button';

class Map extends Component {

  constructor() {
    super();
  }

  render() {
    return (<View style={styles.container}><MapView
      style={styles.map}
      showsUserLocation={true}
      onLongPress={this.openAddChallengeModal.bind(this)}
      initialRegion={{
        latitude: 51.1079,
        longitude: 17.0385,
        latitudeDelta: 0.2000,
        longitudeDelta: 0.0821
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

      >
        <MapView.Callout tooltip={true}>
          <View>
            <Text>Add sharing request</Text>
          </View>
        </MapView.Callout>
      </MapView.Marker>
    ))
  }

  onMarkerPress(evt) {
    console.log("on marker press", evt);
  }

  onUserIconClick(user) {
    console.log("ping user: ", user);
  }

  openAddChallengeModal(event) {
    console.log("long press coordinates", event.nativeEvent.coordinate);
    event.stopPropagation();
  }
}

export default createContainer(() => {
  const handler = Meteor.subscribe('users');

  return {
    status: handler.ready(),
    users: Meteor.collection('users').find({location: {$exists: true}})
  }
}, Map)

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  map: {
    flex: 1
  },
  button: {
    borderWidth: 1,
    borderColor: '#2980b9',
    backgroundColor: '#3498db',
    height: 40,
    margin: 10,
    padding: 10
  },
  buttonText: {
    color: 'white'
  }
});
