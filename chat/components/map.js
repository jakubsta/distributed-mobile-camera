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
        onLongPress={this.openAddChallengeModal.bind(this)}>
        <MapView.Callout>
          <View>
            <Text>Add sharing request</Text>
            <Button
              style={styles.button}
              textStyle={styles.buttonText}>
              Request video
            </Button>
          </View>
        </MapView.Callout>
      </MapView.Marker>
    ))
  }

  onUserIconClick(user) {
    console.log("ping user: ", user);
  }

  openAddChallengeModal(event) {
    console.log("long press event: ", event);
  }
}

export default createContainer(() => {
  const handler = Meteor.subscribe('users');

  return {
    status: handler.ready(),
    users: []
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
