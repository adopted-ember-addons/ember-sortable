import Application from '../app';
import config from '../config/environment';
import { setApplication } from '@ember/test-helpers';
import { start } from 'ember-qunit';
import '@gynzy/ember-sortable/helpers/drag';
import '@gynzy/ember-sortable/helpers/reorder';

setApplication(Application.create(config.APP));

start();
