import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Alert,
  TouchableOpacity,
  Image,
  StatusBar
} from 'react-native';

import Markers from './markers';
import Meteor, { createContainer, Accounts } from 'react-native-meteor';
import MapView from 'react-native-maps';
import Button from 'apsl-react-native-button';
import Message from './message';

export default class Map extends Component {
  constructor(props) {
    super(props);
    this.watchID = null;
    this.state = {
      region: null
    };
  }

  componentDidMount() {
    this.updateUserLocation();
  }

  updateUserLocation() {
    const updatePosition = (position) => {
      if (Meteor.user()) {
        return Meteor.call('updateLocation', position);
      }
    };
    const logError = (error) => console.log('ERROR!', error);

    navigator.geolocation.getCurrentPosition((location) => {
        console.log('MAP current user position', location, 'USER', this.props.user);
        updatePosition(location);
        this.setState({
          region: {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: 0.2000,
            longitudeDelta: 0.0821
          }
        });
      },
      logError,
      {enableHighAccuracy: true, timeout: 20000, maximumAge: 1000, distanceFilter: 20});

    this.watchID = navigator.geolocation.watchPosition(
      updatePosition,
      logError,
      {enableHighAccuracy: false, timeout: 20000, maximumAge: 1000, distanceFilter: 20}
    );
  }

  componentWillUnmount() {
    navigator.geolocation.clearWatch(this.watchID);
  }

  logout() {
    this.props.navigator.push({name: 'login'});
    Meteor.logout();
  }

  render() {
    StatusBar.setBarStyle('default');
    return !this.state.region ? (
      <Message message='Loading map...'/>) :
      (<View style={styles.container}>
        <MapView
          style={styles.map}
          showsUserLocation={true}
          onLongPress={this.openAddChallengeModal}
          initialRegion={this.state.region}>
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
          <TouchableOpacity onPress={() => this.props.navigator.push({name: 'stream-publisher'})}
                            style={styles.publish}>
            <Image
              style={styles.button}
              source={require('../assets/publish.png')}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => this.props.navigator.push({name: 'stream-subscriber'})}
                            style={styles.subscribe}>
            <Image
              style={styles.button}
              source={require('../assets/subscribe.png')}
            />
          </TouchableOpacity>
        </View>
      </View>);
  }

  renderMarkers() {
    return this.props.users.map((user) => (
      <MapView.Marker
        key={user._id}
        pinColor={user.state === 'publishing' ? 'green' : 'red'}
        coordinate={{
            longitude: user.location.coords.longitude,
            latitude: user.location.coords.latitude}}
      >
        <MapView.Callout style={{width:200, height:60}} onPress={this.onUserIconClick(user)}>
          <Button onPress={this.onUserIconClick(user)}>
            Ask for sharing
          </Button>
        </MapView.Callout>
      </MapView.Marker>));
  }

  renderChallenges() {
    return this.props.challanges.map((challenge) => (
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
          onPress: () => {
          }
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

export default createContainer((props) => {
  Meteor.subscribe('users');
  Meteor.subscribe('challenges');

  return {
    users: Meteor.collection('users').find({location: {$exists: true}, _id: { $ne: Meteor.user() ? Meteor.user()._id : null } }),
    user: Meteor.user(),
    challanges: Meteor.collection('challenges').find({location: {$exists: true}}),
    ...props
  }
}, Map)

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
