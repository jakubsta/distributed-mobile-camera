import {Meteor} from 'meteor/meteor';

import {Rooms} from '../collections/rooms';
import {Posts} from '../collections/posts';
import {Challenge} from '../collections/challenges';
import Geohash from 'ngeohash';

Meteor.methods({

  'addRoom': function (title, description) {
    Rooms.insert({
      title,
      description,
      creationDate: new Date()
    })
  },
  
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
  'updateUserStatus': function(newStatus, userId = (Meteor.user() || {})._id ) {
    return Meteor.users.update({_id: userId}, {$set: {state: newStatus}});
  },
  'setUserAsRequested': function(userId) {
    return Meteor.users.update({_id: userId}, { $set: {state: 'requested', requestingUserId: (Meteor.user() || {})._id } });
  },
  'updateLocation': function (location) {

    const userId = Meteor.userId();

    console.log('updateLocation', location, userId);
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
  }
});
