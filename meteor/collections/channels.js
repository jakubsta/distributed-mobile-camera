import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';

const ChannelsSchema = new SimpleSchema({
  subscriber: {type: String},
  publisher: {type: String},
  status: {type: String},
  creationDate: {type: Date}
});

const Channels = new Mongo.Collection('channels');
Channels.attachSchema(ChannelsSchema);
export { Channels };
