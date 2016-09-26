import React, { Component } from 'react';
import {
  Text,
  View,
  Navigator,
  StatusBar
} from 'react-native';
import Meteor, { createContainer } from 'react-native-meteor';
import Message from './message';

import './connect';
import Login from './login';
import Signup from './signup';
import Home from './home';
import Rooms from './rooms';
import Posts from './posts';
import StreamPublisher from './stream-publisher';
import StreamSubscriber from './stream-subscriber'
import Map from './map';
import Background from './background';
import Logo from './logo';

class Chat extends Component {

  constructor(props){
    super(props);
  }

  render() {
    StatusBar.setBarStyle('light-content');

    if (!this.props.connected) {
      return this.showStatusMessage('Connecting to the server...');
    }

    if (!this.props.user && this.props.loggingIn) {
      return this.showStatusMessage('Logging in user...');
    }

    return (
      <Navigator
        style={{ flex:1 }}
        initialRoute={{name: this.props.user ? 'map' : 'login'}}
        configureScene={this.configureScene}
        renderScene={this.renderScene}
      />
    );
  }

  showStatusMessage(message) {
    return (
      <Message message={message}/>
    );
  }

  renderScene(route, navigator) {
    switch (route.name) {
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
    console.log(route, routeStack);
    return Navigator.SceneConfigs.PushFromRight
  }
}

export default createContainer(() => {
  return {
    connected: Meteor.status().connected,
    user: Meteor.user(),
    loggingIn: Meteor.loggingIn()
  };
}, Chat);
