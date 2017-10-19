import resolver from './helpers/resolver';
import {
  setResolver
} from 'ember-qunit';
import { start } from 'ember-cli-qunit';
import 'ember-sortable/helpers/drag';
import 'ember-sortable/helpers/reorder';

setResolver(resolver);
start();
