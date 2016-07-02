import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Navigator
} from 'react-native';
import Meteor, { createContainer } from 'react-native-meteor';

import './connect';
import Login from './login';
import Signup from './signup';
import Home from './home';
import Rooms from './rooms';
import Posts from './posts';
import StreamPublisher from './stream-publisher';
import StreamSubscriber from './stream-subscriber'
import Map from './map';

class Chat extends Component {
  componentDidMount() {
   const updatePosition = (position) => Meteor.call('updateLocation', position);
   const logError = (error) => console.log('ERROR!', error);

    navigator.geolocation.getCurrentPosition(
      updatePosition,
      logError,
      {enableHighAccuracy: false, timeout: 200, maximumAge: 1000}
    );

    navigator.geolocation.watchPosition(
      updatePosition,
      logError,
      {enableHighAccuracy: false, timeout: 200, maximumAge: 1000, distanceFilter: 10}
    );
  }

  render() {
    if(!this.props.connected) {
      return (<Text>Connecting to the server</Text>);
    }

    return (
      <Navigator
        initialRoute={{name: 'home'}}
        configureScene={this.configureScene}
        renderScene={this.renderScene}/>
    );
  }

  renderScene(route, navigator) {
    switch(route.name) {
      case 'home':
        return <Home navigator={navigator} {...route.passProps}/>;
      case 'login':
        return <Login navigator={navigator} {...route.passProps}/>;
      case 'signup':
        return <Signup navigator={navigator} {...route.passProps}/>;
      case 'rooms':
        return <Rooms navigator={navigator}/>;
      case 'posts':
        return <Posts {...route.passProps}/>;
      case 'stream-publisher':
        return <StreamPublisher navigator={navigator} {...route.passProps}/>;
      case 'stream-subscriber':
        return <StreamSubscriber navigator={navigator} {...route.passProps}/>;
      case 'map':
        return <Map navigator={navigator} {...route.passProps} />;
    }
  }

  configureScene(route, routeStack) {
     return Navigator.SceneConfigs.PushFromRight
  }
}

export default createContainer(() => {
  return {
    connected: Meteor.status().connected
  };
}, Chat);

const styles = StyleSheet.create({
});
