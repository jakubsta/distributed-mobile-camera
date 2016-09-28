import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Alert,
  TouchableOpacity,
  Image,
  StatusBar,
  Platform
} from 'react-native';

import Meteor, { createContainer, Accounts } from 'react-native-meteor';
import MapView from 'react-native-maps';
import Button from 'apsl-react-native-button';
import Message from './message';

const PUBLISHING = 'green';
const FREE = 'blue';
const DEFAULT = 'red';

class Map extends Component {
  constructor() {
    super();
    this.watchID = null;
    this.state = {
      region: null
    };
  }

  componentWillReceiveProps(nextProps) {
    this.listenStartStreaming();
    this.listenStartRecieving();
  }

  componentDidMount() {
    this.listenStartStreaming();
    this.listenStartRecieving();
    this.updateUserLocation();
    Meteor.call('updateUserStatus', 'free'); //@TODO here we can handle user default status eg. hidden
  }

  updateUserLocation() {
    const updatePosition = (position) => {
      if (Meteor.user()) {
        return Meteor.call('updateLocation', position);
      }
    };
    const logError = (error) => console.log('ERROR!', error);

    navigator.geolocation.getCurrentPosition((location) => {
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
    Meteor.call('updateUserStatus', 'free'); //@TODO here we can handle user default status eg. hidden
  }

  componentDidUpdate(){
    this.listenStreamingRequests();
    this.listenStartStreaming();
    this.listenStartRecieving();
  }

  logout() {
    this.props.navigator.push({name: 'login'});
    Meteor.logout();
  }

  render() {
    if (Platform.OS === 'ios') {
      StatusBar.setBarStyle('default');
    }



    return !this.state.region && false ? (
      <Message message='Loading map...'/>) :
      (<View style={styles.container}>
        <MapView
          style={styles.map}
          showsUserLocation={true}
          onLongPress={this.openAddChallengeModal}
          initialRegion={this.state.region}>
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
    return this.props.users.map((user) => {
      let message = `Ask for sharing ${user.username}`;
      return (
        <MapView.Marker
          key={user._id}
          pinColor={this.getMarkerColor(user.state)}
          coordinate={{
            longitude: user.location.coords.longitude,
            latitude: user.location.coords.latitude}}
        >
          <MapView.Callout style={{width:200, height:60}} onPress={() => {this.askForStreaming(user)}}>
            <Button >{message}</Button>
          </MapView.Callout>
        </MapView.Marker>
      );
    });
  }

  getMarkerColor(state) {
    switch (state) {
      case 'publishing':
        return PUBLISHING;
      case 'free':
        return FREE;
      default:
        return DEFAULT;
    }
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

  askForStreaming(user) {
    Meteor.call('createRequest', user._id);
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
            //Meteor.call('addChallenge', {location: {coords: longPressedCoords}});
          }
        }
      ]
    );
    event.stopPropagation();
  }

  streamingRequest(request) {
    console.log(request);
    Meteor.call('removeRequest', request._id);

    Alert.alert(
      'Streaming request!',
      'Someone is asking you to share your camera!',
      [
        {
          text: 'Decline',
          onPress: () => {
            Meteor.call('updateUserStatus', 'free', request.publisher);
            Meteor.call('updateUserStatus', 'free', request.subscriber);
  }
        },
        {
          text: 'Share',
          onPress: () => {
            // Meteor.call('updateUserStatus', 'publishing', request.publisher);
            // Meteor.call('updateUserStatus', 'subscribing', request.subscriber);
            Meteor.call('createChannel', request.subscriber);
          }
        }
      ]
    );
  }

  listenStreamingRequests() {
    console.log('streamingRequest', this.props.streamingRequest);
    if (this.props.streamingRequest.length > 0) {
      this.streamingRequest(this.props.streamingRequest[0]);
    }
  }

  listenStartStreaming() {
    console.log('liveStreaming', this.props.liveStreaming);
    if (this.props.liveStreaming.length > 0) {
      this.startStreaming(this.props.liveStreaming[0]);
    }
  }

  startStreaming(channel) {
      this.props.navigator.replace({name: 'stream-publisher', passProps: {channel}});
  }

  startRecieving(channel) {
    this.props.navigator.replace({name: 'stream-subscriber', passProps: {channel}});
  }

  listenStartRecieving() {
    console.log('liveRecieving', this.props.liveRecieving);
    if (this.props.liveRecieving.length > 0) {
      this.startRecieving(this.props.liveRecieving[0]);
    }
  }
}

export default createContainer((props) => {
  Meteor.subscribe('users');
  Meteor.subscribe('challenges');
  Meteor.subscribe('channels');
  Meteor.subscribe('requests');

  const userId = Meteor.user() ? Meteor.user()._id : null;

  return {
    users: Meteor.collection('users').find({location: {$exists: true}, _id: {$ne: userId}}),
    user: Meteor.user(),
    challanges: Meteor.collection('challenges').find({location: {$exists: true}}),
    streamingRequest: Meteor.collection('requests').find({publisher: userId}).sort({creationDate: -1}),
    liveStreaming: Meteor.collection('channels').find({publisher: userId}).sort({creationDate: -1}),
    liveRecieving: Meteor.collection('channels').find({subscriber: userId}).sort({creationDate: -1}),
    ...props
  }
}, Map);

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
