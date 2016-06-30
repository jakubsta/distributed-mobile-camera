import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image
} from 'react-native';

import Meteor, { createContainer } from 'react-native-meteor';
import MapView from 'react-native-maps';
import Button from 'apsl-react-native-button';

class Map extends Component {

  constructor() {
    super();
  }

  logout() {
    Meteor.logout();
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
      <View style={styles.buttonsContainer}>
        <TouchableOpacity onPress={() => this.logout()}>
          <Image
            style={[styles.button, styles.logout]}
            source={require('../assets/logout.png')}
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => this.props.navigator.push({name: 'stream-publisher'})}>
          <Image
            style={[styles.button, styles.publish]}
            source={require('../assets/publish.png')}
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => this.props.navigator.push({name: 'stream-subscriber'})}>
          <Image
            style={[styles.button, styles.subscribe]}
            source={require('../assets/subscribe.png')}
          />
        </TouchableOpacity>
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
    users: Meteor.collection('users').find({location: {$exists: true}})
  }
}, Map)

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  buttonsContainer: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: 'transparent',
  },
  logout: {
    position: 'absolute',
    width: 40,
    height: 40,
    right: 10,
    top: 10
  },
  subscribe: {
    position: 'absolute',
    width: 40,
    height: 40,
    right: 70,
    top: 10
  },
  publish: {
    position: 'absolute',
    width: 40,
    height: 40,
    right: 130,
    top: 10
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
