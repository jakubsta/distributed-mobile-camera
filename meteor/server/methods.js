import {Meteor} from 'meteor/meteor';

import {Channels} from '../collections/channels';
import {Requests} from '../collections/requests';

import {Posts} from '../collections/posts';
import {Challenge} from '../collections/challenges';
import Geohash from 'ngeohash';

Meteor.methods({

  'addChallenge': function (challenge) {
    Challenge.insert(challenge);
  },

  'addPost': function (roomId, message) {
    const user = Meteor.user();

    if (!user) {
      return;
    }

    Posts.insert({
      roomId,
      message,
      author: user.username,
      submitDate: new Date()
    });
  },
  'updateUserStatus': function (newStatus, userId = (Meteor.user() || {})._id) {
    return Meteor.users.update({_id: userId}, {$set: {state: newStatus}});
  },
  'setUserAsRequested': function (userId) {
    return Meteor.users.update({_id: userId}, {
      $set: {
        state: 'requested',
        requestingUserId: (Meteor.user() || {})._id
      }
    });
  },
  'updateLocation': function (location) {

    const userId = Meteor.userId();

    if (!userId) {
      return;
    }
    location.timestamp = Math.floor(location.timestamp);
    const precision = 9;
    location.geohash = Geohash.encode(location.coords.latitude, location.coords.longitude, precision);

    Meteor.users.update(userId, {
      $set: {
        location
      }
    });
  },
  'createChannel': function (userId) {
    const user = Meteor.user();

    if (!user) {
      return;
    }

    Channels.insert({
      subscriber: userId,
      publisher: user._id,
      creationDate: new Date()
    });

    Meteor.users.update({_id: user._id}, {$set: {state: 'subscriber'}});
    Meteor.users.update({_id: userId}, {$set: {state: 'publisher'}});

  },

  'removeChannel': function (_id) {
    Channels.remove({_id});
  },
  'createRequest': function (userId) {
    const user = Meteor.user();

    if (!user) {
      return;
    }

    Requests.insert({
      subscriber: user._id,
      publisher: userId,
      creationDate: new Date()
    });
  },

  'removeRequest': function (_id) {
    Requests.remove({_id});
  }

});
