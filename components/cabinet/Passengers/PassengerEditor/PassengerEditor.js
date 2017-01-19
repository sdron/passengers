'use strict';

import React from 'react';
import moment from 'moment';
import { serverDateFormat } from 'siteConfig';
import ReactMixin, { storeMixin, validationMixin } from 'mixins';
import { Component, FormField, FormInput, Button, Modal, ButtonGroup,
  Icon, Tooltip, DateInput, CountryDropdownSelect, ButtonDropdownSelect,
  PassengerInput, Spinner, BasicPassportInput, EmailField, PhoneInput } from 'ui';
import { AviaPassengerGender } from 'siteConstants';
import { PassengerEditorActions } from 'siteActions';
import { PassengerEditorStore, PassengerStore, CountryStore } from 'siteStores';
import ErrorText from 'site/components/cabinet/ErrorText/ErrorText';
import { PassengerDocumentTypes } from 'siteConstants';
import './PassengerEditor.scss';

const now = moment();

@ReactMixin.decorate(storeMixin)
@ReactMixin.decorate(validationMixin)
export default class PassengersPassengerEditor extends Component {

  static classes = {
    ns: 'PassengersPassengerEditor',
    PassengersPassengerEditor: { ns: false },
    FormField__Value: {}
  };

  static propTypes = {
    open: React.PropTypes.bool,
    pending: React.PropTypes.bool,
    failure: React.PropTypes.bool,
    error: React.PropTypes.any,
    onClose: React.PropTypes.func,
    onSubmit: React.PropTypes.func,
    title: React.PropTypes.string
  };

  static defaultProps = {
    onClose: ()=> {},
    onSubmit: ()=> {}
  };

  componentWillReceiveProps() {
    this.resetValidators();
  }

  getStores() {
    return [ PassengerEditorStore ];
  }

  getStateFromStores() {
    const fields = PassengerEditorStore.getState();
    const { citizenship, document_type } = fields;

    return  {
      ...fields,
      availableCitizenships: PassengerStore.getAvailableCitizenships(),
      availableDocumentTypes: PassengerStore.getAvailableDocumentTypes(citizenship),
      isMiddlenameEnabled: PassengerStore.isMiddlenameEnabled(document_type),
      isDocumentExpireEnabled: PassengerStore.isDocumentExpireEnabled(document_type)
    };
  }

  getInitialValidators() {
    return [
      this.createValidator('firstname').registerRule(this.validateEmptyField.bind(this, 'firstname')),
      this.createValidator('lastname').registerRule(this.validateEmptyField.bind(this, 'lastname')),
      this.createValidator('middlename'),
      this.createValidator('birthdate'),
      this.createValidator('document_expire'),
      this.createValidator('document_number'),
      this.createValidator('phone'),
      this.createValidator('email'),
      this.createValidator('bonus_card')
    ];
  }

  validateEmptyField(fieldName) {
    const value = this.state[fieldName];

    if (!value.trim()) {
      throw new Error(this.gettext('Обязательное поле!'));
    }
  }

  handleClose() {
    this.props.onClose();
  }

  handleSubmit(ev) {
    ev.preventDefault();
    this.validate().tap(this.props.onSubmit);
  }

  handleUpdateField(fieldName, value) {
    PassengerEditorActions.updateField(fieldName, value);
    const validator = this.validator(fieldName);
    if (validator) {
      setImmediate(validator.validate);
    }
  }

  renderNameField(fieldName, label) {
    const element = ({
      [PassengerDocumentTypes.INTERNATIONAL_PASSPORT]:  PassengerInput.InternationalNameInput,
      [PassengerDocumentTypes.FOREIGN_DOCUMENT]:        PassengerInput.ForeignNameInput,
      [PassengerDocumentTypes.RUSSIAN_PASSPORT]:        PassengerInput.ForeignNameInput,
      [PassengerDocumentTypes.BIRTH_CERTIFICATE]:       PassengerInput.RussianNameInput,
      [PassengerDocumentTypes.OFFICER]:                 PassengerInput.RussianNameInput,
      [PassengerDocumentTypes.MILLTARY_ID]:             PassengerInput.RussianNameInput,
      [PassengerDocumentTypes.SEAMAN]:                  PassengerInput.RussianNameInput,
      [PassengerDocumentTypes.LOST_PASPORT]:            PassengerInput.RussianNameInput,
      [PassengerDocumentTypes.RF_RETURN]:               PassengerInput.RussianNameInput,
    })[this.state.document_type];

    if(!element) {
      return null;
    }

    const validator = this.validator(fieldName);

    return (
      <FormField
        invalid={validator && validator.isInvalid()}
        className={this.cx('FormField', { fieldName })}
        label={label}>

        <div className={this.cx('FormField__Value')}>
          { React.createElement(element, {
            key: this.state.document_type,
            validator: validator,
            defaultValue: this.state[fieldName],
            onUpdate: this.handleUpdateField.bind(this, fieldName)
          }) }
        </div>
      </FormField>
    );
  }

