// import Footer from '@/app/components/Footer'
// import PagesHeader from '@/app/components/PagesHeader'
// import { CheckCircle, Car, Clock, Shield, AlertTriangle, Calculator } from 'lucide-react'

// export default function Vehicles() {
//   return (
//     <div className="min-h-screen bg-gradient-to-br from-purple-900 via-slate-900 to-black text-white">
//       <PagesHeader />
//       {/* Hero Section */}
//       <section className="max-w-7xl mx-auto px-6 py-20">
//         <div className="grid lg:grid-cols-2 gap-12 items-center">
//           <div>
//             <h1 className="text-5xl lg:text-6xl font-light mb-6 leading-tight">
//               Automatické
//               <br />
//               upozornenia
//               <br />
//               <span className="text-purple-400">pre vozidlá.</span>
//             </h1>
//             <p className="text-2xl text-white mb-8 leading-relaxed font-light">
//               Nikdy nezmeškajte technickú kontrolu ani výmenu pneumatík. <br /> Ušetrite pokuty, čas
//               a starosti s naším inteligentným systémom upozornení.
//             </p>
//             <div className="flex flex-wrap gap-4 mb-8">
//               <div className="flex items-center gap-2 bg-purple-800/30 px-4 py-2 rounded-full">
//                 <CheckCircle className="w-5 h-5 text-green-400" />
//                 <span>Technické kontroly</span>
//               </div>
//               <div className="flex items-center gap-2 bg-purple-800/30 px-4 py-2 rounded-full">
//                 <CheckCircle className="w-5 h-5 text-green-400" />
//                 <span>Výmeny pneumatík</span>
//               </div>
//               <div className="flex items-center gap-2 bg-purple-800/30 px-4 py-2 rounded-full">
//                 <CheckCircle className="w-5 h-5 text-green-400" />
//                 <span>Servisné prehliadky</span>
//               </div>
//               <div className="flex items-center gap-2 bg-purple-800/30 px-4 py-2 rounded-full">
//                 <CheckCircle className="w-5 h-5 text-green-400" />
//                 <span>Poistné termíny</span>
//               </div>
//             </div>
//             <button className="bg-gradient-to-r from-purple-600 to-pink-600 px-8 py-3 rounded-full text-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105">
//               Získajte ukážku zdarma
//             </button>
//           </div>

//           {/* Hero Illustration - matching your style */}
//           <div className="relative">
//             <div className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 rounded-3xl p-8 backdrop-blur-sm border border-purple-500/30">
//               <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
//                 <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm font-light">
//                   <Car className="w-8 h-8 text-purple-400 mb-2" />
//                   <div className="text-2xl text-white">TK termín</div>
//                   <div className="text-lg font-semibold">15.03.2025</div>
//                   <div className="text-md text-green-400 mt-1">✓ Upozornenie odoslané</div>
//                 </div>
//                 <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm font-light">
//                   <Clock className="w-8 h-8 text-orange-400 mb-2" />
//                   <div className="text-2xl text-white">Zimné pneumatiky</div>
//                   <div className="text-lg font-semibold">01.11.2024</div>
//                   <div className="text-md text-orange-400 mt-1">⏰ Za 14 dní</div>
//                 </div>
//                 <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm font-light">
//                   <Shield className="w-8 h-8 text-blue-400 mb-2" />
//                   <div className="text-2xl text-white">Servis</div>
//                   <div className="text-lg font-semibold">120,000 km</div>
//                   <div className="text-md text-blue-400 mt-1">📍 Aktuálne: 118,500 km</div>
//                 </div>
//                 <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm font-light">
//                   <AlertTriangle className="w-8 h-8 text-red-400 mb-2" />
//                   <div className="text-2xl text-white">Poistenie</div>
//                   <div className="text-lg font-semibold">31.12.2024</div>
//                   <div className="text-md text-red-400 mt-1">🚨 Kritické!</div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* Problem Section */}
//       <section className="bg-gradient-to-r from-red-900/20 to-orange-900/20 py-20">
//         <div className="max-w-7xl mx-auto px-6">
//           <div className="text-center mb-16">
//             <h2 className="text-4xl font-light mb-6">
//               Poznáte <span className="text-red-400">tento problém?</span>
//             </h2>
//             <p className="text-2xl text-gray-300 max-w-3xl mx-auto font-light">
//               Slovenské firmy ročne platia tisíce eur na pokutách za zmeškanú údržbu vozidiel
//             </p>
//           </div>

