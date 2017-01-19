'use strict';

import React from 'react';
import { Component } from 'ui';
import ReactMixin, { serverActionsMixin } from 'mixins';
import { PassengerEditorActions, PassengerActions } from 'siteActions';
import { PassengerEditorStore, PassengerStore } from 'siteStores';
import PassengerEditor from '../PassengerEditor/PassengerEditor';

@ReactMixin.decorate(serverActionsMixin)
export default class PassengersEdit extends Component {

  static propTypes = {
    passengerIndex: React.PropTypes.number
  };

  constructor() {
    super();
    this.state = {
      storeFilled: false
    };
  }

  componentWillReceiveProps(props) {
    if (props.open) {
      this.setState({ storeFilled: false });
      this.fillStore();
    }
  }

  fillStore() {
    setImmediate(()=> {
      let passengers = PassengerStore.getFilterList();
      let passenger = passengers[this.props.passengerIndex];

      PassengerEditorActions.fill(passenger);
      this.setState({ storeFilled: true });
    });
  }

  handleEditSubmit() {
    const data = PassengerEditorStore.getState();
    let passengers = PassengerStore.getFilterList();
    let passenger = passengers[this.props.passengerIndex];

    this.callServerAction('updatePassenger', PassengerActions.updatePassenger(passenger.id, data), { success: false })
      .then(this.props.onClose);
  }

  render() {
    const serverAction = this.getServerAction('updatePassenger');

    return (
      <PassengerEditor
        {...this.props}
        open={this.props.open && this.state.storeFilled}
        title={this.gettext('Редактировать')}
        pending={serverAction.isPending()}
        failure={serverAction.isFailure()}
        error={serverAction.getError()}
        onSubmit={::this.handleEditSubmit} />
    );
  }

};
