'use strict';

import React from 'react';
import moment from 'moment';
import { serverDateFormat } from 'siteConfig';
import ReactMixin, { navMixin, storeMixin, validationMixin, serverActionsMixin } from 'mixins';
import { Component, Form, Button, Spinner, Alert, Select, FormInput, FormField } from 'ui';
import { Navigation } from 'react-router';

// Actions
import { HotelsSearchFormActions, HotelsResultActions } from 'siteActions';

//Constants
import { HotelGuestSelector } from 'siteConstants';

// Store
import { HotelsSearchFormStore } from 'siteStores';

// Child components
import CityField                from './CityField';
import SearchFormCalendarField  from 'site/components/_common/SearchForm/CalendarField/SearchFormCalendarField';
import HotelsSearchFormRooms   from './Guests/Rooms';

import './HotelsSearchForm.scss';

@ReactMixin.decorate(Navigation)
@ReactMixin.decorate(validationMixin)
@ReactMixin.decorate(storeMixin)
@ReactMixin.decorate(serverActionsMixin)
export default class HotelsSearchForm extends Component {

  static classes = {
    ns: 'HotelsSearchForm',
    Main: {  },
    Form: { },
    Fields: {},
    FieldWrapper: { modifiers: ['fieldName'] },
    SubmitButton: {},
    FormError: {}
  };

  getStores(){
    return [ HotelsSearchFormStore ];
  }

  getStateFromStores() {
    return {
      fields: HotelsSearchFormStore.getFields()
    };
  }

  constructor() {
    super();
    this.focusFirstEmptyField = false;
    this.state = { searchError: false };
  }

  getInitialValidators() {
    return [
      this.createValidator('city',      ()=> this.state.fields.city).registerRule(this.validateNotEmpty.bind(this)),
      this.createValidator('check_in',  ()=> this.state.fields.check_in).registerRule(this.validateNotEmpty.bind(this)),
      this.createValidator('check_out', ()=> this.state.fields.check_out).registerRule(this.validateNotEmpty.bind(this))
    ];
  }

  validateNotEmpty(value) {
    if ( ! value) {
      throw new Error(this.pgettext('Form', 'Поле не может быть пустым!'));
    }
  }

  handleFieldUpdate( fieldName, value, isChangedOnBlur) {
    this.focusFirstEmptyField = !isChangedOnBlur;
    HotelsSearchFormActions.updateField(fieldName, value);
    // State from store must be updated before validate function called,
    // so we use setImmediate
    const validator = this.validator(fieldName);
    if (validator) {
      setImmediate(validator.validate.bind(this));
    }
  }

  renderCityField(fieldName, placeholder) {
    const { fields } = this.state;
    const validator = this.validator(fieldName);

    const handleUpdate = (value, isChangedOnBlur)=> {
      this.handleFieldUpdate(fieldName, value, isChangedOnBlur);
    };

    const fieldProps = {
      placeholder:      placeholder,
      validator:        validator,
      invalid:          validator.isInvalid(),
      defaultValue:     fields[fieldName],
      onUpdate:         handleUpdate,
      makeFocus:        this.isNeedFocusOnRouteField(fieldName),
      label:            this.pgettext('Hotel', 'Город')
    };

    return (
      <CityField {...fieldProps} />
    );
  }

  renderCalendarField(fieldName, placeholder, label) {
    const validator = this.validator(fieldName);

    const handleUpdate = (date, isChangedOnBlur)=> {
      let value = date.isValid() ? date.format(serverDateFormat) : '';
      this.handleFieldUpdate(fieldName, value, isChangedOnBlur);
    };

    const fieldProps = {
      placeholder:      placeholder,
      validator:        validator,
      invalid:          validator.isInvalid(),
      selectedDates:    this.getCalendarSelectedDates(),
      activeDateIndex:  this.getCalendarActiveDateIndex(fieldName),
      onUpdate:         handleUpdate,
      makeFocus:        this.isNeedFocusOnRouteField(fieldName),
      label:            label
    };

    return (
      <SearchFormCalendarField {...fieldProps} />
    );
  }

  renderGuestsButton() {
    const { fields } = this.state;

    const handleUpdate = (value, isChangedOnBlur, ev)=> {
      this.handleFieldUpdate('guestSelector', value, isChangedOnBlur);
    };

    const fieldProps = {
      selected:         fields.guestSelector,
      onSelect:         handleUpdate,
      label:            this.pgettext('Hotel', 'Гости'),
      options:          HotelGuestSelector.options
    };

    return (
      <Select {...fieldProps} />
    );
  }

