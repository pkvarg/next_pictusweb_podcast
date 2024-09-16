'use client'
import React, { useState } from 'react'

const TradeRules = () => {
  const [openTradeRules, setOpenTradeRules] = useState<boolean>(false)
  return (
    <div
      id='trade-rules'
      className='mx-4 lg:mx-10 text-[20px] lg:text-[22.5px] text-justify flex flex-col gap-4 font-light'
    >
      <h2
        onClick={() => setOpenTradeRules((prev) => !prev)}
        className='text-center text-[30px] lg:text-[35x] cursor-pointer hover:text-[#0388f4]'
      >
        VŠEOBECNÉ OBCHODNÉ PODMIENKY +
      </h2>
      {openTradeRules && (
        <>
          <h3 className='mt-8'>1. VŠEOBECNÉ USTANOVENIA</h3>
          Tieto všeobecné obchodné podmienky (ďalej len „VOP“) upravujú práva a
          povinnosti zmluvných strán vyplývajúce z kúpnej zmluvy uzatvorenej
          medzi Kupujúcim - Spotrebiteľom a Predávajúcim. Predmetom kúpnej
          zmluvy je kúpa a predaj on-line produktov prostredníctvom internetovej
          stránky www.pictusweb.sk , prípadne produktov v elektronickej podobe
          nahratých na elektronickom nosiči dát. Predávajúci: Pictusweb, s.r.o.,
          Nábrežná 42, 940 02 Nové Zámky, Slovensko, spoločnosť zapísaná v
          Obchodnom registri Okresného súdu Nitra, oddiel: Sro, vložka číslo:
          57457/N. Email: info@pictusweb.sk IČO: 54 631 068 DIČ: 2121741424
          Bankové spojenie: Fio banka IBAN: SK68 8330 0000 0022 0221 4313 BIC:
          FIOZSKBAXXX Spoločnosť Pictusweb, s.r.o. je zapísaná v obchodnom
          registri okresného súdu Nitra: Oddiel: Sro Vložka číslo: 57457/N
          Kupujúci – ďalej len spotrebiteľ - je fyzická osoba, ktorá pri
          uzatváraní a plnení tejto kúpnej zmluvy nekoná v rámci predmetu svojho
          podnikania, zamestnania alebo povolania alebo podnikateľ - právnická
          osoba, ktorá pri uzatváraní a plnení spotrebiteľskej zmluvy koná v
          rámci predmetu svojej obchodnej činnosti alebo inej podnikateľskej
          činnosti. Právne vzťahy predávajúceho s kupujúcim, ktorým je
          podnikateľ, výslovne neupravené týmito VOP ani zmluvou medzi
          predávajúcim a kupujúcim sa riadia príslušnými ustanoveniami zák. č
          513/1991 Zb., Obchodného zákonníka v znení neskorších predpisov, ako
          aj súvisiacimi predpismi. V prípade akýchkoľvek rozdielov medzi VOP a
          individuálnou zmluvou, má prednosť text zmluvy. Produkty – predstavujú
          online služby tvorby webstránok a eshopov a poradenstva v oblasti
          vývoja softvéru;
          <h3>2. OBJEDNÁVKA PRODUKTU A UZATVORENIE KÚPNEJ ZMLUVY</h3>
          Spotrebiteľ navrhuje uzavretie zmluvy s predávajúcim odoslaním
          objednávky prostredníctvom web stránky www.pictusweb.sk Podmienkou
          platnosti elektronickej objednávky je vyplnenie všetkých predpísaných
          údajov a náležitostí požadovaných pri vypĺňaní objednávky. Objednávka
          je návrhom kúpnej zmluvy. K uzatvoreniu kúpnej zmluvy dochádza
          prijatím návrhu na uzavretie kúpnej zmluvy Predávajúcim, pričom
          Predávajúci neuskutočňuje formálne potvrdenie objednávky, návrh na
          uzavretie kúpnej zmluvy zo strany Spotrebiteľa prijíma faktickým
          úkonom – t.j. samotným dodaním Produktu na e-mailovú adresu
          Spotrebiteľa. Kupujúci uskutočnením objednávky vyjadruje svoj súhlas
          so všeobecnými obchodnými podmienkami pre dodanie Produktu vyhlásené
          Predávajúcim. Vzťahy Kupujúceho a Predávajúceho sa riadia týmito
          všeobecnými obchodnými podmienkami, ktoré sú pre obe strany záväzné,
          Občianskym zákonníkom (zákon č. 40/1964 Zb. v platnom a účinnom znení)
          a právnymi predpismi Slovenskej republiky, pokiaľ sa zmluvné strany
          nedohodli inak. Spory vzniknuté zo vzťahu medzi Spotrebiteľom a
          Predávajúcim podliehajú jurisdikcii súdov Slovenskej republiky a sú
          rozhodované v súlade s platnou a účinnou právnou úpravou.
          <h3>3. PRODUKTY</h3>
          Jednotlivé produkty vyplývajú z aktuálnej ponuky.
          <h3>4. CENA PRODUKTOV</h3>
          Kupujúci sa za nadobudnutý Produkt zaväzuje zaplatiť kúpnu cenu
          uvedenú pri objednávke u Predávajúceho pri objednávanom Produkte
          platnú v čase objednania Produktov. Všetky ceny sú vrátane DPH.
          Predávajúci si vyhradzuje právo tlačových chýb. Kúpna cena bude
          považovaná za zaplatenú až po pripísaní celej kúpnej ceny za
          samostatnú časť dodávky na bežný účet Predávajúceho. Predávajúci si
          vyhradzuje vlastnícke právo k tovaru až do úplného zaplatenia kúpnej
          ceny. Faktúra vystavená na základe kúpnej zmluvy medzi Predávajúcim a
          Kupujúcim je súčasne daňovým dokladom a je odoslaná Kupujúcemu
          elektronicky. Na vyžiadanie Kupujúceho je možné faktúru zaslať aj
          poštou. Prevzatie tovaru Kupujúcim je možné až po jeho úplnom
          zaplatení, pokiaľ nie je dohodnuté inak. Pod prevzatím produktu sa
          rozumie prevzatie prístupových údajov k produktom prostredníctvom
          e-mailovej komunikácie.
          <h3>
            5. AUTORSKÉ PRÁVA PREDÁVAJÚCEHO A ZMLUVNÁ POKUTA ZA ICH PORUŠENIE
          </h3>
          Produkty, ktoré sú predmetom predaja na tejto stránke, sú výhradným
          duševným vlastníctvom autora Petra Vargu v zmysle Autorského zákona,
          zákona č. 185/2015 Z. z. v platnom a účinnom znení a jedine autor má k
          týmto dielam výhradné osobnostné a majetkové práva v zmysle ust. §§ 19
          a 20 citovaného zákona. Predávajúci ako nadobúdateľ licencie od autora
          predáva diela autora s jeho súhlasom výhradne na osobné účely
          spotrebiteľov. Kupujúci - Spotrebiteľ je oprávnený používať poskytnuté
          Produkty výhradne na vlastné osobné účely, t. j. na účel, ktorý nie je
          priamo a ani nepriamo obchodný. Kupujúci – Spotrebiteľ nie je
          oprávnený Produkty nijakým spôsobom sprístupňovať novej verejnosti,
          t.j. šíriť a ani sprostredkúvať tretím osobám, nie je oprávnený
          produkty spracovať, pozmeniť, rozmnožovať a verejne rozširovať bez
          súhlasu autora. Pre prípad porušenia autorských práv autora akoukoľvek
          formou a spôsobom, je Predávajúci (ako aj samotný autor) oprávnený
          požadovať od Kupujúceho zmluvnú pokutu, ktorá bude vypočítaná ako
          súčin ceny on-line produktov v čase uzavretia zmluvy a osôb, ktorým
          boli on-line produkty Predávajúceho sprístupnené prostredníctvom
          neoprávnenej činnosti Kupujúceho.
          <h3>6. PLATOBNÉ PODMIENKY, DODACIA LEHOTA A DODACIE PODMIENKY</h3>
          Kupujúci uhradí kúpnu cenu za poskytnuté on-line produkty a služby
          vopred prevodom na bankový účet uvedený na webstránke Predávajúceho.
          Platba je uskutočnená na účet predávajúceho vedený vo Fio banke. Pri
          platbe bankovým prevodom vopred na účet začína plynúť dodacia lehota
          dňom pripísania platby na účet Predávajúceho. Dodacia lehota môže byť
          predĺžená primerane k okolnostiam, ak oneskorenie je spôsobené
          okolnosťami nezavinenými predávajúcim. V prípade predĺženie dodacej
          lehoty predávajúci oznámi Kupujúcemu predpokladaný termín dodania a
          zároveň si vyžiada odsúhlasenie kupujúceho.
          <h3>7. ZODPOVEDNOSŤ ZA VADY A ZÁRUČNÉ PODMIENKY</h3>V prípade výskytu
          vady na on-line produktoch Predávajúceho: 1) Ak ide o vadu, ktorú
          možno v závislosti od povahy poskytnutého plnenia odstrániť, má
          Kupujúci právo, aby bola bezplatne, včas a riadne odstránená.
          Predávajúci je povinný vadu bez zbytočného odkladu odstrániť.
          Predávajúci môže vždy namiesto odstránenia vady vymeniť vadné plnenie
          za bezvadné, ak je to reálne možné a ak to Kupujúcemu nespôsobí
          závažné ťažkosti. 2) Ak ide o vadu, ktorú nemožno odstrániť a ktorá
          bráni tomu, aby sa plnenie mohlo riadne užívať, má Kupujúci právo od
          zmluvy odstúpiť. Tie isté práva prislúchajú Kupujúcemu, ak ide síce o
          odstrániteľné vady, ak však Kupujúci nemôže pre opätovné vyskytnutie
          sa vady po oprave alebo pre väčší počet vád plnenie riadne užívať. Ak
          ide o iné neodstrániteľné vady, má Kupujúci právo na primeranú zľavu z
          ceny produktu resp. služby. Na online produkty zakúpené
          prostredníctvom internetovej stránky www.pictusweb.sk platí zákonná
          záručná doba 24 mesiacov. Záručná doba podľa tohto odseku začína
          plynúť od prevzatia plnenia Kupujúcim. Za prevzatie plnenia sa
          považuje poskytnutie prihlasovacích údajov pre kupujúceho po zaplatení
          kúpnej ceny zo strany Kupujúceho. V prípade reklamácie, sťažnosti
          alebo podnetu môže Kupujúci kontaktovať Predávajúceho na e-mailovej
          adrese peter.varga@pictusweb.sk. Ak bude reklamácia odôvodnená a v
          závislosti od povahy vady plnenia, pri neodstrániteľnej vade má
          Kupujúci právo od zmluvy odstúpiť a Predávajúci vráti Kupujúcemu kúpnu
          cenu reklamovaného on-line produktu alebo služby do 48 hodín od
          potvrdenia reklamácie za súčasného okamžitého (t.j. ihneď po doručení
          odstúpenia Predávajúcemu) ukončenia platnosti prístupových údajov
          Spotrebiteľa k zakúpenému online produktu. Pri odstrániteľných vadách
          plnenia Predávajúci poskytne Kupujúcemu možnosť nápravy uvedenej vady
          na základe povahy produktu. V prípade odstúpenia od zmluvy už po
          čiastočnom bezvadnom použití online produktov, bude Kupujúcemu vrátená
          alikvótna časť kúpnej ceny. V konkrétnych prípadoch, ak je to
          vyslovene uvedené u konkrétneho online produktu, bude Kupujúcemu
          vrátená úplná kúpna cena. Takýto prípad je definovaný ako GARANCIA
          VRÁTENIA PEŇAZÍ a je uvedená u daného online produktu konkrétna
          lehota, do kedy je možné uplatniť garanciu vrátenia peňazí.
          <h3>8. ODSTÚPENIE OD ZMLUVY</h3>V prípade zakúpenia online produktov
          fyzickou osobou nie je možné odstúpiť od zmluvy s Predávajúcim a
          žiadať vrátenie kúpnej ceny, nakoľko v zmysle ust. § 7 ods. 6 písm. l)
          zákona č. 102/2014 Z. z. o ochrane spotrebiteľa pri predaji tovaru
          alebo poskytovaní služieb na základe zmluvy uzavretej na diaľku alebo
          zmluvy uzavretej mimo prevádzkových priestorov predávajúceho, nemôže
          spotrebiteľ odstúpiť od zmluvy, predmetom ktorej je poskytovanie
          elektronického obsahu inak ako na hmotnom nosiči, ak sa jeho
          poskytovanie začalo s výslovným súhlasom spotrebiteľa a spotrebiteľ
          vyhlásil, že bol riadne poučený o tom, že vyjadrením tohto súhlasu
          stráca právo na odstúpenie od zmluvy. Vrátenie kúpnej ceny za
          elektronický obsah v prípade zakúpenia online produktov fyzickou
          osobou nie je možné, ak tieto VOP neustanovujú inak. Rovnako nie je
          možné žiadať vrátenie kúpnej ceny Kupujúcim elektronického obsahu v
          prípade nevyužitia elektronického obsahu. V prípade, ak tovar nakupuje
          osoba v súvislosti s jej podnikateľskou činnosťou (o čom rozhoduje
          uvedenie IČO na nákupnom doklade), právo na odstúpenie od kúpnej
          zmluvy nevzniká, nakoľko obchodný zákonník túto možnosť neumožňuje.
          <h3>9. BEZPEČNOSŤ A OCHRANA OSOBNÝCH ÚDAJOV</h3>
          Predávajúci prehlasuje, že všetky osobné údaje sú dôverné a budú
          použité výhradne k uskutočneniu plnenia kúpnej zmluvy medzi
          Predávajúcim a Kupujúcim a na účel súvisiaceho marketingu a nebudú
          inak zverejnené a poskytnuté tretej strane s výnimkou situácie
          súvisiacej s distribúciou, či platobným stykom, ktoré sa týkajú
          objednaného tovaru. Bližšie k ochrane osobných údajov je uvedené v
          samostatnej sekcii prístupnej na webovej stránke Predávajúceho v časti
          Ochrana osobných údajov. Predávajúci použije zverejnenie príbehu
          Kupujúceho a úspechov ním dosiahnutých následkom použitia online
          produktov Predávajúceho, t. j.za účelom tzv. referencie na online
          produkty Predávajúceho výhradne na účely marketingu Predávajúceho a za
          účelom informovania verejnosti a len po predchádzajúcom súhlase
          Kupujúceho. Osobitné kategórie osobných údajov, ktoré odhaľujú rasový
          alebo etnický pôvod, politické názory, náboženskú vieru alebo
          svetonázor, členstvo v politických stranách alebo politických
          hnutiach, členstvo v odborových organizáciách a údaje týkajúce sa
          zdravia nebudú zverejnené s výnimkou tých údajov, ktoré sám Kupujúci
          uvedie vo svojom príbehu zaslanom Predávajúcemu.
          <h3>10. VOĽBA PRÁVOMOCI A ROZHODNÉHO PRÁVA</h3>
          Zmluvné strany sú si vedomé skutočnosti, že všetky prípadné spory
          vzniknuté v súvislosti s predajom Predávajúceho na jeho webe sa budú
          riešiť pred súdmi Slovenskej republiky a podľa všeobecne záväzných
          právnych predpisov Slovenskej republiky.
          <h3>11. ZÁVEREČNÉ USTANOVENIA</h3>
          Tieto obchodné podmienky platia v uvedenom znení na internetovej
          stránke predávajúceho v deň odoslania elektronickej objednávky v
          prípade, že nie je medzi účastníkmi iná písomná dohoda. Dátum
          poslednej aktualizácie: 26.05.2022
        </>
      )}
    </div>
  )
}

export default TradeRules
