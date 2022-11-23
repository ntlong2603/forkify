import icons from 'url:../../img/icons.svg' //Parcel v2
import { Fraction } from 'fractional';


export default class View {
    _data;

    render(data, render = true) {
        if (!data || Array.isArray(data) && data.length === 0)
            return this.renderError()

        this._data = data;
        const makup = this._generateMarkup();

        if (!render) return makup;

        this._clear();
        this._parentElement.insertAdjacentHTML("afterbegin", makup);
    }

    update(data) {

        this._data = data;

        const newMakeup = this._generateMarkup();
        // console.log(newMakeup);  
        const newDom = document.createRange().createContextualFragment(newMakeup)
        // console.log(newDom);

        const newElements = Array.from(newDom.querySelectorAll('*'))
        const curElements = Array.from(this._parentElement.querySelectorAll('*'))
        // console.log(newElements);

        newElements.forEach((newEl, i) => {
            const curEl = curElements[i];

            // Update changed TEXT
            if (!newEl.isEqualNode(curEl) && newEl.firstChild?.nodeValue.trim() !== '') {
                // console.log(newEl.isEqualNode(curEl));
                curEl.textContent = newEl.textContent
            }

            // Update changed ATTRIBUTE
            if (!newEl.isEqualNode(curEl)) Array.from(newEl.attributes).forEach(attr => curEl.setAttribute(attr.name, attr.value))

        })
    }

    _clear() {
        this._parentElement.innerHTML = ''
    }

    renderSpinner() {
        const makeup = `
          <div class="spinner">
            <svg>
              <use href="${icons}#icon-loader"></use>
            </svg>
          </div>
        `
        this._clear()
        this._parentElement.insertAdjacentHTML('afterbegin', makeup)
    }

    renderError(message = this._errorMessage) {
        const makeup = `
            <div class="error">
                <div>
                <svg>
                    <use href="${icons}#icon-alert-triangle"></use>
                </svg>
                </div>
                <p>${message}</p>
            </div>
        `
        this._clear()
        this._parentElement.insertAdjacentHTML('afterbegin', makeup)
    }

    renderMessage(message = this._message) {
        const makeup = `
            <div class="message">
                <div>
                <svg>
                    <use href="${icons}#icon-smile"></use>
                </svg>
                </div>
                <p>${message}</p>
            </div>
        `
        this._clear()
        this._parentElement.insertAdjacentHTML('afterbegin', makeup)
    }
}