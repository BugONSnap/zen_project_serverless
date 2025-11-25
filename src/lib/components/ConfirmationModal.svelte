<script lang="ts">
  import { fade } from 'svelte/transition';
  import { createEventDispatcher } from 'svelte';

  export let isOpen = false;
  export let title = 'Confirm Action';
  export let message = 'Are you sure you want to perform this action?';
  export let confirmText = 'Confirm';
  export let cancelText = 'Cancel';
  export let confirmVariant = 'danger'; // 'danger' or 'primary'

  const dispatch = createEventDispatcher();

  function handleConfirm() {
    dispatch('confirm');
    isOpen = false;
  }

  function handleCancel() {
    dispatch('cancel');
    isOpen = false;
  }

  // Close modal when clicking outside
  function handleBackdropClick(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      handleCancel();
    }
  }

  // Close on Escape key
  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      handleCancel();
    }
  }

  $: buttonClasses = {
    danger: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
    primary: 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500'
  }[confirmVariant];
</script>

{#if isOpen}
  <div
    class="fixed inset-0 z-50 overflow-y-auto"
    on:click={handleBackdropClick}
    on:keydown={handleKeydown}
    role="dialog"
    aria-modal="true"
    tabindex="0"
  >
    <div class="flex min-h-screen items-center justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
      <!-- Background overlay -->
      <div class="fixed inset-0 bg-black/75 transition-opacity" aria-hidden="true" transition:fade={{ duration: 150 }}></div>

      <!-- Modal panel -->
      <span class="hidden sm:inline-block sm:h-screen sm:align-middle" aria-hidden="true">&#8203;</span>
      
      <div 
        class="inline-block transform overflow-hidden rounded-2xl bg-gradient-to-br from-[#1a1a1a] to-[#2a0a0a] text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:align-middle"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-headline"
        transition:scale={{ duration: 150 }}
      >
        <div class="px-6 py-6 sm:px-8 sm:py-8">
          <div class="text-center sm:mt-0 sm:text-left">
            <h3 class="text-xl font-semibold leading-6 text-white" id="modal-headline">
              {title}
            </h3>
            <div class="mt-4">
              <p class="text-gray-300">
                {message}
              </p>
            </div>
          </div>
        </div>
        <div class="bg-black/30 px-6 py-4 sm:flex sm:flex-row-reverse sm:px-8 sm:py-5">
          <button
            type="button"
            class="inline-flex w-full justify-center rounded-lg border border-transparent px-6 py-2.5 text-sm font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm transition-colors duration-150 {buttonClasses}"
            on:click={handleConfirm}
          >
            {confirmText}
          </button>
          <button
            type="button"
            class="mt-3 inline-flex w-full justify-center rounded-lg border border-gray-500 bg-transparent px-6 py-2.5 text-sm font-medium text-gray-300 shadow-sm hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm transition-colors duration-150"
            on:click={handleCancel}
          >
            {cancelText}
          </button>
        </div>
      </div>
    </div>
  </div>
{/if}
