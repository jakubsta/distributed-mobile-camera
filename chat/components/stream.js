import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput
} from 'react-native';
import Meteor, { Accounts } from 'react-native-meteor';
import Button from 'apsl-react-native-button';
import ReactTimeout from 'react-timeout';
import {
  RTCPeerConnection,
  RTCMediaStream,
  RTCIceCandidate,
  RTCSessionDescription,
  RTCView,
  MediaStreamTrack,
  getUserMedia,
} from 'react-native-webrtc';


class Stream extends Component {

  constructor() {
    super();
    this.state = {
      message: null,
      status: null
    }
  }

  clearMessage() {
    this.setState({status: null, message: null});
  }

  showMessage() {
    if (this.state.message) {
      this.props.setTimeout(this.clearMessage.bind(this), 3000);
    }
    return !this.state.message ? null : (
      <View style={styles.message}>
        <Text style={styles.messageText}>{this.state.message}</Text>
      </View>
    );
  }

  render() {
    return (
      <View style={styles.container}>
        {this.showMessage.apply(this)}
        <RTCView streamURL={this.state.videoURL} style={styles.video}/>
      </View>
    );
  }
}

export default ReactTimeout(Stream);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'stretch',
    justifyContent: 'center',
    backgroundColor: 'white'
  },
  video: {
    width: 300,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'stretch',
  },
  message: {
    backgroundColor: '#E0E0E0',
    height: 60,
    padding: 5,
    margin: 10,
    borderRadius: 7
  },
  messageText: {
    textAlign: 'center',
    marginTop: 10
  }
});