  renderDateField(fieldName, label, props = {}) {
    const validator = this.validator(fieldName);
    const date = moment(this.state[fieldName], serverDateFormat);

    return (
      <FormField
        invalid={validator.isInvalid()}
        className={this.cx('FormField', { fieldName })}
        label={label} >

        <div className={this.cx('FormField__Value')}>
          <DateInput
            {...props}
            validator={validator}
            defaultDate={date}
            onUpdateDate={ (date)=> this.handleUpdateField(fieldName, date.isValid() ? date.format(serverDateFormat) : '') } />
        </div>
      </FormField>
    );
  }

  renderGender() {
    const value = this.state.gender;
    const icons = {
      [ AviaPassengerGender.MALE ]: 'male',
      [ AviaPassengerGender.FEMALE ]: 'female'
    };

    return (
      <FormField
        className={this.cx('FormField', { fieldName: 'gender' })}
        label={this.gettext('Пол')} >

        <div className={this.cx('FormField__Value')}>
          <ButtonGroup>
            { _.map(AviaPassengerGender, (option)=> (
              <Tooltip
                key={option}
                content={AviaPassengerGender.translate(option)}>

                <Button
                  active={option === value}
                  type='plain'
                  onClick={()=> this.handleUpdateField('gender', option)}>

                  <Icon name={icons[option]} />
                </Button>
              </Tooltip>
            )) }
          </ButtonGroup>
        </div>
      </FormField>
    );
  }

  renderCitizenshipSelect() {
    const handleSelect = ({ code })=> {
      if (code !== this.state.citizenship) {
        this.resetValidators();
        this.handleUpdateField('citizenship', code);
      }
    };

    return (
      <FormField
        className={this.cx('FormField', { fieldName: 'citizenship' })}
        label={this.gettext('Гражданство')}>

        <div className={this.cx('FormField__Value')}>
          <CountryDropdownSelect
            block
            availableCountryCodes={this.state.availableCitizenships}
            selectedCountryCode={this.state.citizenship}
            onSelect={handleSelect}
            showCountryName />
        </div>
      </FormField>
    );
  }

  renderDocumentTypeSelect() {
    const handleSelect = (docType)=> {
      if (docType !== this.state.document_type) {
        this.resetValidators();
        this.handleUpdateField('document_type', docType);
      }
    };

    const renderItem = (item)=> (<span>{ PassengerDocumentTypes.translate(item) }</span>);

    return (
      <FormField
        className={this.cx('FormField', { fieldName: 'document_type' })}
        label={this.gettext('Тип документа')}>

        <div className={this.cx('FormField__Value')}>
          <ButtonDropdownSelect
            block
            items={this.state.availableDocumentTypes}
            renderItem={renderItem}
            onSelect={handleSelect} >

            { PassengerDocumentTypes.translate(this.state.document_type) }
          </ButtonDropdownSelect>
        </div>
      </FormField>
    );
  }

  renderDocumentExpire() {
    if (!this.state.isDocumentExpireEnabled) {
      return null;
    }

    return this.renderDateField('document_expire', this.gettext('Срок действия'), {
      key: this.state.document_type,
      minDate: now,
      maxDate: now.clone().add(30, 'year')
    });
  }

