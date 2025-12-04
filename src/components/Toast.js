
export function showToast(msg, isError = true) {
    const toast = document.createElement('div');
    toast.className = `fixed bottom-4 left-4 right-4 ${isError ? 'bg-red-600' : 'bg-green-600'} text-white px-4 py-3 rounded-lg shadow-lg z-50 flex items-center justify-between animate-fade-in`;
    toast.innerHTML = `
    <div class="flex items-center gap-2">
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="${isError ? 'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' : 'M5 13l4 4L19 7'}"></path>
      </svg>
      <span class="text-sm font-medium">${msg}</span>
    </div>
    <button onclick="this.parentElement.remove()" class="text-white/80 hover:text-white">
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
      </svg>
    </button>
  `;
    document.body.appendChild(toast);

    setTimeout(() => {
        if (toast.parentElement) toast.remove();
    }, 5000);
}