//           <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
//             <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-red-500/30">
//               <div className="text-3xl mb-4">💰</div>
//               <h3 className="text-2xl font-semibold mb-2 text-red-400">Pokuty za TK</h3>
//               <p className="text-gray-300 mb-2">€50 - €200 na vozidlo</p>
//               <p className="text-[22.5px] text-gray-400">Pri 5 vozidlách = až €1,000 ročne</p>
//             </div>

//             <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-orange-500/30">
//               <div className="text-3xl mb-4">⏰</div>
//               <h3 className="text-2xl font-semibold mb-2 text-orange-400">Stratený čas</h3>
//               <p className="text-gray-300 mb-2">2-3 hodiny mesačne</p>
//               <p className="text-[22.5px] text-gray-400">Sledovanie termínov a organizácia</p>
//             </div>

//             <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-yellow-500/30">
//               <div className="text-3xl mb-4">🔧</div>
//               <h3 className="text-2xl font-semibold mb-2 text-yellow-400">Vyššie náklady</h3>
//               <p className="text-gray-300 mb-2">+30% na opravy</p>
//               <p className="text-[22.5px] text-gray-400">Zanedbané servisy = drahšie poruchy</p>
//             </div>

//             <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/30">
//               <div className="text-3xl mb-4">😰</div>
//               <h3 className="text-2xl font-semibold mb-2 text-purple-400">Stres a starosti</h3>
//               <p className="text-gray-300 mb-2">Neustále sledovanie</p>
//               <p className="text-[22.5px] text-gray-400">Strach z premeškania termínov</p>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* Solution Section */}
//       <section className="py-20">
//         <div className="max-w-7xl mx-auto px-6">
//           <div className="text-center mb-16">
//             <h2 className="text-4xl font-light mb-6">
//               Naše <span className="text-green-400">riešenie</span>
//             </h2>
//             <p className="text-2xl text-gray-300 max-w-3xl mx-auto font-light">
//               Inteligentný systém, ktorý za vás sleduje všetko a včas vás upozorní
//             </p>
//           </div>

//           <div className="grid lg:grid-cols-3 gap-8 mb-16">
//             <div className="bg-gradient-to-br from-purple-800/30 to-blue-800/30 rounded-2xl p-8 backdrop-blur-sm border border-purple-500/30">
//               <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mb-6">
//                 <span className="text-2xl font-bold">1</span>
//               </div>
//               <h3 className="text-2xl font-semibold mb-4">Zadajte údaje</h3>
//               <p className="text-gray-300 leading-relaxed font-light">
//                 Jednorázovo zadáte informácie o vašich vozidlách - EČV, dátumy TK, posledné servisy
//                 a preferencie upozornení.
//               </p>
//             </div>

//             <div className="bg-gradient-to-br from-blue-800/30 to-green-800/30 rounded-2xl p-8 backdrop-blur-sm border border-blue-500/30">
//               <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-6">
//                 <span className="text-2xl font-bold">2</span>
//               </div>
//               <h3 className="text-2xl font-semibold mb-4">Systém sleduje</h3>
//               <p className="text-gray-300 leading-relaxed font-light">
//                 AI systém automaticky vypočíta všetky termíny, notifikuje a sleduje Vaše potvrdenia.
//               </p>
//             </div>

//             <div className="bg-gradient-to-br from-green-800/30 to-purple-800/30 rounded-2xl p-8 backdrop-blur-sm border border-green-500/30">
//               <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mb-6">
//                 <span className="text-2xl font-bold">3</span>
//               </div>
//               <h3 className="text-2xl font-semibold mb-4">Dostávate upozornenia</h3>
//               <p className="text-gray-300 leading-relaxed font-light">
//                 SMS a email upozornenia 30, 14 a 3 dni vopred. Máte dostatok času všetko naplánovať
//                 bez stresu.
//               </p>
//             </div>
//           </div>

