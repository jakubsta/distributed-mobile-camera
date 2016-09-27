import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  NativeModules,
  TouchableOpacity,
  Image
} from 'react-native';
import Meteor, { Accounts } from 'react-native-meteor';
import Button from 'apsl-react-native-button';
import ReactTimeout from 'react-timeout';

if (!window.navigator.userAgent) {
  window.navigator.userAgent = "react-native";
}

const WEBRTC_SERVER = 'http://185.5.97.71:4443';

var io = require('socket.io-client/socket.io');

var socket;
let roomId = 'aaa';
var closeConnection;

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


var configuration = {"iceServers": [{"url": "stun:stun.l.google.com:19302"}]};

var pcPeers = {};
var localStream;

function getLocalStream(isFront, callback) {
  MediaStreamTrack.getSources(sourceInfos => {
    var videoSourceId;
    for (var i = 0; i < sourceInfos.length; i++) {
      var sourceInfo = sourceInfos[i];
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
    for (var i in socketIds) {
      var socketId = socketIds[i];
      createPC(socketId, true);
    }
  });
}

function createPC(socketId, isOffer) {
  var pc = new RTCPeerConnection(configuration);
  closeConnection = () => {
    pc.close.apply(pc);
    socket.close();
    Meteor.call('updateUserStatus', 'free');
    container.props.navigator.replace({name: 'map'});
  };
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
    if (isOffer) {
      createOffer();
    }
  }

  pc.oniceconnectionstatechange = function(event) {
    if (event.target.iceConnectionState === 'completed') {
      setTimeout(() => {
        getStats();
      }, 1000);
    }
    if (event.target.iceConnectionState === 'connected') {
      createDataChannel();
    }
  };
  pc.onsignalingstatechange = function(event) {
  };

  pc.onaddstream = function (event) {
    container.setState({info: 'One peer join!'});
    peerConnected();

    var remoteList = container.state.remoteList;
    remoteList[socketId] = event.stream.toURL();
    container.setState({ remoteList: remoteList });
  };
  pc.onremovestream = function (event) {
  };

  pc.addStream(localStream);
  function createDataChannel() {
    if (pc.textDataChannel) {
      return;
    }
    var dataChannel = pc.createDataChannel("text");

    dataChannel.onerror = function (error) {
    };

    dataChannel.onmessage = function (event) {
      container.receiveTextData({user: socketId, message: event.data});
    };

    dataChannel.onopen = function () {
      container.setState({textRoomConnected: true});
    };

    dataChannel.onclose = function () {
    };

    pc.textDataChannel = dataChannel;
  }
  return pc;
}

function exchange(data) {
  var fromId = data.from;
  var pc;
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
  var pc = pcPeers[socketId];
  var viewIndex = pc.viewIndex;
  pc.close();
  delete pcPeers[socketId];

  var remoteList = container.state.remoteList;
  delete remoteList[socketId];
  container.setState({ remoteList: remoteList });
  container.setState({info: 'One peer leave!'});
}
function setSocket() {
  socket = io.connect(WEBRTC_SERVER, {transports: ['websocket']});
  socket.on('exchange', function (data) {
    exchange(data);
  });
  socket.on('leave', function (socketId) {
    leave(socketId);
  });
  socket.on('error', (error) => {
    console.log('error', error);
  });
  socket.on('close', function (socketId) {
    console.log('test');
    Meteor.call('updateUserStatus', 'free');
    container.props.navigator.replace({name: 'map'});
  });
  let promise = new Promise((resolve, reject) => {
    socket.on('connect', function (data) {
      getLocalStream(false, function (stream) {
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
}

function mapHash(hash, func) {
  var array = [];
  for (var key in hash) {
    var obj = hash[key];
    array.push(func(obj, key));
  }
  return array;
}

function peerConnected() {
  // RTCSetting.setAudioOutput('speaker');
  // RTCSetting.setKeepScreenOn(true);
  // RTCSetting.setProximityScreenOff(true);
}

function getStats() {
  var pc = pcPeers[Object.keys(pcPeers)[0]];
  if (!pc || !pc.getRemoteStreams()) {
    container.props.navigator.replace({name: 'map'});
    return;
  }
  if (pc.getRemoteStreams()[0] && pc.getRemoteStreams()[0].getAudioTracks()[0]) {
    var track = pc.getRemoteStreams()[0].getAudioTracks()[0];
    pc.getStats(track, function(report) {
    }, logError);
  }
}

var container;

export default class StreamPublisher extends Component {

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
      join(roomId);
    });
  }

  componentWillUnmount() {
    console.log('publisher unmount');
    if (closeConnection) {
      closeConnection();
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
        <RTCView streamURL={this.state.selfViewSrc} style={styles.video}/>
      </View>
    );
  }
/*<TouchableOpacity onPress={() => closeConnection()} style={styles.close}>
<Image
style={styles.button}
source={require('../assets/close.png')}
/>
</TouchableOpacity>*/

}

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
  publish: {
    position: 'absolute',
    right: 20,
    top: 20
  },
  button: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    width: 40,
    height: 40
  },
});
