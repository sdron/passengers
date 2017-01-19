'use strict';

import React from 'react';
import ReactMixin, { storeMixin } from 'mixins';
import { Component, Button, Radio, RadioGroup } from 'ui';
import { PassengerStore } from 'siteStores';

import New from './New/New';
import List from './List/List';
import './Passengers.scss';

@ReactMixin.decorate(storeMixin)
export default class Passengers extends Component {

  static classes = {
    ns: 'Passengers',
    Passengers: {},
    Controls: {}
  };

  constructor() {
    super();
    this.state = {
      showNew: false
    };
  }

  getStores() {
    return [ PassengerStore ];
  }

  getStateFromStores() {
    return {
      isLoading: PassengerStore.isLoading()
    };
  }

  handleNewClick() {
    this.setState({ showNew: true });
  }

  handleNewModalClose() {
    this.setState({ showNew: false });
  }

  shouldComponentUpdate(newProps, newState) {
    return newState.showNew !== this.state.showNew ||
      newState.isLoading !== this.state.isLoading;
  }

  renderControls() {
    return (
      <div className={this.cx('Controls')}>
        <Button
          type='success'
          onClick={::this.handleNewClick}>

          { this.gettext('Добавить') }
        </Button>
      </div>
    );
  }

  render() {
    const { showNew } = this.state;

    return (
      <div className={this.cx('Passengers')}>
        { this.renderControls() }
        <New open={showNew} onClose={::this.handleNewModalClose} />
        <List />
      </div>
    );
  }

};