//           {/* Features Grid */}
//           <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
//             <div className="flex items-center gap-4 bg-white/5 rounded-xl p-4">
//               <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0" />
//               <span>Technické kontroly a emisné merania</span>
//             </div>
//             <div className="flex items-center gap-4 bg-white/5 rounded-xl p-4">
//               <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0" />
//               <span>Výmena letných/zimných pneumatík</span>
//             </div>
//             <div className="flex items-center gap-4 bg-white/5 rounded-xl p-4">
//               <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0" />
//               <span>Servisné prehliadky podľa km/času</span>
//             </div>
//             <div className="flex items-center gap-4 bg-white/5 rounded-xl p-4">
//               <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0" />
//               <span>Registrácie a poistenia vozidiel</span>
//             </div>
//             <div className="flex items-center gap-4 bg-white/5 rounded-xl p-4">
//               <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0" />
//               <span>Prehľadný dashboard všetkých vozidiel</span>
//             </div>
//             <div className="flex items-center gap-4 bg-white/5 rounded-xl p-4">
//               <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0" />
//               <span>Reporty a štatistiky pre vedenie</span>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* ROI Calculator Section */}
//       <section className="bg-gradient-to-r from-green-900/20 to-blue-900/20 py-20">
//         <div className="max-w-4xl mx-auto px-6">
//           <div className="text-center mb-12">
//             <h2 className="text-4xl font-light mb-6">
//               <Calculator className="w-10 h-10 inline-block mr-4 text-green-400" />
//               Kalkulačka <span className="text-green-400">úspor</span>
//             </h2>
//           </div>

//           <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-green-500/30">
//             <div className="grid md:grid-cols-2 gap-8">
//               <div>
//                 <h3 className="text-2xl font-semibold mb-6 text-green-400">
//                   Vaše náklady bez systému
//                 </h3>
//                 <div className="space-y-4">
//                   <div className="flex justify-between items-center">
//                     <span>Pokuta za TK (1x ročne, 5 vozidiel):</span>
//                     <span className="font-semibold">€750</span>
//                   </div>
//                   <div className="flex justify-between items-center">
//                     <span>Čas na administratívu (3h/mes × €20/h):</span>
//                     <span className="font-semibold">€720</span>
//                   </div>
//                   <div className="flex justify-between items-center">
//                     <span>Dodatočné opravy (+20% nákladov):</span>
//                     <span className="font-semibold">€1,200</span>
//                   </div>
//                   <div className="border-t border-gray-600 pt-4 font-thin">
//                     <div className="flex justify-between items-center text-xl text-red-400">
//                       <span>Celkom ročne:</span>
//                       <span>€2,670</span>
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               <div>
//                 <h3 className="text-2xl font-semibold mb-6 text-blue-400">S naším systémom</h3>
//                 <div className="space-y-4">
//                   <div className="flex justify-between items-center">
//                     <span>Náklady na službu (5 vozidiel):</span>
//                     <span className="font-semibold">€900</span>
//                   </div>
//                   <div className="flex justify-between items-center">
//                     <span>Pokuty:</span>
//                     <span className="font-semibold text-green-400">€0</span>
//                   </div>
//                   <div className="flex justify-between items-center">
//                     <span>Čas na administratívu:</span>
//                     <span className="font-semibold text-green-400">€0</span>
//                   </div>
//                   <div className="flex justify-between items-center">
//                     <span>Dodatočné opravy:</span>
//                     <span className="font-semibold text-green-400">€0</span>
//                   </div>
//                   <div className="border-t border-gray-600 pt-4">
//                     <div className="flex justify-between items-center text-xl font-thin text-green-400">
//                       <span>Vaša úspora:</span>
//                       <span>€1,770</span>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             <div className="text-center mt-8">
//               <div className="text-3xl font-bold text-green-400 mb-2">ROI: 197%</div>
//               <p className="text-gray-300">Investícia sa vráti už v prvom roku</p>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* Pricing Section */}
//       <section className="py-20">
//         <div className="max-w-6xl mx-auto px-6">
//           <div className="text-center mb-16">
//             <h2 className="text-4xl font-light mb-6">
//               Transparentné <span className="text-purple-400">ceny</span>
//             </h2>
//             <p className="text-2xl text-gray-300 font-thin">
//               Prvý mesiac zdarma • Setup bez poplatkov? • Kedykoľvek zrušiteľné
//             </p>
//           </div>

