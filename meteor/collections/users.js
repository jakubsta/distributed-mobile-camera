import {Meteor} from 'meteor/meteor';
import {Mongo} from 'meteor/mongo';
import {SimpleSchema} from 'meteor/aldeed:simple-schema';

const LocationCoordsSchema = new SimpleSchema({
  speed: {
    type: Number,
    optional: true,
    decimal: true
  },
  heading: {
    type: Number,
    optional: true,
    decimal: true
  },
  accuracy: {
    type: Number,
    optional: true,
    decimal: true
  },
  longitude: {
    type: Number,
    optional: true,
    decimal: true
  },
  latitude: {
    type: Number,
    optional: true,
    decimal: true
  },
  altitude: {
    type: Number,
    optional: true,
    decimal: true
  }
});


const LocationSchema = new SimpleSchema({
  timestamp: {
    type: Number
  },
  coords: {
    type: LocationCoordsSchema
  },
  geohash: {
    type: String
  }
});


const UserSchema = new SimpleSchema({
  _id: {type: String},
  emails: {type: Array},
  'emails.$': {type: Object},
  'emails.$.address': {type: String},
  'emails.$.verified': {type: Boolean},
  createdAt: {type: Date},
  services: {type: Object, blackbox: true},
  username: {type: String, optional: true},
  location: {type: LocationSchema, optional: true},
  state: {type: String},
  requestingUserId: {type: Mongo.ObjectID}
});

Meteor.users.attachSchema(UserSchema);
