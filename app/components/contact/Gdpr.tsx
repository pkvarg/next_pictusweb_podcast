'use client'
import React, { useState } from 'react'

const Gdpr = () => {
  const [openGdpr, setOpenGdpr] = useState<boolean>(false)
  return (
    <div
      id='gdpr'
      className='mx-4 lg:mx-12 lg:py-4 py-6 text-justify flex flex-col gap-4 text-[20px] lg:text-[22.5px]'
    >
      <h1
        onClick={() => setOpenGdpr((prev) => !prev)}
        className='text-center text-[30px] lg:text-[35x] pt-8 pb-8 cursor-pointer hover:text-[#0388f4]'
      >
        GDPR +
      </h1>
      {openGdpr && (
        <>
          <h2 className='text-center'>ZÁSADY SPRACOVÁVANIA OSOBNÝCH ÚDAJOV</h2>
          <p>
            Ochranu osobných údajov berieme vážne. Je pre nás dôležité, aby vaše
            osobné údaje boli v bezpečí. Všetky osobné údaje, ktoré sú získavané
            počas vašej návštevy na našej stránke www.pictusweb.sk sú
            spracovávané v súlade so zákonom o ochrane osobných údajov ako aj v
            súlade s platnou európskou legislatívou. Od 25.05.2018, vrátane, sú
            vaše osobné údaje spracovávané v súlade s NARIADENÍM EURÓPSKEHO
            PARLAMENTU A RADY (EÚ) 2016/679 z 27. apríla 2016 o ochrane
            fyzických osôb pri spracúvaní osobných údajov a o voľnom pohybe
            takýchto údajov, ktorým sa ruší smernica 95/46/ES (všeobecné
            nariadenie o ochrane údajov = GDPR) a v súlade so zákonom č. 18/2018
            Z. z. o ochrane osobných údajov a o zmene a doplnení niektorých
            zákonov v znení platnom a účinnom od 25.05.2018.
          </p>
          <h3>Čo to pre vás a vaše osobné údaje znamená?</h3>
          <p>
            Vaším osobným údajom je akákoľvek informácia, ktorá sa vás týka a na
            základe ktorej ste pre nás ako fyzická osoba určiteľným subjektom.
            Nastáva to v takých prípadoch, keď vás môžeme priamo alebo nepriamo
            identifikovať, najmä na základe všeobecne použiteľného
            identifikátora alebo iného identifikátora, ako je napríklad meno,
            priezvisko, identifikačné číslo, lokalizačné údaje alebo online
            identifikátor, alebo na základe jednej alebo viacerých
            charakteristík či znakov, ktoré tvoria vašu fyzickú identitu,
            fyziologickú identitu, genetickú identitu, psychickú identitu,
            mentálnu identitu, ekonomickú identitu, kultúrnu identitu alebo
            sociálnu identitu. Je to napr. identifikácia vašej osoby na základe
            čísla, kódu alebo jedného či viacerých prvkov špecifických pre vás.
            Medzi osobné údaje teda spadajú najmä kontaktné údaje fyzickej
            osoby, jeho IP adresa, môžu nimi byť informácie o využívaní služieb
            alebo o činnostiach a preferenciách fyzickej osoby.
          </p>
          <h3>Aké údaje teda uchovávame?</h3>
          <p>
            Počas vašej návštevy našich stránok zaznamenávame IP adresu, ktorú
            vám pridelil váš poskytovateľ internetu, z akých stránok ste
            navštívili našu stránku, ako dlho ste na našej stránke, ktoré
            konkrétne podstránky si prezeráte a pod. Tieto informácie sú
            považované za osobný údaj, keďže ide o Váš online identifikátor, a
            preto s týmto údajom nakladáme so zvýšenou starostlivosťou.
          </p>
          <h3>Cookies</h3>
          <p>
            Používame cookies k tomu, aby sme zistili preferencie návštevníkov
            web stránok a vedeli na základe toho prispôsobiť našu ponuku na
            mieru konkrétnemu návštevníkovi. Cookies sa môžu používať k tomu,
            aby sme zistili, či už ste naše stránky z vášho počítača niekedy
            navštívili. Bez cookies by sme nevedeli, čo sa vám páči, a
            nedokázali by sme vo svete internetu flexibilne vyhovieť vašim
            požiadavkám. Cookies sú textové súbory, ktoré uloží váš internetový
            prehliadač na váš disk v počítači. Ak si neprajete cookies ukladať,
            môžete ich deaktivovať vo vašom internetovom prehliadači vzhľadom na
            skutočnosť, že ide tiež o váš osobný údaj. Na základe vašich
            preferencií zistených cez cookies, webové logy a IP adresu si vás
            delíme do záujmových skupín. Právnici to nazývajú profilovanie
            zákazníkov. Pre vás to má tú výhodu, že vám prídu e-maily s obdobným
            obsahom, o ktorý ste už prejavili záujem. V kocke, na základe tohto
            systému vás nezaťažujeme informáciami, ktoré sú mimo okruhu vašich
            záujmov. Proti profilovaniu môžete podať námietku na e-mail:
            info@pictusweb.sk v lehote max. 1 mesiaca od doručenia námietky sa s
            ňou vysporiadame. Garantujeme, že tak urobíme skôr ako pred koncom
            lehoty. Profilovanie a segmentácia do zákazníckych skupín sa
            uskutočňuje hlavne vo vašom záujme, aby ste od nás dostávali
            relevantné informácie.
          </p>
          <h3>Ďalšie osobné údaje</h3>
          <p>
            Vaše osobné údaje zadávate dobrovoľne do iba do kontaktného
            formulára na našej stránke: Uchovávame tieto osobné údaje: e-mailová
            adresa, meno a tel. číslo, ak sa ho rozhodnete uviesť. Vaše osobné
            údaje sú používané na bližšie konkretizované účely v týchto
            zásadách, a to len v nevyhnutnom rozsahu.
          </p>
          <h3>Čo to je spracúvanie osobných údajov?</h3>
          <p>
            Pod právnickým pojmom spracúvanie osobných údajov je potrebné
            rozumieť spracovateľskú operáciu alebo súbor spracovateľských
            operácií s osobnými údajmi, alebo so súbormi osobných údajov, a to
            najmä ich získavanie, zaznamenávanie, usporadúvanie, štruktúrovanie,
            uchovávanie, zmenu, vyhľadávanie, prehliadanie, využívanie,
            poskytovanie prenosom, šírením alebo iným spôsobom, preskupovanie
            alebo kombinovanie, obmedzenie, vymazanie, bez ohľadu na to, či sa
            vykonáva automatizovanými prostriedkami alebo neautomatizovanými
            prostriedkami. Jednoducho povedané, ide o zhromažďovanie osobných
            údajov, ich ukladanie na nosiče informácií, sprístupňovanie, úpravu
            alebo zmenu, vyhľadávanie, používanie, odovzdávanie, šírenie,
            zverejňovanie, uchovávanie, výmenu, triedenie alebo kombinovanie,
            blokovanie a likvidáciu. Je toho skutočne veľa, ale len na základe
            vami poskytnutých údajov vám vieme poskytnúť služby a produkty,
            ktoré vám konkrétne zlepšia život.
          </p>
          <h3>
            Na čo tieto informácie o vás používame (účely)? A na akom právnom
            základe?
          </h3>
          <p>
            Prevádzkovateľom na účely spracovania osobných údajov je spoločnosť
            Pictusweb, s.r.o., Nábrežná 42, 940 02 Nové Zámky, Slovensko,
            spoločnosť zapísaná v Obchodnom registri Okresného súdu Nitra,
            oddiel: Sro, vložka číslo: 57457/N. K zberu osobných údajov dochádza
            na webstránke www.pictusweb.sk meno, priezvisko, email - komunikácia
            so zákazníkom o vybavení objednávky, doručenie objednávky, doručenie
            dodatočných info od dodávateľa = právnym základom pre spracovanie
            týchto osobných údajov je plnenie zmluvy; mobilné číslo - za účelom
            informovania o stave objednávky VIP starostlivosti o platiaceho
            zákazníka = právnym základom je oprávnený záujem prevádzkovateľa
            dodať zákazníkovi čo najvyššiu hodnotu za jeho peniaze; Odporúčania
            na produkty na webstránkach: Vaše odporúčanie (referenciu) na naše
            produkty uverejňujeme len na základe vášho výslovného súhlasu s
            takýmto použitím, ktorý nám udeľujete v odpovedi na samostatný
            e-mail, v ktorom vás o povolenie žiadame. Vašu fotografiu
            zverejňujeme len s vaším súhlasom a kedykoľvek, ak svoj súhlas
            odvoláte, vašu fotografiu aj odporúčanie zo stránky stiahneme a vaše
            údaje zlikvidujeme. Zároveň vyhlasujeme, že citlivé údaje o vašej
            sexuálnej orientácii, zdravotnom stave, príslušnosti k rase či
            etniku nezverejníme bez vášho výslovného súhlasu.
          </p>
          <h3>Doba uchovávania údajov</h3>
          <p>
            Osobné údaje sa u prevádzkovateľa uchovávajú na uvedené účely po
            dobu 10 rokov, ak osobitné právne predpisy (daňové, pracovnoprávne,
            archivácia, účtovnícke predpisy) neustanovujú inak alebo pokým svoj
            súhlas neodvoláte (za podmienky, že nie sme osobitným predpisom
            viazaní váš údaj ďalej archivovať). V časovom období od poskytnutia
            súhlasu do jeho odvolania je spracovanie vašich osobných údajov
            zákonné, aj keď ste svoj súhlas po jeho poskytnutí odvolali.
          </p>
          <h3>Bezpečnosť</h3>
          <p>
            Ak by náhodou boli naše systémy napadnuté hackerským útokom, či inak
            by bol náš systém napadnutý a vznikla by čo i len hrozba úniku dát,
            budete do 72 hodín informovaní našou podporou o prijatých
            opatreniach a zároveň v tej istej lehote budeme komunikovať aj s
            dozorným orgánom v oblasti ochrany osobných údajov v SR - s Úradom
            na ochranu osobných údajov.
          </p>
          <h3>Vaše práva</h3>
          <p>
            Ako dotknutá osoba, t. j. osoba, ktorej osobné údaje sa spracovávajú
            – máte právo byť informovaný o údajoch prevádzkovateľa – t.j. osoby,
            ktorá vaše údaje spracováva. Prevádzkovateľom na účely spracovania
            osobných údajov je spoločnosť Pictusweb, s.r.o., Nábrežná 42, 940 02
            Nové Zámky, Slovensko, spoločnosť zapísaná v Obchodnom registri
            Okresného súdu Nitra, oddiel: Sro, vložka číslo: 57457/N.
          </p>
          <h3>Kontaktné osoby:</h3>
          <p>
            Peter Varga; e-mail: peter.varga@pictusweb.sk Máte právo na prístup
            k údajom, ktoré o vás spracúvame. Ak chcete vedieť, ktoré konkrétne
            údaje uchovávame k vašej osobe, radi vám ich na požiadanie
            poskytneme písomne. Ako dotknutá osoba máte právo na opravu
            poskytnutých údajov, resp. ich doplnenie v prípade výskytu
            akýchkoľvek nesprávností/neúplností. Po dosiahnutí účelu poskytnutia
            osobných údajov – t.j. po poskytnutí plnenia zo spotrebiteľskej
            zmluvy a ukončení čerpania produktov cez prístupové heslá, máte
            „právo na zabudnutie“ = právo na vymazanie poskytnutých údajov.
            Právo na vymazanie poskytnutých osobných údajov sa uplatní aj v
            prípade, ak odvoláte svoj súhlas so spracúvaním vašich osobných
            údajov. V prípadoch, keď vaše osobné údaje spracovávame na základe
            vášho súhlasu, máte právo tento súhlas kedykoľvek odvolať. Odvolanie
            súhlasu je rovnako jednoduché ako jeho udelenie: buď kliknete na
            tlačidlo odhlásiť v e-mailovej kampani, alebo nám napíšete na
            kontaktný e-mail: info@pictusweb.sk. V prípadoch, kde je spracúvanie
            osobných údajov založené na našom oprávnenom záujme, máte právo
            namietať náš oprávnený záujem. Ak vašu námietku vybavíme ako
            dôvodnú, vaše údaje spracovávané na uvedenom základe vymažeme z
            našich systémov. Rovnako ich vymažeme, ak sa preukáže, že údaje boli
            spracovávané nezákonne. Právo na vymazanie vašich osobných údajov
            však nie je absolútne. Ak vaše údaje potrebujeme na plnenie našich
            zákonných povinností, ktoré nám ukladajú daňové zákony, účtovnícke
            predpisy a ďalšie osobitné právne predpisy; na tento účel plnenia
            našich zákonných povinností ich budeme musieť ďalej spracovávať. Ako
            dotknutá osoba máte právo požadovať obmedzenie spracúvania vašich
            osobných údajov, a to v prípade ak napadnete správnosť osobných
            údajov, a to počas obdobia preverovania správnosti údajov; alebo ak
            je spracúvanie osobných údajov nezákonné a na miesto vymazania
            údajov budete požadovať obmedzenie ich spracúvania; a tiež ak
            prevádzkovateľ nepotrebuje vaše osobné údaje na účel, ktorý uviedol,
            ale potrebujete ich práve vy na preukázanie, príp. obhajovanie
            vašich právnych nárokov (reklamácie, súdne spory - inak by došlo k
            výmazu údajov a nemohli by sme vám ich poskytnúť). Pri obmedzení
            spracúvania osobných údajov vaše údaje zostanú v našich systémoch,
            ale my ich už nebudeme používať na naše účely. Prevádzkovateľ vám na
            vašu žiadosť oznámi zmenu, opravu, resp. vymazanie vašich osobných
            údajov. Zároveň máte právo požadovať aj prenos osobných údajov k
            druhému prevádzkovateľovi, ktorého údaje nám písomne oznámite.
            Technicky zrealizovateľný je prenos e-mailovej adresy, ostatné údaje
            vzhľadom na rozdielnosť účelov ich spracovávania (viď vyššie) vám z
            technických dôvodov nedokážeme poskytnúť vo forme strojovo
            čitateľnej a prenosnej k inému prevádzkovateľovi. Všetky vaše
            žiadosti pri uplatňovaní vašich vyššie uvedených práv, námietku
            proti oprávnenému záujmu prevádzkovateľa či súhlas so spracúvaním
            osobných údajov, vybavíme do 48 hodín od doručenia; v prípade
            komplikovanej žiadosti najneskôr do 1 mesiaca od doručenia žiadosti.
            Prevádzkovateľ vyhlasuje, že nedochádza k prenosu osobných údajov do
            tretích krajín, a vaše údaje sú uložené na serveroch lokalizovaných
            v EÚ. Ak by náhodou došlo k prenosu do tretích krajín, je to
            spôsobené technickými operáciami našich sprostredkovateľov, ktorí sú
            veľkými hráčmi na trhu, a preto v sprostredkovateľských zmluvách,
            ktoré máme s nimi uzavreté, sú bezpečnosť vašich údajov, ako aj
            prenos údajov mimo EÚ do maximálne možnej miery ošetrené. Dozorným
            orgánom nad spracúvaním osobných údajov je Úrad na ochranu osobných
            údajov Slovenskej republiky. V prípade, ak na Vašu žiadosť nebudeme
            reagovať do 1 mesiaca od jej doručenia, máte právo obrátiť sa na
            Úrad na ochranu osobných údajov podľa ust. § 100 zákona č. 18/2018
            Z. z. v platnom a účinnom znení (konanie o ochrane osobných údajov).
          </p>
          <h3>
            Sprostredkovatelia (príjemcovia údajov) - alebo kto má ešte k vašim
            údajom prístup?
          </h3>
          <p>
            Hosting nám poskytuje
            <a href='https://www.hostinger.com'> hostinger.com</a>
          </p>
          <h3>Odkazy tretích strán</h3>
          <p>
            Niekedy na našich stránkach odkazujeme na služby a produkty tretích
            strán. Webstránky týchto tretích strán majú vlastné podmienky
            ochrany osobných údajov a sú nezávislé na našich. Z toho dôvodu
            nenesieme žiadnu právnu zodpovednosť za obsah a aktivity týchto
            tretích strán. I napriek tomu je našou snahou udržať vysokú úroveň
            bezpečnosti. Preto, ak máte akékoľvek podozrenie na nekalé chovanie
            týchto tretích strán, kontaktujte nás na info@pictusweb.sk.
            Ďakujeme.
          </p>
          <h3>Neposkytujeme Vaše údaje tretím stranám</h3>
          <p>
            Nepredávame, neobchodujeme ani žiadnym iným spôsobom neposkytujeme
            vaše osobné údaje tretím stranám. Podľa nás to nie je fér a zároveň
            vaše osobné údaje sú to najcitlivejšie, čo nám môžete poskytnúť.
            Odovzdanie vašich osobných údajov štátnym organizáciám je len na
            základe zákona alebo právoplatných úradných či súdnych rozhodnutí v
            súlade s právnymi predpismi Slovenskej republiky. Zmeny v
            podmienkach o ochrane osobných údajov Ak sa rozhodneme zmeniť
            podmienky o ochrane osobných údajov, uverejníme ich na tejto stránke
            a informujeme vás e-mailom. Tieto podmienky sú platné od 26.5.2022.
          </p>
        </>
      )}
    </div>
  )
}

export default Gdpr