//           <div className="grid lg:grid-cols-2 gap-8">
//             <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-gray-500/30">
//               <h3 className="text-2xl font-semibold mb-2">Starter</h3>
//               <div className="text-4xl font-bold mb-6">
//                 €12<span className="text-lg text-gray-400 font-thin">/vozidlo/mes</span>
//               </div>
//               <ul className="space-y-3 mb-8">
//                 <li className="flex items-center gap-3">
//                   <CheckCircle className="w-5 h-5 text-green-400" />
//                   <span>3-10 vozidiel</span>
//                 </li>
//                 <li className="flex items-center gap-3">
//                   <CheckCircle className="w-5 h-5 text-green-400" />
//                   <span>SMS + Email upozornenia</span>
//                 </li>
//                 <li className="flex items-center gap-3">
//                   <CheckCircle className="w-5 h-5 text-green-400" />
//                   <span>Základný dashboard</span>
//                 </li>
//                 <li className="flex items-center gap-3">
//                   <CheckCircle className="w-5 h-5 text-green-400" />
//                   <span>Email podpora</span>
//                 </li>
//               </ul>
//               <button className="w-full bg-gray-700 hover:bg-gray-600 px-6 py-3 rounded-full transition-colors">
//                 Začať zdarma
//               </button>
//             </div>

//             <div className="bg-gradient-to-br from-purple-600/30 to-pink-600/30 backdrop-blur-sm rounded-3xl p-8 border-2 border-purple-500/50 relative">
//               {/* <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
//                 <span className="bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-1 rounded-full text-sm font-medium">
//                   Najpopulárnejšie
//                 </span>
//               </div> */}
//               <h3 className="text-2xl font-semibold mb-2">Business</h3>
//               <div className="text-4xl font-bold mb-6">
//                 €15<span className="text-lg text-gray-400 font-thin">/vozidlo/mes</span>
//               </div>
//               <ul className="space-y-3 mb-8">
//                 <li className="flex items-center gap-3">
//                   <CheckCircle className="w-5 h-5 text-green-400" />
//                   <span>11-25 vozidiel</span>
//                 </li>
//                 <li className="flex items-center gap-3">
//                   <CheckCircle className="w-5 h-5 text-green-400" />
//                   <span>Všetky Starter funkcie</span>
//                 </li>
//                 <li className="flex items-center gap-3">
//                   <CheckCircle className="w-5 h-5 text-green-400" />
//                   <span>Pokročilé dashboardy</span>
//                 </li>
//                 <li className="flex items-center gap-3">
//                   <CheckCircle className="w-5 h-5 text-green-400" />
//                   <span>Telefonická podpora</span>
//                 </li>
//               </ul>
//               <button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-6 py-3 rounded-full transition-all transform hover:scale-105">
//                 Začať zdarma
//               </button>
//             </div>

//             {/* <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-gray-500/30">
//               <h3 className="text-2xl font-semibold mb-2">Enterprise</h3>
//               <div className="text-4xl font-bold mb-6">
//                 €10<span className="text-lg text-gray-400">/vozidlo/mes</span>
//               </div>
//               <ul className="space-y-3 mb-8">
//                 <li className="flex items-center gap-3">
//                   <CheckCircle className="w-5 h-5 text-green-400" />
//                   <span>25+ vozidiel</span>
//                 </li>
//                 <li className="flex items-center gap-3">
//                   <CheckCircle className="w-5 h-5 text-green-400" />
//                   <span>Všetky Business funkcie</span>
//                 </li>
//                 <li className="flex items-center gap-3">
//                   <CheckCircle className="w-5 h-5 text-green-400" />
//                   <span>Vlastný account manager</span>
//                 </li>
//                 <li className="flex items-center gap-3">
//                   <CheckCircle className="w-5 h-5 text-green-400" />
//                   <span>Integrácie na mieru</span>
//                 </li>
//                 <li className="flex items-center gap-3">
//                   <CheckCircle className="w-5 h-5 text-green-400" />
//                   <span>SLA 99.9%</span>
//                 </li>
//               </ul>
//               <button className="w-full bg-gray-700 hover:bg-gray-600 px-6 py-3 rounded-full transition-colors">
//                 Kontaktujte nás
//               </button>
//             </div> */}
//           </div>
//         </div>
//       </section>

