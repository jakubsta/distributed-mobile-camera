import { Meteor } from 'meteor/meteor';

Meteor.publish('users', function() {
  return Meteor.users.find({location: {$exists: true}, _id: { $ne: Meteor.user()._id } });
});
