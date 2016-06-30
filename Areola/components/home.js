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

  componentDidUpdate() {
    if (this.props.user) {
      this.props.navigator.replace({name: 'map'});
    }
  }

  render() {
    return (
      <View style={styles.container}>
        {this.backgroundVideo()}
        {this.userActions()}
      </View>);
  }

  backgroundVideo() {
    return (!this.props.user) ?
      (<Video
        source={{uri: "background"}}
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
    if (!this.props.user) {
      return (
        <View style={styles.containerUnauthorized}>
          <Button
            style={styles.authorize}
            textStyle={styles.authorizeText}
            onPress={() => this.props.navigator.push({name: 'login'})}>
            Login
          </Button>
          <Text style={[styles.authorizeText, {fontSize: 17, padding: 5}]}> or </Text>
          <Button
            style={styles.authorize}
            textStyle={styles.authorizeText}
            onPress={() => this.props.navigator.push({name: 'signup'})}>
            Signup
          </Button>
        </View>);
    }

    return null;

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
    backgroundColor: 'white'
  },
  fullScreen: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  },
  containerUnauthorized: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'stretch',
    justifyContent: 'center',
    marginTop: 100,
  },
  button: {
    borderWidth: 1,
    borderColor: '#2980b9',
    backgroundColor: '#3498db',
    height: 40,
    margin: 10,
    padding: 10
  },
  authorize: {
    backgroundColor: 'transparent',
    borderWidth: 0,
  },
  authorizeText: {
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
  },
  buttonText: {
    color: 'white'
  }
});
