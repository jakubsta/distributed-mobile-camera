import { Meteor } from 'meteor/meteor';
import { Channels } from '../collections/channels';

Meteor.publish('channels', function() {
  return Channels.find({});
});
