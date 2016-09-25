import React, { Component } from 'react';
import { StyleSheet } from 'react-native';
import Video from 'react-native-video';

export default class Background extends Component {

  render() {
    return (<Video
      source={{uri: "background"}}
      style={styles.fullScreen}
      rate={1}
      volume={1}
      muted={true}
      resizeMode="cover"
      repeat={true}
    />);
  }
}

const styles = StyleSheet.create({
  fullScreen: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  },
});