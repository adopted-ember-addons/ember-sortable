import Application from '../app';
import config from '../config/environment';
import { setApplication } from '@ember/test-helpers';
import { start } from 'ember-qunit';
import 'ember-sortable/helpers/drag';
import 'ember-sortable/helpers/reorder';
import 'ember-sortable/helpers/waiters';

setApplication(Application.create(config.APP));

start();