  renderSubmit() {
    const serverActionSearchResult = this.getServerAction('searchResult'),
      serverActionGetResult = this.getServerAction('getResult'),
      show = {
        loading: serverActionSearchResult.isPending() || serverActionGetResult.isPending()
      };

    return (
      <Button
        type="primary"
        submit
        disabled={show.loading}
        className={this.cx('SubmitButton')}
      >
        { show.loading ? <Spinner /> : this.pgettext('Hotel', 'Найти отель') }
      </Button>
    );
  }

  renderFields() {
    const { fields } = this.state;

    return (
      <div key={fields.id} className={this.cx('Fields')}>

        <div className={this.cx('FieldWrapper', {fieldName: 'city'})}>
          { this.renderCityField('city',  this.pgettext('Hotels', 'Город')) }
        </div>

        <div className={this.cx('FieldWrapper', {fieldName: 'check_in'})}>
          { this.renderCalendarField('check_in', 'DD.MM.YYYY', this.pgettext('Hotel', 'Дата заезда')) }
        </div>

        <div className={this.cx('FieldWrapper', {fieldName: 'nights'})}>
          { this.renderNights() }
        </div>

        <div className={this.cx('FieldWrapper', {fieldName: 'check_out'})}>
          { this.renderCalendarField('check_out', 'DD.MM.YYYY', this.pgettext('Hotel', 'Дата выезда')) }
        </div>

        <div className={ this.cx('FieldWrapper', {fieldName: 'guestSelector'}) }>
          { this.renderGuestsButton() }
        </div>

        <div className={ this.cx('FieldWrapper', {fieldName: 'submit'}) }>
          { this.renderSubmit() }
        </div>

      </div>
    );
  }

  customGuestUpdateCount(index, fieldName, value) {
    HotelsSearchFormActions.updateRoomVisitors(index, fieldName, value);
  }

  customGuestClose() {

  }

  renderGuests() {
    const { fields } = this.state;

    return (
      <HotelsSearchFormRooms
        isOpen={fields.guestSelector === HotelGuestSelector.customSelector}
      />
    );
  }

  renderSearchError() {
    if ( ! this.state.searchError ) {
      return null;
    }

    return (
      <Alert type="error" className={this.cx('FormError')}>
        <div>{ this.state.searchError }</div>
      </Alert>
    );
  }

  renderNights() {
    const { nights } = this.state.fields;

    const handleUpdate = (ev)=> {
      this.handleFieldUpdate('nights', ev.target.value, false);
      this.resetValidators();
    };

    return (
      <FormField label={this.pgettext('Hotel', 'Ночей')}>
        <FormInput
          value={nights}
          onChange={ handleUpdate }
        />
      </FormField>
    )
  }

  render() {
    return (
      <Form className={this.cx('From')} autoComplete="off" onSubmit={::this.handleSubmit}>
        { this.renderFields() }
        { this.renderGuests() }
        { this.renderSearchError() }
      </Form>
    );
  }

  getCalendarSelectedDates() {
    const { fields } = this.state;

    let dates = [ fields.check_in, fields.check_out ];

    dates = dates.map((date)=> {
      date = moment(date, 'DD.MM.YYYY');
      return date.isValid() ? date : null;
    });

    return dates;
  }

  getCalendarActiveDateIndex(fieldName) {
    if (fieldName === 'check_in') {
      return 0;
    }
    return 1;
  }

  isNeedFocusOnRouteField(fieldName) {
    if (this.focusFirstEmptyField) {
      if (!this.state.fields[fieldName]) {
        this.focusFirstEmptyField = false;
        return true;
      }
    }
    return false;
  }

  handleSubmit(ev) {
    ev.preventDefault();
    this.getServerAction('searchResult').reset();
    this.getServerAction('getResult').reset();
    this.setState({ searchError: false});

    let searchId = null;

    this.validate()
      .then(()=> {
        const params = HotelsSearchFormStore.prepareForSearch();
        return this.callServerAction('searchResult', HotelsResultActions.searchResult(params), { success: false });
      })
      .delay(3000)
      .then((data)=> {
        searchId = data.search_id;
        return this.callServerAction('getResult', HotelsResultActions.getResultAsync(searchId), { success: false });
      })
      .then((data)=> {
        this.transitionTo('hotelResult', { searchId: searchId });
      })
      .catch((err) => {
        console.log(err);
        this.setState({ searchError: err.message });
      });
  }
}
