// Single source of Slovak display labels for CarCare. The UI is SK-only today;
// when it gains en/hu these move to next-intl messages keyed by the same ids.

export const TEMPLATE_LABEL: Record<string, string> = {
  stk: 'STK – technická kontrola',
  ek: 'EK – emisná kontrola',
  pzp: 'PZP – povinné zmluvné poistenie',
  comprehensive_insurance: 'Havarijné poistenie (KASKO)',
  insurance: 'Poistenie',
  regular_service: 'Pravidelný servis',
  service: 'Servis',
  winter_tyres: 'Prezutie na zimné pneumatiky',
  summer_tyres: 'Prezutie na letné pneumatiky',
  tyres: 'Pneumatiky – sezónna výmena',
  highway_vignette: 'Diaľničná známka',
  vignette: 'Diaľničná známka',
  parking_permit: 'Parkovacia karta',
  permit: 'Povolenie',
  battery_warranty: 'Záruka na batériu',
  warranty: 'Záruka',
  charging_subscription: 'Predplatné nabíjania',
  subscription: 'Predplatné',
}

export const CATEGORY_LABEL: Record<string, string> = {
  inspection: 'Kontroly (STK/EK)',
  service: 'Servis',
  insurance: 'Poistenie',
  tyres: 'Pneumatiky',
  vignette: 'Diaľničné známky',
  permit: 'Povolenia',
  warranty: 'Záruky',
  subscription: 'Predplatné',
  other: 'Ostatné',
}

export const POWERTRAIN_LABEL: Record<string, string> = {
  PETROL: 'Benzín',
  DIESEL: 'Diesel',
  MHEV: 'Mild hybrid',
  HEV: 'Hybrid',
  PHEV: 'Plug-in hybrid',
  BEV: 'Elektromobil',
  LPG: 'LPG',
  CNG: 'CNG',
  HYDROGEN: 'Vodík',
  OTHER: 'Iné',
}

export const ACTION_LABEL: Record<string, string> = {
  BOOK: 'Objednať',
  RENEW: 'Obnoviť',
  PAY: 'Zaplatiť',
  PURCHASE: 'Kúpiť',
  INSPECT: 'Objednať',
  CUSTOM: 'Zobraziť',
}

export const GARAGE_ROLE_LABEL: Record<string, string> = {
  OWNER: 'Vlastník',
  MEMBER: 'Člen',
  VIEWER: 'Prehliadač',
  ADMIN: 'Administrátor',
}

function humanize(key: string) {
  return key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}
export function templateName(key: string) {
  return TEMPLATE_LABEL[key] ?? humanize(key)
}
export function categoryLabel(c: string) {
  return CATEGORY_LABEL[c] ?? c.charAt(0).toUpperCase() + c.slice(1)
}
export function powertrainLabel(p: string | null | undefined) {
  return p ? (POWERTRAIN_LABEL[p] ?? p) : ''
}

export function templateKey(key: string): string | null {
  return key in TEMPLATE_LABEL ? `tpl.${key}` : null
}
export function categoryKey(c: string): string | null {
  return c in CATEGORY_LABEL ? `cat.${c}` : null
}
export function powertrainKey(p: string | null | undefined): string | null {
  return p && p in POWERTRAIN_LABEL ? `pt.${p}` : null
}
