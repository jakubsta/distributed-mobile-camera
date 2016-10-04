import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  NativeModules
} from 'react-native';
import Meteor, { Accounts } from 'react-native-meteor';
import Button from 'apsl-react-native-button';
import ReactTimeout from 'react-timeout';

if (!window.navigator.userAgent) {
  window.navigator.userAgent = "react-native";
}

const WEBRTC_SERVER = 'http://185.5.97.71:4443';

var io = require('socket.io-client/socket.io');

let socket;
let roomId = 'aaa';
let globalClose;

import {
  RTCPeerConnection,
  RTCMediaStream,
  RTCIceCandidate,
  RTCSessionDescription,
  RTCView,
  RTCSetting,
  MediaStreamTrack,
  getUserMedia,
} from 'react-native-webrtc';
import Message from './message';


var configuration = {"iceServers": [{"url": "stun:stun.l.google.com:19302"}]};

const pcPeers = {};
let localStream;
let remoteStream;
let a = false;
function getLocalStream(isFront, callback) {
  MediaStreamTrack.getSources(sourceInfos => {
    let videoSourceId;
    for (const i = 0; i < sourceInfos.length; i++) {
      const sourceInfo = sourceInfos[i];
      if(sourceInfo.kind == "video" && sourceInfo.facing == (isFront ? "front" : "back")) {
        videoSourceId = sourceInfo.id;
      }
    }
    getUserMedia({
      "audio": true,
      "video": {
        optional: [{sourceId: videoSourceId}]
      }
    }, function (stream) {
      callback(stream);
    }, logError);
  });
}

function join(roomID) {
  socket.emit('join', roomID, function(socketIds){
    for (const i in socketIds) {
      const socketId = socketIds[i];
      createPC(socketId, true);
    }
  });
}

function createPC(socketId, isOffer) {
  const pc = new RTCPeerConnection(configuration);
  pcPeers[socketId] = pc;

  pc.onicecandidate = function (event) {
    if (event.candidate) {
      socket.emit('exchange', {'to': socketId, 'candidate': event.candidate });
    }
  };

  function createOffer() {
    pc.createOffer(function(desc) {
      pc.setLocalDescription(desc, function () {
        socket.emit('exchange', {'to': socketId, 'sdp': pc.localDescription });
      }, logError);
    }, logError);
  }

  pc.onnegotiationneeded = function () {
    console.log('onnegotiationneeded');
    if (isOffer) {
      createOffer();
    }
  }

  pc.oniceconnectionstatechange = function(event) {
    console.log('oniceconnectionstatechange', event.target.iceConnectionState);

    if (event.target.iceConnectionState === 'connected') {
      createDataChannel();
    }
  };
  pc.onsignalingstatechange = function(event) {
    console.log('onsignalingstatechange', event.target.signalingState);
  };

  pc.onaddstream = function (event) {
    container.setState({remoteStream: event.stream.toURL()});
    container.setState({remoteSocketId: socketId});

  };
  pc.onremovestream = function (event) {
    console.log('onremovestream', event.stream);
  };

  pc.addStream(localStream);
  function createDataChannel() {
    if (pc.textDataChannel) {
      return;
    }
    const dataChannel = pc.createDataChannel("text");

    dataChannel.onerror = function (error) {
      console.log("dataChannel.onerror", error);
    };

    dataChannel.onmessage = function (event) {
      console.log("dataChannel.onmessage:", event.data);
      container.receiveTextData({user: socketId, message: event.data});
    };

    dataChannel.onopen = function () {
      console.log('dataChannel.onopen');
      container.setState({textRoomConnected: true});
    };

    dataChannel.onclose = function () {
      console.log("dataChannel.onclose");
    };

    pc.textDataChannel = dataChannel;
  }
  return pc;
}

function exchange(data) {
  const fromId = data.from;
  let pc;
  if (fromId in pcPeers) {
    pc = pcPeers[fromId];
  } else {
    pc = createPC(fromId, false);
  }

  if (data.sdp) {
    pc.setRemoteDescription(new RTCSessionDescription(data.sdp), function () {
      if (pc.remoteDescription.type == "offer")
        pc.createAnswer(function(desc) {
          pc.setLocalDescription(desc, function () {
            socket.emit('exchange', {'to': fromId, 'sdp': pc.localDescription });
          }, logError);
        }, logError);
    }, logError);
  } else {
    pc.addIceCandidate(new RTCIceCandidate(data.candidate));
  }
}

function leave(socketId) {
  const pc = pcPeers[socketId];
  pc.close();
  delete pcPeers[socketId];

  const remoteList = container.state.remoteList;
  delete remoteList[socketId];
  container.setState({ remoteList: remoteList });
  container.setState({info: 'One peer leave!'});
}

function setSocket() {
  socket = io.connect(WEBRTC_SERVER, {transports: ['websocket'], 'forceNew':true});
  socket.on('exchange', function (data) {
    exchange(data);
  });

  socket.on('leave', function (socketId) {
    leave(socketId);
    globalClose();
  });

  socket.on('error', (error) => {
    console.log('error', error);
  });

  let promise = new Promise((resolve, reject) => {
    socket.on('connect', function (data) {
      getLocalStream(false, function(stream) {
        localStream = stream;
        container.setState({selfViewSrc: stream.toURL()});
        container.setState({status: 'ready', info: 'Please enter or create room ID'});
        resolve();

      });
    });
  });
  return promise;
}

function logError(error) {
  console.log("logError", error);
}

let container;

class StreamSubscriber extends Component {

  constructor() {
    super();
    this.state = {
      message: null,
      status: null,
      info: 'Initializing',
      status: 'init',
      roomID: '',
      isFront: true,
      selfViewSrc: null,
      remoteList: {},
      textRoomConnected: false,
      textRoomData: [],
      textRoomValue: '',
    }
  }

  componentDidMount() {
    container = this;
    setSocket().then(()=>{
      join(this.props.channel._id);
      globalClose = this.close.bind(this);
    });
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
  renderRemote(remoteStream){
    if(remoteStream) {
      return (<RTCView key={this.state.remoteSocketId} streamURL={this.state.remoteStream} style={styles.video}/>)
    } else {
      return (<Message message='Connecting...'/>)
    }
  }

  close() {
    a = false;
    if (localStream) {

      localStream.getTracks().forEach((track) => {
        localStream.removeTrack(track);
        track.stop();
      });
      localStream.active = false;

      for (const id in pcPeers) {
        leave(id)
      }

    }
    socket.disconnect();
    socket.close();
    Meteor.call('removeChannel', this.props.channel._id);
    container.props.navigator.replace({name: 'map'});
  }


  render() {
    return (
      <View style={styles.container}>
        {this.renderRemote(this.state.remoteStream)}
        <Button
          style={styles.button}
          textStyle={styles.buttonText}
          onPress={() => this.close()}
        >
          Close
          </Button>
      </View>
    );
  }
}

export default ReactTimeout(StreamSubscriber);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'stretch',
    justifyContent: 'center',
    backgroundColor: 'white'
  },
  video: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'stretch'
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
  },
  button: {
    position: 'absolute',
    borderWidth: 0  ,
    backgroundColor: '#3498aa',
    height: 50,
    padding: 15,
    borderRadius: 0,
    bottom: 0
  },
  buttonText: {
    color: 'white'
  },
});