//       {/* CTA Section */}
//       <section className="bg-gradient-to-r from-purple-900/40 to-pink-900/40 py-20">
//         <div className="max-w-4xl mx-auto px-6 text-center">
//           <h2 className="text-4xl lg:text-5xl font-light mb-6">
//             Ste Pripravení eliminovať <span className="text-purple-400">pokuty</span>?
//           </h2>
//           <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto font-thin">
//             Získajte 15-minútovú personalizovanú ukážku systému pre vašu firmu.
//             <br />
//             Prvý mesiac je kompletne zdarma.
//           </p>

//           <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
//             <button className="bg-gradient-to-r from-purple-600 to-pink-600 px-8 py-4 rounded-full text-lg font-thin hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105">
//               Objednať ukážku zdarma
//             </button>
//             <button className="border border-purple-500 px-8 py-4 rounded-full text-lg font-thin hover:bg-purple-500/10 transition-colors">
//               Poslať informácie emailom
//             </button>
//           </div>
//         </div>
//       </section>
//       <Footer />
//     </div>
//   )
// }import Footer from '@/app/components/Footer'
import Footer from '@/app/components/Footer'
import PagesHeader from '@/app/components/PagesHeader'
import { CheckCircle, Car, Clock, Shield, AlertTriangle, Calculator } from 'lucide-react'
import { useTranslations } from 'next-intl'

