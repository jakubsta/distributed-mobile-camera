import React, { Component } from 'react';
import {
  Text,
  View,
  Alert
} from 'react-native';

import Meteor, { createContainer } from 'react-native-meteor';
import MapView from 'react-native-maps';
class Markers extends Component {

  leaveComponent;
  
  constructor() {
    super();
    this.leaveComponent = false;
  }

  render() {
    return null;
  }

  componentWillReceiveProps(nextProps) {

    if (this.leaveComponent) {
      return;
    }
    
    switch(nextProps.user.state) {
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
              }
            }
          ]
        );
        break;
      case 'subscribing':
        nextProps.navigator.push({name: 'stream-subscriber'});
        this.leaveComponent = true;
        break;
      case 'publishing':
        nextProps.navigator.push({name: 'stream-publisher'});
        this.leaveComponent = true;
        break;
    }
  }

}


export default createContainer((props) => {
  const handler = Meteor.subscribe('users');

  return {
    status: handler.ready(),
    users: Meteor.collection('users').find({location: {$exists: true}, _id: { $ne: Meteor.user()._id } }),
    user: Meteor.collection('users').findOne({_id: Meteor.user()._id}, {state:1, requestingUserId:1}),
    ...props
  }
}, Markers)
