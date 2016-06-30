import React, { Component } from 'react';
import {
  Text,
  View
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

  onUserIconClick(user) {
    Meteor.call('updateUserStatus', 'requested', () => {
      console.log("from asking callback");
    })
  }


}

export default createContainer(() => {
  const handler = Meteor.subscribe('users');

  return {
    status: handler.ready(),
    users: Meteor.collection('users').find({location: {$exists: true}})
  }
}, Markers)
