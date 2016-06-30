import { Meteor } from 'meteor/meteor';
import { Challenge } from '../collections/challenges';

Meteor.publish('challenges', function() {
  return Challenge.find({location: {$exists: true}});
});