import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  AsyncStorage
} from 'react-native';
import Meteor, { createContainer } from 'react-native-meteor';
import Button from 'apsl-react-native-button';
import Video from 'react-native-video';

class Home extends Component {
  constructor() {
    super();
  }

  render() {
    return (
      <View style={styles.container}>
        {this.backgroundVideo()}
        {this.userActions()}
      </View>);
  }

  logout() {
    Meteor.logout();
  }

  backgroundVideo() {
    return (!this.props.user) ?
    (<Video
      source={{uri: "backgroundMovie"}}
      style={styles.fullScreen}
      onLoad={() => { console.log('loaded!') }}
      onProgress={this.onProgress}
      onError={(err) => { console.log('error!', err) }}
      onEnd={() => { console.log('ended!') }}
      rate={1}
      volume={1}
      muted={true}
      resizeMode="cover"
      repeat={true}
    />) : null;
  }

  userActions() {
    if(!this.props.user) {
      return (
        <View>
          <Button
            style={styles.button}
            textStyle={styles.buttonText}
            onPress={() => this.props.navigator.push({name: 'login'})}>
            Login
          </Button>
          <Button
            style={styles.button}
            textStyle={styles.buttonText}
            onPress={() => this.props.navigator.push({name: 'signup'})}>
            Signup
          </Button>
          <Button
            style={styles.button}
            textStyle={styles.buttonText}
            onPress={() => this.props.navigator.push({name: 'stream-publisher'})}>
            Stream Publisher
          </Button>
          <Button
            style={styles.button}
            textStyle={styles.buttonText}
            onPress={() => this.props.navigator.push({name: 'stream-subscriber'})}>
            Stream Subscriber
          </Button>
          <Button
            style={styles.button}
            textStyle={styles.buttonText}
            onPress={() => this.props.navigator.push({name: 'map'})}>
            MAP
          </Button>
        </View>);
    }

    return (
      <View>
        <Text style={{fontWeight: 'bold'}}>
          Welcome {this.props.user.username}
        </Text>
        <Button
          style={styles.button}
          textStyle={styles.buttonText}
          onPress={() => this.logout()}>
          Logout
        </Button>
        <Button
          style={styles.button}
          textStyle={styles.buttonText}
          onPress={() => this.props.navigator.push({name: 'rooms'})}>
          Chat rooms
        </Button>
        <Button
          style={styles.button}
          textStyle={styles.buttonText}
          onPress={() => this.props.navigator.push({name: 'stream'})}>
          Stream
        </Button>
        <Button
          style={styles.button}
          textStyle={styles.buttonText}
          onPress={() => this.props.navigator.push({name: 'map'})}>
          MAP
        </Button>
      </View>);
  }
}

export default createContainer((props) => {
  return {
    user: Meteor.user(),
    ...props
  }
}, Home);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'stretch',
    justifyContent: 'center',
    backgroundColor: 'black'
  },
  fullScreen: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  },
  button: {
    borderWidth: 1,
    borderColor: '#2980b9',
    backgroundColor: '#3498db',
    height: 40,
    margin: 10,
    padding: 10
  },
  buttonText: {
    color: 'white'
  }
});
