'use strict';

import React from 'react';
import { Component, FormField, Icon, Button, Select } from 'ui';
import ReactMixin, { storeMixin } from 'mixins';
// Actions
import { HotelsSearchFormActions } from 'siteActions';
// Store
import { HotelsSearchFormStore } from 'siteStores';
import PersonSelect from './Select/Select';
// constants
import { HotelApp } from 'siteConstants';

import './Rooms.scss';

const childrenAges = [
  {key: 1, value: 1},
  {key: 2, value: 2},
  {key: 3, value: 3},
  {key: 4, value: 4},
  {key: 5, value: 5},
  {key: 6, value: 6},
  {key: 7, value: 7},
  {key: 8, value: 8},
  {key: 9, value: 9},
  {key: 10, value: 10}
];

@ReactMixin.decorate(storeMixin)
export default class HotelsSearchFormRooms extends Component {

  static classes = {
    ns: 'HotelsSearchFormRooms',
    Main: { },
    Fields: { },
    FieldWrapper: { modifiers: ['fieldName'] },
    AgesWrapper: { },
    AgesLabel: { },
    AgesInputs: { },
    AgesField: { },
    AddRoom: { },
    IconAdd: {},
    IconRemove: {},
    Routes: {},
    Header:{}
  };

  getStores() {
    return [ HotelsSearchFormStore ];
  }

  getStateFromStores() {
    return {
      rooms: HotelsSearchFormStore.getRooms()
    };
  }

  static propTypes = {
    isOpen: React.PropTypes.bool
  };

  constructor(props) {
    super(props);
  }

  handeUpdateChildrenAge(indexRoom, indexChildren, val) {
    HotelsSearchFormActions.updateChildrenAge(indexRoom, indexChildren, val);
  }

  handleUpdateAdultCount(index, value) {
    HotelsSearchFormActions.updateRoomVisitors(index, 'adults', value);
  }

  handleUpdateChildCount(index, value) {
    HotelsSearchFormActions.updateRoomVisitors(index, 'children', value);
  }

  handleRemoveRoom(index) {
    HotelsSearchFormActions.removeRoom(index);
  }

  handleAddRoom() {
    HotelsSearchFormActions.addRoom();
  }


  renderOneChildrenAge(indexRoom, children, indexChildren) {
    const fieldProps = {
      selected:         children.age,
      onSelect:         this.handeUpdateChildrenAge.bind(this, indexRoom, indexChildren),
      options:          childrenAges
    };
    return <div key={`room${indexRoom}children${indexChildren}`} className={this.cx('AgesField')}>
      <Select {...fieldProps} />
    </div>
  }

  renderChildAges(room, index) {
    const count = room.children.length;
    if(!count) {
      return null;
    }

    return <div className={this.cx('AgesWrapper')}>
      <div className={this.cx('AgesLabel')}>
        {this.pgettext('Hotels', "Возраст детей")}:
      </div>
      <div className={this.cx('AgesInputs')}>
        { room.children.map(this.renderOneChildrenAge.bind(this, index)) }
      </div>
    </div>;
  }

  renderRemBtn(index) {
    const { rooms } = this.state;

    if(rooms.length  == 1) {
      return false;
    }

    return <div>
      <Icon name='remove' className={this.cx('IconRemove')} />
      <Button
      type="text"
      onClick={this.handleRemoveRoom.bind(this, index)}
        >{this.pgettext('Hotels', 'Удалить номер')}</Button>
    </div>
  }

  renderFields(room, index) {
    const roomNumber = index+1;

    return (
      <div key={index} className={this.cx('Fields')}>
        <div className={this.cx('FieldWrapper', {fieldName: 'room'})}>
          {roomNumber} {this.pgettext('Hotels', 'Номер')} {' :'}
        </div>

        <div className={this.cx('FieldWrapper', {fieldName: 'adult'})}>
          <PersonSelect
            max={4}
            min={1}
            value={room.adults}
            icon="adult"
            onUpdate={this.handleUpdateAdultCount.bind(this, index)}
          />
        </div>

        <div className={this.cx('FieldWrapper', {fieldName: 'child'})}>
          <PersonSelect
            max={1}
            min={0}
            value={room.children.length}
            icon="child"
            onUpdate={this.handleUpdateChildCount.bind(this, index)}
          />
        </div>

        <div className={ this.cx('FieldWrapper', {fieldName: 'childBirdDay'}) }>
          {this.renderChildAges(room, index)}
        </div>

        <div className={ this.cx('FieldWrapper', {fieldName: 'remBtn'}) }>
          {this.renderRemBtn(index)}
        </div>
      </div>
    );
  }

  renderAddBtn() {
    const { rooms } = this.state;

    if(rooms.length  >= HotelApp.maxRooms) {
      return false;
    }

    return <div className={this.cx('AddRoom')}>
      <Icon name='add' className={this.cx('IconAdd')} />
      <Button
        type="text"
        onClick={::this.handleAddRoom}
      >{this.pgettext('Hotels', 'Добавить номер')}</Button>
    </div>;
  }

  renderTitle(){
    return (
      <div  className={this.cx('Header')}>
        <div className={this.cx('FieldWrapper', {fieldName: 'room'})}>
          &nbsp;
        </div>
        <div className={this.cx('FieldWrapper', {fieldName: 'adult'})}>
          {this.pgettext('Hotels', 'Взрослые')}
        </div>
        <div className={this.cx('FieldWrapper', {fieldName: 'child'})}>
          {this.pgettext('Hotels', 'Дети')}
        </div>
      </div>
    )
  }

  render() {
    const { isOpen } = this.props;
    const { rooms } = this.state;

    if(!isOpen) {
      return null;
    }

    return (
      <div className={this.cx('Main')}>
        {this.renderTitle()}
        <div className={this.cx('Routes')}>
          { rooms.map(::this.renderFields) }
        </div>
        {this.renderAddBtn()}
      </div>
    );
  }
}
