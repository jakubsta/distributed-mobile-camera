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


const ChallengesSchema = new SimpleSchema({
  _id: {type: String},
  location: {type: LocationSchema, optional: true}
});

Meteor.users.attachSchema(ChallengesSchema);
