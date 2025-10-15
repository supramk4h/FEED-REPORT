// This file cannot use `import` statements because it's part of a browser-based ES module setup
// that relies on a global `supabase` object being available from a CDN script.

// We need to declare the global variable to satisfy TypeScript.
declare global {
  interface Window {
    supabase: {
      createClient: (url: string, key: string) => any;
    };
  }
}

const supabaseUrl = 'https://dfcylnndcwnzfbgdgotn.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRmY3lsbm5kY3duemZiZ2Rnb3RuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1MjcxMjQsImV4cCI6MjA3NjEwMzEyNH0.1Aha2fF_rcahsYRSh_fanw-QIRxL9MNVO48IDga5r7U';

if (!window.supabase) {
  throw new Error("Supabase client is not available. Make sure the Supabase CDN script is loaded in your HTML file before your application script.");
}

export const supabase = window.supabase.createClient(supabaseUrl, supabaseAnonKey);
