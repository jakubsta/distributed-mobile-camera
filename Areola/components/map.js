import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Alert,
  TouchableOpacity,
  Image,
  PushNotificationIOS
} from 'react-native';

import Markers from './markers';
import Meteor, {createContainer} from 'react-native-meteor';
import MapView from 'react-native-maps';
import Button from 'apsl-react-native-button';
import PushNotification from 'react-native-push-notification';

PushNotification.configure({

    // (optional) Called when Token is generated (iOS and Android)
    onRegister: function(token) {
        console.log( 'TOKEN:', token );
    },

    // (required) Called when a remote or local notification is opened or received
    onNotification: function(notification) {
			console.log( 'NOTIFICATION:', notification );
			// PushNotification.localNotificationSchedule({
			// 		message: "My Notification Message", // (required)
			// 		date: new Date(Date.now() + (60 * 1000)).toISOString() // in 60 secs
			// });
    },
});

export default class Map extends Component {

  constructor() {
    super();
    // setInterval(()=> {
			// PushNotification.localNotification({message: 'Test'});
			PushNotification.localNotificationSchedule({
					message: "My Notification Message", // (required)
					date: new Date(Date.now() + (60 * 1000)).toISOString() // in 60 secs
			});
    // }, 5000);
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
      <Markers></Markers>
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

  componentWillReceiveProps(nextProps) {
    console.log("next Props", nextProps);
    if (nextProps.user.state === 'requested') {
      Alert.alert(
        'Streaming request!',
        'Someone is asking you to share your camera!',
        [
          {text: 'Decline', onPress: () => Meteor.call('updateUserStatus', 'free') },
          {text: 'Share', onPress: () => {
            Meteor.call('updateUserStatus', 'publishing');
            this.props.navigator.push({name: 'stream-publisher'});

          }}
        ]
      )
    }
  }

  openAddChallengeModal(event) {
    console.log("long press coordinates", event.nativeEvent.coordinate);
    event.stopPropagation();
  }
}

export default createContainer(() => {
  const handler = Meteor.subscribe('users');

  return {
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
