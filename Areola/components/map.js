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
    return (<View style={styles.container}>
      <MapView
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
      <View style={styles.container}>
        <Text style={{fontWeight: 'bold'}}>
          Welcome {this.props.user.username}
        </Text>
        <Button
          style={styles.button}
          textStyle={styles.buttonText}
          onPress={() => this.logout()}>
          Logout
        </Button>
        <Button
          style={styles.button}
          textStyle={styles.buttonText}
          onPress={() => this.props.navigator.push({name: 'rooms'})}>
          Chat rooms
        </Button>
        <Button
          style={styles.button}
          textStyle={styles.buttonText}
          onPress={() => this.props.navigator.push({name: 'stream-publisher'})}>
          Stream Publisher
        </Button>
        <Button
          style={styles.button}
          textStyle={styles.buttonText}
          onPress={() => this.props.navigator.push({name: 'stream-subscriber'})}>
          Stream Subscriber
        </Button>
        </View>
    </View>);
  }

  renderPoints() {
    return this.props.users.map((user) => (
      <MapView.Marker
        key={user._id}
        coordinate={{
            longitude: user.location.coords.longitude,
            latitude: user.location.coords.latitude}}

      >
        <MapView.Callout style={{width:100, height:50}}>
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
    users: Meteor.collection('users').find({location: {$exists: true}}),
    user: Meteor.user()
  }
}, Map)

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  map: {
    flex: 1
  },
  buttonContainer: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  button: {
    backgroundColor: 'transparent',
    borderWidth: 0,
  },
  buttonText: {
    backgroundColor: 'transparent',
    fontSize: 26,
    color: '#222222',
    fontWeight: 'bold',
    textShadowColor: '#4d4d4d',
    textShadowRadius: 2,
    textShadowOffset: {
      width: 2,
      height: 2
    },
    opacity: 0.8
  },
});
