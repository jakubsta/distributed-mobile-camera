import React, { Component } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import Logo from './logo';
import Background from './background';

export default class Message extends Component {

  render() {
    return (
      <View style={styles.container}>
        <Background/>
        <Logo/>
        <View style={styles.message}>
          <Text style={styles.messageText}>{this.props.message}</Text>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'stretch',
    justifyContent: 'center',
    backgroundColor: 'black'
  },
  message: {
    backgroundColor: 'transparent',
    padding: 15
  },
  messageText: {
    color: 'white',
    fontSize: 14,
    textAlign: 'center',
    fontWeight: 'bold',
    textShadowColor: '#4d4d4d',
    textShadowRadius: 2,
    textShadowOffset: {
      width: 2,
      height: 2
    },
  }
});