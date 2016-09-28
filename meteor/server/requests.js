import { Meteor } from 'meteor/meteor';
import { Requests } from '../collections/requests';

Meteor.publish('requests', function() {
  return Requests.find({});
});