  renderDocumentNumber() {
    const element = ({
      [PassengerDocumentTypes.RUSSIAN_PASSPORT]:       PassengerInput.RussianPassportInput,
      [PassengerDocumentTypes.INTERNATIONAL_PASSPORT]: PassengerInput.InternationalPassportInput,
      [PassengerDocumentTypes.FOREIGN_DOCUMENT]:       PassengerInput.ForeignDocumentInput,
      [PassengerDocumentTypes.BIRTH_CERTIFICATE]:      PassengerInput.BirthCertificateInput,
      [PassengerDocumentTypes.OFFICER]:                PassengerInput.MilitaryIdInput,
      [PassengerDocumentTypes.MILLTARY_ID]:            PassengerInput.MilitaryIdInput,
      [PassengerDocumentTypes.SEAMAN]:                 PassengerInput.SeamanPassportInput,
      [PassengerDocumentTypes.LOST_PASPORT]:           BasicPassportInput,
      [PassengerDocumentTypes.RF_RETURN]:              BasicPassportInput
    })[this.state.document_type];

    if(!element) {
      return null;
    }

    const validator = this.validator('document_number');

    return (
      <FormField
        invalid={validator.isInvalid()}
        className={this.cx('FormField', { fieldName: 'document_number' })}
        label={this.gettext('Номер документа')}>

        { React.createElement(element, {
          key: this.state.document_type,
          validator: validator,
          defaultValue: this.state.document_number,
          onUpdate: this.handleUpdateField.bind(this, 'document_number')
        }) }
      </FormField>
    );
  }

  renderMiddlename() {
    if (!this.state.isMiddlenameEnabled) {
      return null;
    }

    return this.renderNameField('middlename', this.gettext('Отчество'))
  }

  renderEmail() {
    return <EmailField className={this.cx('FormField', {fieldName: 'email' })}
                       label={this.gettext('Email')}
                       invalid={this.validator('email').isInvalid()}
                       invalidMessage={this.validator('email').getErrorMessage()}
                       placeholder='user@example.com'
                       defaultValue={this.state['email']}
                       validator={this.validator('email')}
                       onUpdate={this.handleUpdateField.bind(this, 'email')} />
  }

  renderPhone() {
    return <FormField className={this.cx('FormField', {fieldName: 'phone' })}
                      label={this.gettext('Телефон')}
                      invalid={this.validator('phone').isInvalid()}
                      invalidMessage={this.validator('phone').getErrorMessage()}>

      <PhoneInput defaultValue={this.state['phone']}
                  validator={this.validator('phone')}
                  onUpdate={this.handleUpdateField.bind(this, 'phone')} />
    </FormField>
  }

  renderBonusCard() {
    return <FormField className={this.cx('FormField', {fieldName: 'bonus_card' })}
                      label={this.gettext('Карта часто летающего пассажира')}
                      invalid={this.validator('bonus_card').isInvalid()}
                      invalidMessage={this.validator('bonus_card').getErrorMessage()}>

      <FormInput defaultValue={this.state['bonus_card']}
                  validator={this.validator('bonus_card')}
                  onUpdate={this.handleUpdateField.bind(this, 'bonus_card')} />
    </FormField>
  }

  renderForm() {
    return (
      <div>
        { this.renderCitizenshipSelect() }
        { this.renderDocumentTypeSelect() }
        { this.renderDocumentExpire() }
        { this.renderDocumentNumber() }
        { this.renderNameField('firstname', this.gettext('Имя')) }
        { this.renderMiddlename() }
        { this.renderNameField('lastname', this.gettext('Фамилия')) }
        { this.renderDateField('birthdate', this.gettext('Дата рождения'), {
          minDate: now.clone().add(-120, 'year'),
          maxDate: now
        }) }
        { this.renderNameField('place_of_birth', 'Место рождения') }
        { this.renderGender() }

        { this.renderEmail() }
        { this.renderPhone() }
        { this.renderBonusCard() }
      </div>
    );
  }

  renderError() {
    const { failure, error } = this.props;

    if (!failure) {
      return null;
    }

    return (
      <ErrorText>
        { error.message }
      </ErrorText>
    );
  }

  render() {
    const { title, open, pending, failure, error } = this.props;

    return (
      <Modal
        className={this.cx('PassengersPassengerEditor')}
        open={open}
        onCancel={::this.handleClose}
        backdropClosesModal>

        <form onSubmit={::this.handleSubmit}>
          <Modal.Header text={title} showCloseButton onClose={::this.handleClose} />

          <Modal.Separator />

          <Modal.Body>
            { this.renderForm() }
            { this.renderError() }
          </Modal.Body>

          <Modal.Separator />

          <Modal.Footer>
            <Button submit type='primary' disabled={pending} spaceRight>
              { pending ? <Spinner /> : this.gettext('Подтвердить') }
            </Button>

            <Button type='hollow-default' onClick={::this.handleClose}>
              { this.gettext('Закрыть') }
            </Button>
          </Modal.Footer>
        </form>
      </Modal>
    );
  }

};
