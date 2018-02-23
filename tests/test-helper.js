import Application from '../app';
import config from '../config/environment';
import { setApplication } from '@ember/test-helpers';
import { start } from 'ember-qunit';
// FIXME: Do these imports work?
import 'ember-sortable/helpers/drag';
import 'ember-sortable/helpers/reorder';

setApplication(Application.create(config.APP));

start();
