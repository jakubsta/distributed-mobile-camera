import React, { Component } from 'react';
import {
  Text,
  View,
  Alert
} from 'react-native';

import Meteor, { createContainer } from 'react-native-meteor';
import MapView from 'react-native-maps';

class Challenges extends Component {

  constructor() {
    super();
  }

  render() {
    return (<View>
      {this.renderPoints()}
    </View>)
  }

  renderPoints() {
    return this.props.challenges.map((challenge) => (
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
}


export default createContainer((props) => {
  const handler = Meteor.subscribe('challenges');

  return {
    status: handler.ready(),
    challenges: Meteor.collection('challenges').find({location: {$exists: true}}),
    ...props
  }
}, Challenges)
