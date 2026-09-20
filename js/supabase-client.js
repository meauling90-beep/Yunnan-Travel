const SUPABASE_URL = "https://awsqflekfsqgjjuspqdi.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF3c3FmbGVrZnNxZ2p6dXNwcWRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk4MjY2NTYsImV4cCI6MjEwNTQwMjY1Nn0.Lw9hh7R3I9pTVm_Qgq3-BbtLYZH8E0aRPrkONATt90c";

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

let appData = null;

export async function loadAllData() {
  try {
    const [
      { data: info }, { data: days }, { data: favs },
      { data: phs }, { data: guide }, { data: tips }
    ] = await Promise.all([
      supabase.from('trip_info').select('*').single(),
      supabase.from('trip_days').select('*').order('day_no'),
      supabase.from('favorites').select('*'),
      supabase.from('phrases').select('*'),
      supabase.from('guide_info').select('*').single(),
      supabase.from('guide_tips').select('*').order('sort_order')
    ]);
    const daysWithItems = [];
    for (const day of days) {
      const { data: items } = await supabase
        .from('trip_items').select('*').eq('day_id', day.id).order('id');
      daysWithItems.push({ ...day, items: items || [] });
    }
    appData = { info, days: daysWithItems, favorites: favs || [], phrases: phs || [], guide: { info, tips } };
    localStorage.setItem('supabase_cache', JSON.stringify(appData));
    return appData;
  } catch (err) {
    const cached = localStorage.getItem('supabase_cache');
    if (cached) return JSON.parse(cached);
    return null;
  }
}
export async function toggleFavorite(id, s) {
  await supabase.from('favorites').update({ is_starred: !s }).eq('id', id);
}
export function getData() { return appData; }
export default supabase;
