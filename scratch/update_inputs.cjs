const fs = require('fs');
let html = fs.readFileSync('admin.html', 'utf8');

// Replace standard input/textarea classes
html = html.replace(/class="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"/g, 
  'class="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary dark:focus:ring-green-500 focus:border-primary outline-none transition-all shadow-sm"');

html = html.replace(/class="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all resize-none"/g, 
  'class="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary dark:focus:ring-green-500 focus:border-primary outline-none transition-all shadow-sm resize-none"');

html = html.replace(/class="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all font-mono"/g, 
  'class="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary dark:focus:ring-green-500 focus:border-primary outline-none transition-all shadow-sm font-mono"');

// Replace Labels
html = html.replace(/class="text-sm font-bold text-gray-700"/g, 'class="text-sm font-bold text-gray-700 dark:text-gray-300"');
html = html.replace(/class="text-sm font-bold text-gray-700 flex items-center gap-2"/g, 'class="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2"');
html = html.replace(/class="text-sm font-semibold text-gray-700"/g, 'class="text-sm font-semibold text-gray-700 dark:text-gray-300"');

// Replace description text
html = html.replace(/class="text-xs text-gray-500"/g, 'class="text-xs text-gray-500 dark:text-gray-400"');

fs.writeFileSync('admin.html', html);
console.log("Updated admin.html");
