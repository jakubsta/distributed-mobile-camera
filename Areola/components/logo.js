import React, { Component } from 'react';
import { StyleSheet, View, Text } from 'react-native';

export default class Logo extends Component {

  render() {
    return (
      <View style={styles.title}>
        <Text style={styles.titleText}>Areola</Text>
        <Text style={styles.descriptionText}>Stream Your Dreams</Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  title: {
    backgroundColor: 'transparent',
    height: 60,
    margin: 10,
    borderWidth: 0,
  },
  titleText: {
    textAlign: 'center',
    marginTop: 10,
    backgroundColor: 'transparent',
    fontSize: 34,
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
  descriptionText: {
    textAlign: 'center',
    backgroundColor: 'transparent',
    fontSize: 12,
    color: '#222222',
    fontWeight: 'bold',
    textShadowColor: '#4d4d4d',
    textShadowRadius: 2,
    textShadowOffset: {
      width: 2,
      height: 2
    },
    opacity: 0.8
  }
});