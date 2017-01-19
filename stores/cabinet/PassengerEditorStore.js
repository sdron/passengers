'use strict';

import _ from 'lodash';
import alt from 'root/alt';
import moment from 'moment';
import update from 'react/lib/update';
import { createStore, bind } from 'alt/utils/decorators';
import { PassengerGenders } from 'constants';
import { PassengerEditorActions } from 'siteActions';
import PassengerStore from './PassengerStore';

@createStore(alt)
export default class PassengerEditorStore {

  static displayName = 'PassengerEditorStore';

  constructor() {
    this.state = this._getDefaultState();
  }

  // Private methods

  _getDefaultState() {
    const citizenship = PassengerStore.getDefaultCitizenship();

    return {
      citizenship,
      lastname: '',
      firstname: '',
      birthdate: '',
      middlename: '',
      document_number: '',
      document_expire: '',
      gender: PassengerGenders.MALE,
      document_type: PassengerStore.getAvailableDocumentTypes(citizenship)[0],
      email: '',
      phone: '',
      bonus_card: ''
    };
  }

  // Action handlers

  @bind(PassengerEditorActions.updateField)
  handleUpdateField([ fieldName, value ]) {
    this.setState({ [fieldName]: value });

    switch (fieldName) {
      case 'citizenship':
        let document_type = PassengerStore.getAvailableDocumentTypes(value)[0];
        this.setState({
          document_type,
          ..._.pick(
            this._getDefaultState(),
            'firstname',
            'middlename',
            'lastname',
            'document_expire',
            'document_number'
          )
        });
        break;

      case 'document_type':
        this.setState(_.pick(
          this._getDefaultState(),
          'firstname',
          'middlename',
          'lastname',
          'document_expire',
          'document_number'
        ));
        break;
    }
  }

  @bind(PassengerEditorActions.drop)
  handleDrop() {
    this.setState(this._getDefaultState());
  }

  @bind(PassengerEditorActions.fill)
  handleFill(data) {
    this.setState(data);
  }

};
