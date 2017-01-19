'use strict';

import React from 'react';
import { Component, Dropdown, FormField, NumberInput, Icon, Button } from 'ui';

import './Select.scss'

export default class HotelsSearchFormGuestsSelect extends Component{

  static classes = {
    ns: 'HotelsSearchFormGuestsSelect',
    Guests: {  },
    DropdownContent: {},
    SelectIco:{ },
    BtnInSelector: {}
  };

  static propTypes = {
    size: React.PropTypes.string,
    onUpdate: React.PropTypes.func,
    onClose: React.PropTypes.func,
    max: React.PropTypes.number,
    min: React.PropTypes.number,
    value: React.PropTypes.number
  };

  static defaultProps = {
    max: 4,
    min:0,
    value: 1,
    icon: 'users'
  };

  constructor(props) {
    super(props);

    this.state = {
      dropdownIsOpen: props.dropdownIsOpen || false
    };
  }

  handleDropdownOpen() {
    this.setState({ dropdownIsOpen: true });
  }

  handleDropdownClose() {
    this.setState({ dropdownIsOpen: false });
  }

  renderDropdownTarget() {
    const { dropdownIsOpen } = this.state;
    const { value, icon } = this.props;

    return (
      <Dropdown.TargetButton ref="dropdownButton"
                             size={this.props.size}
                             type="plain"
                             block
                             open={dropdownIsOpen}
                             onOpen={::this.handleDropdownOpen}
                             onClose={::this.handleDropdownClose}>

        <Icon className={this.cx('SelectIco')} name={icon} />{' '} { value }
      </Dropdown.TargetButton>
    );
  }

  handleGuestButtonClick(guestsCount) {
    this.props.onUpdate(guestsCount);
    this.handleDropdownClose();
  }

  renderBtn(btn, index) {
    return (
      <Button key={index} block tabIndex="-1" size="sm" type="text" className={this.cx('BtnInSelector')} onClick={this.handleGuestButtonClick.bind(this, btn)} >
        <span>{btn}</span>
      </Button>
    );
  }

  renderDropdownContent() {
    const { max, min } = this.props;

    let buttons = [];

    let i = min;
    while (i <= max) {
      buttons.push(i);
      i++;
    }

    return (
      <div className={this.cx('DropdownContent')}>
        { buttons.map(::this.renderBtn) }
      </div>
    );
  }

  render() {
    const { dropdownIsOpen } = this.state;

    return (
      <FormField className={this.cx('Guests')}>
        <Dropdown
          width={300}
          block
          open={dropdownIsOpen}
          onClose={::this.handleDropdownClose}
          target={this.renderDropdownTarget()}
          content={this.renderDropdownContent()} />
      </FormField>
    );
  }
}
