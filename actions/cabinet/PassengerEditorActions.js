'use strict';

import { APIUtils } from 'utils';
import { createActions } from 'alt/utils/decorators';
import alt from 'root/alt';

@createActions(alt)
export default class PassengerEditorActions {

  constructor() {
    this.generateActions('updateField', 'drop', 'fill');
  }

};
