import { Meteor } from 'meteor/meteor';

import '../collections/users';
import './channels';
import './posts';
import './users';
import './methods';
import './challenge';

Meteor.startup(() => { });
