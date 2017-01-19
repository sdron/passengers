'use strict';

import { APIUtils } from 'utils';
import { createActions } from 'alt/utils/decorators';
import alt from 'root/alt';

@createActions(alt)
export default class HotelsSearchFormActions {

  constructor() {
    this.generateActions('updateField', 'updateRoomVisitors', 'updateChildrenAge', 'removeRoom', 'addRoom',
      'toogleSearchForm');
  }

};
