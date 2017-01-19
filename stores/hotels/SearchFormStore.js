'use strict';

import _ from 'lodash';
import update from 'react/lib/update';
import moment from 'moment';
import alt from 'root/alt';
import { createStore, bind } from 'alt/utils/decorators';

// Actions
import { HotelsSearchFormActions, HotelsResultActions } from 'siteActions';

//
import { HotelGuestSelector } from 'siteConstants';

const createChildren = ()=> ({
  age : 10
});

const createRoom = ()=> ({
  adults: 1,
  children: []
});


@createStore(alt)
export default class HotelsSearchFormStore {

  static displayName = 'HotelsSearchFormStore';

  constructor() {
    this.state = {
      id: _.uniqueId('route-'),
      city: null,
      check_in: null,
      nights: '',
      check_out: null,
      guestSelector: HotelGuestSelector.defaultValue,
      rooms: [createRoom()],
      showSearchForm: false
    };

    this.exportPublicMethods({
      getFields:        this.getFields,
      getRooms:         this.getRooms,
      prepareForSearch: this.prepareForSearch,
      showSearchForm:   this.showSearchForm
    });
  }

  //
  // Public methods
  //

  getFields() {
    return this.state;
  }

  getRooms() {
    return this.state.rooms;
  }

  showSearchForm() {
    return this.state.showSearchForm;
  }

  _calculateNights() {
    let nights = '';
    const { check_in, check_out} = this.state;

    if(check_in && check_out) {
      let checkIn = moment(check_in, 'DD.MM.YYYY');
      let checkOut = moment(check_out, 'DD.MM.YYYY');

      nights = checkOut.diff(checkIn, 'days');

      if(!nights || nights < 0) {
        nights = '';
      }
    }
    if(this.state.nights != nights) {
      this.setState({nights: nights});
    }
  }

  _setReturnDate(value) {
    value = parseInt(value);
    const { check_in} = this.state;

    if(check_in && value) {
      let data = moment(check_in, 'DD.MM.YYYY').add(value, 'days').format('DD.MM.YYYY');
      this.setState({
        check_out: data,
        nights: value
      })
    }
  }

  //
  // Private methods
  //

  _updateField(fieldName, value) {
    this.setState({ [fieldName]: value });
    if(fieldName == 'nights') {
      this._setReturnDate(value);
    } else {
      this._calculateNights();
    }
  }

  _updateAdults(index, value){
    let rooms = update(this.state.rooms, {
      [index]: {
        adults: {$set: value}
      }
    });
    this.setState({ rooms });
  }

  _updateChildrenCount(index, value) {
    let room = this.state.rooms[index];
    let diff = value - room.children.length;

    // ничего не изменилось
    if(diff == 0) {
      return;
    }

    if(diff > 0) {
      while (diff > 0) {
        room = update(room, {
          children: {$push: [createChildren()]}
        });
        diff--;
      }
    } else if(diff < 0) {
      room = update(room , {
        children: {$splice: [[value, 100]]}
      });
    }

    this.setState({ rooms : update(this.state.rooms, {
      [index]: { $set: room }
    })});
  }

  _updateChildrenAge(indexRoom, indexChildren, val) {
    let rooms = this.state.rooms;
    // todo fix
    rooms[indexRoom].children[indexChildren].age = val;

    this.setState({ rooms });
  }

  _removeRoom(indexRoom) {
    this.setState({
      rooms: update(this.state.rooms, { $splice: [[ indexRoom, 1 ]] })
    });
  }

  _addRoom() {
    this.setState({
      rooms: update(this.state.rooms, { $push: [ createRoom() ] })
    });
  }

  prepareForSearch() {
    const { rooms, city, check_in, check_out, guestSelector } = this.state;

    let adults = 0;
    let roomsCount = 1;
    let children = [];

    if(guestSelector == HotelGuestSelector.customSelector) {
      adults = rooms[0].adults;
      _.forEach(rooms[0].children, function (n, key) {
        children.push({child_age: n.age})
      });

    } else {
      if(guestSelector == '21') {
        adults = 2;
      }
      if(guestSelector == '11') {
        adults = 1;
      }
    }

    return {
      city: city.id,
      check_in: moment(check_in, 'DD.MM.YYYY').format('YYYY-MM-DD'),
      check_out: moment(check_out, 'DD.MM.YYYY').format('YYYY-MM-DD'),
      rooms: roomsCount,
      adults: adults,
      children: children
    };
  }

  //
  // Action handlers
  //

  @bind(HotelsSearchFormActions.updateField)
  handleUpdateField([fieldName, value]) {
    this._updateField(fieldName, value);
  }

  @bind(HotelsSearchFormActions.updateRoomVisitors)
  handleUpdateRoomVisitors([index, fieldName, value]) {
    if(fieldName == 'adults') {
      return this._updateAdults(index, value);
    }
    if(fieldName == 'children') {
      return this._updateChildrenCount(index, value);
    }
  }

  @bind(HotelsSearchFormActions.updateChildrenAge)
  handleUpdateChildrenAge([indexRoom, indexChildren, val]) {
    this._updateChildrenAge(indexRoom, indexChildren, val);
  }

  @bind(HotelsSearchFormActions.removeRoom)
  handleRemoveRoom(index) {
    this._removeRoom(index);
  }

  @bind(HotelsSearchFormActions.addRoom)
  handleAddRoom() {
    this._addRoom();
  }

  @bind(HotelsSearchFormActions.toogleSearchForm)
  handleShowSearchForm() {
    this.setState({showSearchForm : !this.state.showSearchForm});
  }

  @bind(HotelsResultActions.getResultSuccess)
  handleGetResultSuccess() {
    this.setState({showSearchForm: false})
  }
}
