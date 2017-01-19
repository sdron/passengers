'use strict';

import React from 'react';
import { Component } from 'ui';
import ReactMixin, { serverActionsMixin } from 'mixins';
import { PassengerEditorActions, PassengerActions } from 'siteActions';
import { PassengerEditorStore } from 'siteStores';
import PassengerEditor from '../PassengerEditor/PassengerEditor';

@ReactMixin.decorate(serverActionsMixin)
export default class PassengersNew extends Component {

  constructor() {
    super();
    this.state = {
      storeDropped: false
    };
  }

  componentWillReceiveProps(props) {
    if (props.open) {
      this.setState({ storeDropped: false });
      this.dropStore();
    }
  }

  dropStore() {
    setImmediate(()=> {
      PassengerEditorActions.drop();
      this.setState({ storeDropped: true });
    });
  }

  handleNewSubmit() {
    const data = PassengerEditorStore.getState();

    this.callServerAction('addPassenger', PassengerActions.addPassenger(data), { success: false })
      .then(this.props.onClose);
  }

  render() {
    const serverAction = this.getServerAction('addPassenger');

    return (
      <PassengerEditor
        {...this.props}
        open={this.props.open && this.state.storeDropped}
        title={this.gettext('Новый пассажир')}
        pending={serverAction.isPending()}
        failure={serverAction.isFailure()}
        error={serverAction.getError()}
        onSubmit={::this.handleNewSubmit} />
    );
  }

};
