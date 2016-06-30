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

var io = require('socket.io-client/socket.io');

var socket;
var roomId = 'aaa';

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
let remoteStream;

function getLocalStream(isFront, callback) {
  MediaStreamTrack.getSources(sourceInfos => {
    console.log('------->', sourceInfos);
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
      console.log('dddd', stream);
      callback(stream);
    }, logError);
  });
}

function join(roomID) {
  socket.emit('join', roomID, function(socketIds){
    console.log('join', socketIds);
    for (var i in socketIds) {
      var socketId = socketIds[i];
      // debugger;
      createPC(socketId, true);
    }
  });
}

function createPC(socketId, isOffer) {
  var pc = new RTCPeerConnection(configuration);
  pcPeers[socketId] = pc;

  pc.onicecandidate = function (event) {
    console.log('onicecandidate', event.candidate);
    if (event.candidate) {
      socket.emit('exchange', {'to': socketId, 'candidate': event.candidate });
    }
  };

  function createOffer() {
    pc.createOffer(function(desc) {
      console.log('createOffer', desc);
      pc.setLocalDescription(desc, function () {
        console.log('setLocalDescription', pc.localDescription);
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
    if (event.target.iceConnectionState === 'completed') {
      setTimeout(() => {
        // getStats();
      }, 1000);
    }
    if (event.target.iceConnectionState === 'connected') {
      createDataChannel();
    }
  };
  pc.onsignalingstatechange = function(event) {
    console.log('onsignalingstatechange', event.target.signalingState);
  };

  pc.onaddstream = function (event) {
    remoteStream = true;
    console.log('stream added')
    container.setState({remoteStream: event.stream.toURL()});
    container.setState({remoteSocketId: socketId});

    peerConnected();
  };
  pc.onremovestream = function (event) {
    console.log('onremovestream', event.stream);
  };

  pc.addStream(localStream);
  function createDataChannel() {
    if (pc.textDataChannel) {
      return;
    }
    var dataChannel = pc.createDataChannel("text");

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
  var fromId = data.from;
  var pc;
  if (fromId in pcPeers) {
    pc = pcPeers[fromId];
  } else {
    pc = createPC(fromId, false);
  }

  if (data.sdp) {
    console.log('exchange sdp', data);
    pc.setRemoteDescription(new RTCSessionDescription(data.sdp), function () {
      if (pc.remoteDescription.type == "offer")
        pc.createAnswer(function(desc) {
          console.log('createAnswer', desc);
          pc.setLocalDescription(desc, function () {
            console.log('setLocalDescription', pc.localDescription);
            socket.emit('exchange', {'to': fromId, 'sdp': pc.localDescription });
          }, logError);
        }, logError);
    }, logError);
  } else {
    console.log('exchange candidate', data);
    pc.addIceCandidate(new RTCIceCandidate(data.candidate));
  }
}

function leave(socketId) {
  console.log('leave', socketId);
  var pc = pcPeers[socketId];
  var viewIndex = pc.viewIndex;
  pc.close();
  delete pcPeers[socketId];

  var remoteList = container.state.remoteList;
  delete remoteList[socketId]
  container.setState({ remoteList: remoteList });
  container.setState({info: 'One peer leave!'});
}
function setSocket() {
  socket = io.connect('http://react-native-webrtc.herokuapp.com', {transports: ['websocket']});

  socket.on('exchange', function (data) {
    exchange(data);
  });
  socket.on('leave', function (socketId) {
    leave(socketId);
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
  console.log("logError", error);
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
  if (pc.getRemoteStreams()[0] && pc.getRemoteStreams()[0].getAudioTracks()[0]) {
    var track = pc.getRemoteStreams()[0].getAudioTracks()[0];
    pc.getStats(track, function(report) {
    }, logError);
  }
}

var container;

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
      join(roomId);
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
      return (<View>
        <Text style={{fontWeight: 'bold'}}>
          Connecting...
        </Text>
      </View>)
    }
  }

  render() {
    return (
      <View style={styles.container}>
        {this.renderRemote(this.state.remoteStream)}
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
  }
});
