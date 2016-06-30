import React, { Component } from 'react';
import {
  Text,
  View,
  Alert
} from 'react-native';

import Meteor, { createContainer } from 'react-native-meteor';
import MapView from 'react-native-maps';

class Markers extends Component {

  constructor() {
    super();
  }

  render() {
    return (<View>
      {this.renderPoints()}
    </View>)
  }

  renderPoints() {
    return this.props.users.map((user) => (
      <MapView.Marker
        key={user._id}
        pinColor={user.state === 'streaming' ? 'green' : 'red'}
        coordinate={{
            longitude: user.location.coords.longitude,
            latitude: user.location.coords.latitude}}
      >
        <MapView.Callout style={{width:200, height:60}} onPress={this.onUserIconClick(user)}>
          <View>
            <Text>Press tooltip to ask for sharing</Text>
          </View>
        </MapView.Callout>
      </MapView.Marker>
    ))
  }

  componentWillReceiveProps(nextProps) {
    console.log("next Props", nextProps);

    switch(nextProps.user.state){
      case 'requested':
        Alert.alert(
          'Streaming request!',
          'Someone is asking you to share your camera!',
          [
            {
              text: 'Decline',
              onPress: () => {
                Meteor.call('updateUserStatus', 'free');
                Meteor.call('updateUserStatus', 'free', nextProps.user.requestingUserId);
              }
            },
            {
              text: 'Share',
              onPress: () => {
                Meteor.call('updateUserStatus', 'publishing');
                Meteor.call('updateUserStatus', 'subscribing', nextProps.user.requestingUserId);
                this.props.navigator.push({name: 'stream-publisher'});
              }
            }
          ]
        );
        break;
      case 'requesting':
      //kreciolek
    }
  }

  onUserIconClick(user) {
    Meteor.call('updateUserStatus', 'requesting');
    Meteor.call('setUserAsRequested', user);
  }

}


export default createContainer(() => {
  const handler = Meteor.subscribe('users');

  return {
    status: handler.ready(),
    users: Meteor.collection('users').find({location: {$exists: true}}),
    user: Meteor.user()
  }
}, Markers)