export default function Vehicles() {
  const t = useTranslations('Automatizations')

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-slate-900 to-black text-white">
      <PagesHeader />
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-5xl lg:text-6xl font-light mb-6 leading-tight">
              {t('heroTitle1')}
              <br />
              {t('heroTitle2')}
              <br />
              <span className="text-purple-400">{t('heroTitle3')}</span>
            </h1>
            <p className="text-2xl text-white mb-8 leading-relaxed font-light">
              {t('heroSubtitle1')} <br /> {t('heroSubtitle2')}
            </p>
            <div className="flex flex-wrap gap-4 mb-8">
              <div className="flex items-center gap-2 bg-purple-800/30 px-4 py-2 rounded-full">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span>{t('heroFeature1')}</span>
              </div>
              <div className="flex items-center gap-2 bg-purple-800/30 px-4 py-2 rounded-full">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span>{t('heroFeature2')}</span>
              </div>
              <div className="flex items-center gap-2 bg-purple-800/30 px-4 py-2 rounded-full">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span>{t('heroFeature3')}</span>
              </div>
              <div className="flex items-center gap-2 bg-purple-800/30 px-4 py-2 rounded-full">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span>{t('heroFeature4')}</span>
              </div>
            </div>
            <button className="bg-gradient-to-r from-purple-600 to-pink-600 px-8 py-3 rounded-full text-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105">
              {t('heroButton')}
            </button>
          </div>

          {/* Hero Illustration - matching your style */}
          <div className="relative">
            <div className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 rounded-3xl p-8 backdrop-blur-sm border border-purple-500/30">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm font-light">
                  <Car className="w-8 h-8 text-purple-400 mb-2" />
                  <div className="text-2xl text-white">{t('mockupTK')}</div>
                  <div className="text-lg font-semibold">{t('mockupTKDate')}</div>
                  <div className="text-md text-green-400 mt-1">{t('mockupTKStatus')}</div>
                </div>
                <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm font-light">
                  <Clock className="w-8 h-8 text-orange-400 mb-2" />
                  <div className="text-2xl text-white">{t('mockupTires')}</div>
                  <div className="text-lg font-semibold">{t('mockupTiresDate')}</div>
                  <div className="text-md text-orange-400 mt-1">{t('mockupTiresStatus')}</div>
                </div>
                <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm font-light">
                  <Shield className="w-8 h-8 text-blue-400 mb-2" />
                  <div className="text-2xl text-white">{t('mockupService')}</div>
                  <div className="text-lg font-semibold">{t('mockupServiceKm')}</div>
                  <div className="text-md text-blue-400 mt-1">{t('mockupServiceStatus')}</div>
                </div>
                <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm font-light">
                  <AlertTriangle className="w-8 h-8 text-red-400 mb-2" />
                  <div className="text-2xl text-white">{t('mockupInsurance')}</div>
                  <div className="text-lg font-semibold">{t('mockupInsuranceDate')}</div>
                  <div className="text-md text-red-400 mt-1">{t('mockupInsuranceStatus')}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="bg-gradient-to-r from-red-900/20 to-orange-900/20 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-light mb-6">
              {t('problemTitle')} <span className="text-red-400">{t('problemTitleHighlight')}</span>
            </h2>
            <p className="text-2xl text-gray-300 max-w-3xl mx-auto font-light">
              {t('problemSubtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-red-500/30">
              <div className="text-3xl mb-4">💰</div>
              <h3 className="text-2xl font-semibold mb-2 text-red-400">{t('problem1Title')}</h3>
              <p className="text-gray-300 mb-2">{t('problem1Price')}</p>
              <p className="text-[22.5px] text-gray-400">{t('problem1Detail')}</p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-orange-500/30">
              <div className="text-3xl mb-4">⏰</div>
              <h3 className="text-2xl font-semibold mb-2 text-orange-400">{t('problem2Title')}</h3>
              <p className="text-gray-300 mb-2">{t('problem2Time')}</p>
              <p className="text-[22.5px] text-gray-400">{t('problem2Detail')}</p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-yellow-500/30">
              <div className="text-3xl mb-4">🔧</div>
              <h3 className="text-2xl font-semibold mb-2 text-yellow-400">{t('problem3Title')}</h3>
              <p className="text-gray-300 mb-2">{t('problem3Cost')}</p>
              <p className="text-[22.5px] text-gray-400">{t('problem3Detail')}</p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/30">
              <div className="text-3xl mb-4">😰</div>
              <h3 className="text-2xl font-semibold mb-2 text-purple-400">{t('problem4Title')}</h3>
              <p className="text-gray-300 mb-2">{t('problem4Issue')}</p>
              <p className="text-[22.5px] text-gray-400">{t('problem4Detail')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-light mb-6">
              {t('solutionTitle')}{' '}
              <span className="text-green-400">{t('solutionTitleHighlight')}</span>
            </h2>
            <p className="text-2xl text-gray-300 max-w-3xl mx-auto font-light">
              {t('solutionSubtitle')}
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 mb-16">
            <div className="bg-gradient-to-br from-purple-800/30 to-blue-800/30 rounded-2xl p-8 backdrop-blur-sm border border-purple-500/30">
              <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mb-6">
                <span className="text-2xl font-bold">1</span>
              </div>
              <h3 className="text-2xl font-semibold mb-4">{t('step1Title')}</h3>
              <p className="text-gray-300 leading-relaxed font-light">{t('step1Description')}</p>
            </div>

            <div className="bg-gradient-to-br from-blue-800/30 to-green-800/30 rounded-2xl p-8 backdrop-blur-sm border border-blue-500/30">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-6">
                <span className="text-2xl font-bold">2</span>
              </div>
              <h3 className="text-2xl font-semibold mb-4">{t('step2Title')}</h3>
              <p className="text-gray-300 leading-relaxed font-light">{t('step2Description')}</p>
            </div>

            <div className="bg-gradient-to-br from-green-800/30 to-purple-800/30 rounded-2xl p-8 backdrop-blur-sm border border-green-500/30">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mb-6">
                <span className="text-2xl font-bold">3</span>
              </div>
              <h3 className="text-2xl font-semibold mb-4">{t('step3Title')}</h3>
              <p className="text-gray-300 leading-relaxed font-light">{t('step3Description')}</p>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="flex items-center gap-4 bg-white/5 rounded-xl p-4">
              <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0" />
              <span>{t('feature1')}</span>
            </div>
            <div className="flex items-center gap-4 bg-white/5 rounded-xl p-4">
              <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0" />
              <span>{t('feature2')}</span>
            </div>
            <div className="flex items-center gap-4 bg-white/5 rounded-xl p-4">
              <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0" />
              <span>{t('feature3')}</span>
            </div>
            <div className="flex items-center gap-4 bg-white/5 rounded-xl p-4">
              <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0" />
              <span>{t('feature4')}</span>
            </div>
            <div className="flex items-center gap-4 bg-white/5 rounded-xl p-4">
              <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0" />
              <span>{t('feature5')}</span>
            </div>
            <div className="flex items-center gap-4 bg-white/5 rounded-xl p-4">
              <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0" />
              <span>{t('feature6')}</span>
            </div>
          </div>
        </div>
      </section>

      {/* ROI Calculator Section */}
      <section className="bg-gradient-to-r from-green-900/20 to-blue-900/20 py-20">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-light mb-6">
              <Calculator className="w-10 h-10 inline-block mr-4 text-green-400" />
              {t('calculatorTitle')}{' '}
              <span className="text-green-400">{t('calculatorTitleHighlight')}</span>
            </h2>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-green-500/30">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-2xl font-semibold mb-6 text-green-400">
                  {t('calculatorWithout')}
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>{t('calculatorFine')}</span>
                    <span className="font-semibold">€750</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>{t('calculatorTime')}</span>
                    <span className="font-semibold">€720</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>{t('calculatorRepairs')}</span>
                    <span className="font-semibold">€1,200</span>
                  </div>
                  <div className="border-t border-gray-600 pt-4 font-thin">
                    <div className="flex justify-between items-center text-xl text-red-400">
                      <span>{t('calculatorTotal')}</span>
                      <span>€2,670</span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-2xl font-semibold mb-6 text-blue-400">{t('calculatorWith')}</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>{t('calculatorServiceCost')}</span>
                    <span className="font-semibold">€900</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>{t('calculatorFines')}</span>
                    <span className="font-semibold text-green-400">€0</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>{t('calculatorTimeAdmin')}</span>
                    <span className="font-semibold text-green-400">€0</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>{t('calculatorAdditionalRepairs')}</span>
                    <span className="font-semibold text-green-400">€0</span>
                  </div>
                  <div className="border-t border-gray-600 pt-4">
                    <div className="flex justify-between items-center text-xl font-thin text-green-400">
                      <span>{t('calculatorSavings')}</span>
                      <span>€1,770</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center mt-8">
              <div className="text-3xl font-bold text-green-400 mb-2">{t('calculatorROI')}</div>
              <p className="text-gray-300">{t('calculatorROIDesc')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-light mb-6">
              {t('pricingTitle')}{' '}
              <span className="text-purple-400">{t('pricingTitleHighlight')}</span>
            </h2>
            <p className="text-2xl text-gray-300 font-thin">{t('pricingSubtitle')}</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-gray-500/30">
              <h3 className="text-2xl font-semibold mb-2">{t('starterTitle')}</h3>
              <div className="text-4xl font-bold mb-6">
                {t('starterPrice')}
                <span className="text-lg text-gray-400 font-thin">{t('starterPriceUnit')}</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span>{t('starterFeature1')}</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span>{t('starterFeature2')}</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span>{t('starterFeature3')}</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span>{t('starterFeature4')}</span>
                </li>
              </ul>
              <button className="w-full bg-gray-700 hover:bg-gray-600 px-6 py-3 rounded-full transition-colors">
                {t('starterButton')}
              </button>
            </div>

            <div className="bg-gradient-to-br from-purple-600/30 to-pink-600/30 backdrop-blur-sm rounded-3xl p-8 border-2 border-purple-500/50 relative">
              <h3 className="text-2xl font-semibold mb-2">{t('businessTitle')}</h3>
              <div className="text-4xl font-bold mb-6">
                {t('businessPrice')}
                <span className="text-lg text-gray-400 font-thin">{t('businessPriceUnit')}</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span>{t('businessFeature1')}</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span>{t('businessFeature2')}</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span>{t('businessFeature3')}</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span>{t('businessFeature4')}</span>
                </li>
              </ul>
              <button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-6 py-3 rounded-full transition-all transform hover:scale-105">
                {t('businessButton')}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-purple-900/40 to-pink-900/40 py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl lg:text-5xl font-light mb-6">
            {t('ctaTitle')} <span className="text-purple-400">{t('ctaTitleHighlight')}</span>
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto font-thin">
            {t('ctaSubtitle1')}
            <br />
            {t('ctaSubtitle2')}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button className="bg-gradient-to-r from-purple-600 to-pink-600 px-8 py-4 rounded-full text-lg font-thin hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105">
              {t('ctaButton1')}
            </button>
            <button className="border border-purple-500 px-8 py-4 rounded-full text-lg font-thin hover:bg-purple-500/10 transition-colors">
              {t('ctaButton2')}
            </button>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  )
}
