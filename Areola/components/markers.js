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


}

export default createContainer(() => {
  const handler = Meteor.subscribe('users');

  return {
    status: handler.ready(),
    users: Meteor.collection('users').find({location: {$exists: true}})
  }
}, Markers)
