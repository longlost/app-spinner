
/**
  *
  * `app-spinner`
  * 
  *   Shows a message line, paper-spinner and a cancel paper-button depending on configuration.
  *
  *
  *   @customElement
  *   @polymer
  *   @demo demo/index.html
  *
  *
  *
  *  Methods:
  *
  *   show(message) -> pass a string to be displayed above the spinner, 
  *                    returns a promise that is resolved after the entry transition
  * 
  *   hide() -> returns a promise that is resolved after the exit transition
  *       
  * 
  *  Events:
  *    
  *     'spinner-canceled' -> when user clicks cancel button that is displayed after the waitTime expires
  *     
  *
  **/
 

import {
  AppElement, 
  html
}                 from '@longlost/app-element/app-element.js';
import {
  enableScrolling,
  getComputedStyle,
  schedule, 
  wait
}                 from '@longlost/utils/utils.js';
import htmlString from './app-spinner.html';
import '@polymer/paper-spinner/paper-spinner-lite.js';
import '@polymer/paper-button/paper-button.js';


class AppSpinner extends AppElement {
  static get is() { return 'app-spinner'; }

  static get template() {
    return html([htmlString]);
  }
  

  static get properties() {
    return {

      allowScrolling: Boolean,

      cancelable: Boolean,

      fullScreen: {
        type: Boolean,
        value: false
      },

      message: String,

      waitTime: {
        type: Number,
        value: 5000
      },

      timeoutMessage: {
        type: String,
        value: '...still loading'
      },

      _timeoutId: String

    };
  }


  static get observers() {
    return [
      '__fullScreenChanged(fullScreen)'
    ];
  }


  __computeAnimateMessage(message) {
    return message ? 'animate' : '';
  }


  __computeAnimateCancelBtn(message, timeoutMessage) {
    return message !== timeoutMessage ? '' : 'animate';
  }


  __computeHideCancelBtn(message, timeoutMessage) {
    return message !== timeoutMessage;
  }


  __fullScreenChanged(bool) {

    if (bool) {
      this.style.position = 'fixed';
      this.style.height   = '100vh';
    }
    else {
      this.style.position = 'absolute';
      this.style.height   = '100%';
    }
  }


  async __cancelButtonClicked() {
    try {
      await this.clicked();

      window.clearTimeout(this._timeoutId);

      this.fire('spinner-canceled');
    }
    catch (error) { 
      if (error === 'click debounced') { return; }
      console.log(error); 
    }
  }


  async hide() {
    if (getComputedStyle(this, 'opacity') === '0') { return; }

    this.style.opacity = '0';

    await wait(250);

    this.$.spinner.active = false;
    this.style.display    = 'none';

    if (this.fullScreen && !this.allowScrolling) {
      enableScrolling(true);
    }

    return schedule();
  }

  
  async show(message = '') {
    this.message          = message;
    this.$.spinner.active = true;
    this.style.display    = 'grid';

    if (this.fullScreen && !this.allowScrolling) {
      enableScrolling(false);
    }

    await schedule();

    if (getComputedStyle(this, 'opacity') === '1') { return; }

    if (this.cancelable) {
      window.clearTimeout(this._timeoutId);

      this._timeoutId = window.setTimeout(() => {
        this.message = this.timeoutMessage;
      }, this.waitTime);
    }

    this.style.opacity = '1';

    return wait(250);
  }

}

window.customElements.define(AppSpinner.is, AppSpinner);
