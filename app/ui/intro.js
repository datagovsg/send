const html = require('choo/html');

module.exports = function intro(state) {
  return html`
    <send-intro
      class="flex flex-col items-center justify-center bg-white px-6 md:py-0 py-6 mb-0 h-full w-full dark:bg-grey-90"
    >
      <div class="mt-24 flex flex-col h-full">
        <h1 class="text-3xl font-bold md:pb-2">
          ${state.translate('introTitle')}
        </h1>
        <p class="max-w-sm leading-loose mt-6 md:mt-2 md:pr-14">
          ${state.translate('introDescription')}
        </p>
      </div>
    </send-intro>
  `;
};
