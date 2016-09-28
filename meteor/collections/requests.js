import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';

const RequestsSchema = new SimpleSchema({
  subscriber: {type: String},
  publisher: {type: String},
  creationDate: {type: Date}
});

const Requests = new Mongo.Collection('requests');
Requests.attachSchema(RequestsSchema);
export { Requests };
