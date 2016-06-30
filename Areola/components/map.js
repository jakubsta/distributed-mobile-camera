import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Alert,
  TouchableOpacity,
  Image
} from 'react-native';

import Markers from './markers';
import Meteor from 'react-native-meteor';
import MapView from 'react-native-maps';
import Button from 'apsl-react-native-button';

export default class Map extends Component {

  constructor() {
    super();
    Meteor.subscribe('users');
    Meteor.subscribe('challenges');
  }

  logout() {
    Meteor.logout();
  }

  render() {
    return (<View style={styles.container}>
      <MapView
        style={styles.map}
        showsUserLocation={true}
        onLongPress={this.openAddChallengeModal}
        initialRegion={{
          latitude: 51.1079,
          longitude: 17.0385,
          latitudeDelta: 0.2000,
          longitudeDelta: 0.0821
      }}>
      <Markers navigator={this.props.navigator}></Markers>
      {this.renderMarkers()}
      {this.renderChallenges()}
      </MapView>
      <View style={styles.buttonsContainer}>
        <TouchableOpacity onPress={() => this.logout()} style={styles.logout}>
          <Image
            style={styles.button}
            source={require('../assets/logout.png')}
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => this.props.navigator.push({name: 'stream-publisher'})} style={styles.publish}>
          <Image
            style={styles.button}
            source={require('../assets/publish.png')}
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => this.props.navigator.push({name: 'stream-subscriber'})} style={styles.subscribe}>
          <Image
            style={styles.button}
            source={require('../assets/subscribe.png')}
          />
        </TouchableOpacity>
      </View>
    </View>);
  }

  renderMarkers() {
    return Meteor.collection('users').find({location: {$exists: true}, _id: { $ne: Meteor.user()._id } }).map((user) => (
      <MapView.Marker
        key={user._id}
        pinColor={user.state === 'publishing' ? 'green' : 'red'}
        coordinate={{
            longitude: user.location.coords.longitude,
            latitude: user.location.coords.latitude}}
      >
        <MapView.Callout style={{width:200, height:60}} onPress={this.onUserIconClick(user)} >
          <Button onPress={this.onUserIconClick(user)}>
            Ask for sharing
          </Button>
        </MapView.Callout>
      </MapView.Marker>));
  }
  
  renderChallenges() {
    return Meteor.collection('challenges').find({location: {$exists: true}}).map((challenge) => (
      <MapView.Marker
        key={challenge._id}
        pinColor='yellow'
        coordinate={{
            longitude: challenge.location.coords.longitude,
            latitude: challenge.location.coords.latitude}}
      >
        <MapView.Callout style={{width:200, height:60}}>
          <View>
            <Text>Share from here to earn challenge coins.</Text>
          </View>
        </MapView.Callout>
      </MapView.Marker>
    ))
  }

  onUserIconClick(user) {
    return () => {
      Meteor.call('setUserAsRequested', user._id);
    }
  }

  openAddChallengeModal(event) {
      const longPressedCoords = event.nativeEvent.coordinate;
      Alert.alert(
        'Create new challenge!',
        'Add some coins to earn for your challenge',
        [
          {
            text: 'Decline',
            onPress: () => {}
          },
          {
            text: 'Create',
            onPress: () => {
              Meteor.call('addChallenge', {location: {coords: longPressedCoords}});
            }
          }
        ]
      );
      event.stopPropagation();

  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  map: {
    flex: 1
  },
  buttonsContainer: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: 'transparent'
  },
  logout: {
    position: 'absolute',
    right: 45,
    top: 20
  },
  subscribe: {
    position: 'absolute',
    right: 100,
    top: 20
  },
  publish: {
    position: 'absolute',
    right: 150,
    top: 20
  },
  button: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    width: 35,
    height: 35
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
  }
});
