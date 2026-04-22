"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "./lib/supabase";

type Language = "de" | "hu";

type ServiceCard = {
  key: string;
  title: string;
  description: string;
  durations: string[];
  image: string;
};

type MethodCard = {
  key: string;
  title: string;
  text: string;
  image: string;
};

type InfoSection = {
  heading: string;
  paragraphs?: string[];
  bullets?: string[];
};

type InfoEntry = {
  title: string;
  sections: InfoSection[];
};

export default function ChristinaMassageWebsite() {
  const [language, setLanguage] = useState<Language>("de");
  const [showHiemtInfo, setShowHiemtInfo] = useState(false);
  const [activeInfo, setActiveInfo] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const servicesSliderRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const loadSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      setIsLoggedIn(!!session?.user);
    };

    loadSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session?.user);
    });

    return () => subscription.unsubscribe();
  }, []);

  const scrollSlider = (
    ref: React.MutableRefObject<HTMLDivElement | null>,
    direction: "left" | "right"
  ) => {
    if (!ref.current) return;
    const amount = ref.current.clientWidth * 0.9;
    ref.current.scrollBy({
      left: direction === "right" ? amount : -amount,
      behavior: "smooth",
    });
  };

  const content = useMemo(() => {
    const de = {
      brand: {
        city: "Hohenpeißenberg",
        whatsappLink:
          "https://wa.me/491722664648?text=Hallo%20ich%20möchte%20einen%20Termin%20vereinbaren",
        hiemtWhatsappLink:
          "https://wa.me/491722664648?text=Hallo%20Christina,%20ich%20interessiere%20mich%20für%20eine%20individuelle%20Beratung%20zur%20HIEMT-Behandlung.",
      },
      nav: {
        about: "Über mich",
        services: "Massagen",
        special: "HIEMT",
        methods: "Ergänzende Leistungen",
        location: "Anfahrt",
        booking: "Termin buchen",
        login: "Login / Registrierung",
        account: "Benutzerkonto",
      },
      hero: {
        title: "Entspannung für Körper und Seele",
        subtitle:
          "Individuelle Behandlungen, ganzheitliche Begleitung und eine ruhige Atmosphäre für dein persönliches Wohlbefinden.",
        primary: "Termin buchen",
        secondary: "Anrufen oder WhatsApp",
      },
      about: {
        eyebrow: "Über mich",
        title: "Fachkompetenz und Sicherheit – Für Ihr Gleichgewicht",
        text: [
          "Die Harmonie von Bewegung und Körper ist nicht nur mein Beruf, sondern meine Lebensphilosophie. Die Liebe zu Sport und Bewegung prägt mein Leben seit meiner Kindheit. Meine berufliche Laufbahn begann ich 2007 als Trainerin, und seither bin ich fasziniert von der erstaunlichen Widerstandsfähigkeit des menschlichen Körpers.",
          "Seit über 10 Jahren helfe ich meinen Gästen, dem Alltagsstress zu entfliehen. Bei jeder Behandlung stelle ich die individuellen Bedürfnisse in den Vordergrund, um ein persönliches Massageerlebnis zu schaffen. Ob Muskelentspannung, Stressabbau, Regeneration oder Erholung – ich passe jede Behandlung individuell an.",
          "Ich glaube, dass Massage mehr ist als nur eine körperliche Behandlung. Sie ist eine wertvolle Auszeit – ein Moment der Ruhe, in dem der Alltag von uns abfällt und wir inneren Frieden und Balance finden.",
        ],
        qualificationsTitle:
          "Mein beruflicher Werdegang und meine Qualifikationen",
        qualificationsText: [
          "Ich begann meine Karriere 2007 als Aerobic-Trainerin und erwarb dabei fundierte anatomische Kenntnisse. Meine Leidenschaft für Bewegung führte mich schnell zu Pilates, und 2016 wurde die Massage-Therapie zu meinem Beruf.",
          "Im Laufe meiner beruflichen Laufbahn habe ich unter anderem die schwedische Massage, Wellness-Massagen, die chinesische (Tui-Na) und die indische (Champi) Kopfmassage sowie Spezialtechniken wie Schröpftherapie, Flossing, Narbenbehandlung, Lymphdrainage und Vagus-Therapie erlernt.",
          "Der Ansatz des Faszien-Distorsionsmodells (FDM) ist zentral für meine Arbeit und trägt effektiv zur Linderung von Bindegewebsverspannungen bei. Ich betrachte den Menschen als Ganzes.",
        ],
      },
      services: {
        eyebrow: "Massagen",
        title: "Massagen individuell auf dich abgestimmt",
        text:
          "Mit den Pfeilen kannst du durch die Behandlungen klicken. Auf dem Handy kannst du einfach wischen.",
        button: "Termin buchen",
        info: "Info",
        items: [
          {
            key: "swedish",
            title: "Schwedische Massage",
            description:
              "Klassische Ganz- oder Teilkörpermassage zur Entspannung, Lockerung der Muskulatur und Förderung des allgemeinen Wohlbefindens.",
            durations: ["60 Min · 60 €", "90 Min · 90 €", "120 Min · 120 €"],
            image: "/swedish.png",
          },
          {
            key: "backNeck",
            title: "Rücken- & Nackenmassage",
            description:
              "Gezielte Behandlung für Schulter-, Nacken- und Rückenbereich bei Verspannungen, Fehlhaltungen und stressbedingten Beschwerden.",
            durations: ["45 Min · 45 €", "60 Min · 60 €", "75 Min · 75 €"],
            image: "/back-neck.png",
          },
          {
            key: "individual",
            title: "Individuelle Massage",
            description:
              "Eine persönliche und flexible Behandlung, die exakt auf deine Beschwerden, Wünsche und körperlichen Bedürfnisse abgestimmt wird. Je nach Befund können auch FDM, Schröpfen oder Flossing ergänzend in die Behandlung integriert werden.",
            durations: ["60 Min · 60 €", "90 Min · 90 €", "120 Min · 120 €"],
            image: "/individual.png",
          },
          {
            key: "foot",
            title: "Fußmassage",
            description:
              "Wohltuende Behandlung zur Entlastung, Entspannung und Aktivierung stark beanspruchter Füße und Beine.",
            durations: ["45 Min · 45 €", "60 Min · 60 €"],
            image: "/foot.png",
          },
          {
            key: "lymph",
            title: "Lymphdrainage",
            description:
              "Besonders sanfte und rhythmische Behandlung zur Förderung des Lymphflusses und zur Reduktion von Schwellungen.",
            durations: ["60 Min · 60 €", "90 Min · 90 €"],
            image: "/lymph.png",
          },
          {
            key: "vagus",
            title: "Vagus / Stressabbau",
            description:
              "Sanfte und tief entspannende Behandlung zur Beruhigung des Nervensystems und zur Unterstützung innerer Balance.",
            durations: ["45 Min · 45 €", "60 Min · 60 €"],
            image: "/vagus.png",
          },
          {
            key: "champi",
            title: "Champi – Indische Kopfmassage",
            description:
              "Traditionelle ayurvedische Kopfmassage für tiefe Entspannung, mentale Ruhe und neue Energie.",
            durations: ["45 Min · 45 €"],
            image: "/champi.png",
          },
        ] as ServiceCard[],
      },
      methods: {
        eyebrow: "Ergänzende Leistungen",
        title: "Therapeutische und ergänzende Behandlungen",
        text:
          "Diese Leistungen kannst du dir im Detail über den Info-Button ansehen. FDM, Flossing und Schröpfen werden je nach individuellem Bedarf in die Behandlung integriert.",
        info: "Info",
        items: [
          {
            key: "fdm",
            title: "FDM",
            text:
              "Innovatives Behandlungskonzept zur Therapie von Schmerzen und Bewegungseinschränkungen des Bewegungsapparates.",
            image: "/fdm.png",
          },
          {
            key: "flossing",
            title: "Flossing",
            text:
              "Komplexe physiotherapeutische Behandlung für Bindegewebe, Muskeln und Gelenke.",
            image: "/flossing.png",
          },
          {
            key: "schroepfen",
            title: "Schröpfen",
            text:
              "Traditionelle Vakuumtherapie zur Förderung der Durchblutung, Lockerung des Gewebes und Entspannung der Muskulatur.",
            image: "/cupping.png",
          },
          {
            key: "scarTreatment",
            title: "Narbenbehandlung",
            text:
              "Gezielte Behandlung zur Verbesserung von Beweglichkeit, Gewebequalität und Funktion von Narben und verklebtem Gewebe.",
            image: "/Narbenbehandlung.png",
          },
        ] as MethodCard[],
      },
      special: {
        eyebrow: "Sonderleistung",
        title: "HIEMT Beckenboden-Training",
        text:
          "Eine besondere Zusatzleistung zur gezielten Unterstützung des Beckenbodens – diskret, modern und bequem in den Alltag integrierbar.",
        bullets: [
          "30 Minuten pro Sitzung",
          "Anwendung nur in Kleidung",
          "Nicht-invasive Behandlung",
          "Gezielte Aktivierung und Stärkung des Beckenbodens",
        ],
        trialLabel: "Probesitzung",
        trialPrice: "30 €",
        packLabel: "10er Karte",
        packPrice: "280 €",
        note:
          "Ideal für alle, die ihren Beckenboden gezielt stärken und ihr Körpergefühl nachhaltig verbessern möchten.",
        whatsappText:
          "Eine individuelle Beratung ist nur per WhatsApp möglich.",
        whatsappButton: "Beratung per WhatsApp",
        infoButton: "Mehr Informationen",
        pdfDe: "PDF Download DE",
        pdfHu: "PDF Download HU",
      },
      booking: {
        eyebrow: "Online Buchung",
        title: "Termin bequem online anfragen",
        text:
          "Wähle deine Behandlung, die passende Dauer und deinen Wunschtermin. Vor der Buchung ist eine Registrierung erforderlich.",
        button: "Zum Kalender",
        note: "Login oder Registrierung verpflichtend",
      },
      testimonials: {
        eyebrow: "Bewertungen",
        title: "Was Kundinnen und Kunden sagen",
        subtitle:
          "Rückmeldungen zu Massagen und HIEMT-Behandlungen.",
        massageTitle: "Massage",
        hiemtTitle: "HIEMT",
        items: {
          massage: [
            {
              name: "Kundin",
              text: "Ich habe mich von Anfang an sehr wohlgefühlt. Die Massage war genau auf meine Beschwerden abgestimmt und ich bin deutlich entspannter nach Hause gegangen.",
            },
            {
              name: "Kundin",
              text: "Sehr ruhige Atmosphäre, professionelle Behandlung und spürbare Erleichterung im Nacken- und Rückenbereich. Ich komme sehr gerne wieder.",
            },
            {
              name: "Kundin",
              text: "Man merkt sofort die Erfahrung und das Einfühlungsvermögen. Die individuelle Massage hat mir wirklich sehr geholfen.",
            },
          ],
          hiemt: [
            {
              name: "Kundin",
              text: "Die HIEMT-Behandlung war angenehm, diskret und leicht in meinen Alltag integrierbar. Ich habe mich sehr gut beraten gefühlt.",
            },
            {
              name: "Kundin",
              text: "Schon nach den ersten Sitzungen hatte ich ein besseres Körpergefühl. Die Behandlung war unkompliziert und professionell begleitet.",
            },
          ],
        },
      },
      location: {
        eyebrow: "Anfahrt",
        title: "So findest du mich",
        intro:
          "Ich freue mich darauf, Sie in meinem Studio begrüßen zu dürfen, wo Ihre Entspannung im Mittelpunkt steht.",
        seoText:
          "Christina Massage befindet sich in Hohenpeißenberg und ist auch im Umkreis sehr gut erreichbar.",
        addressLabel: "Adresse:",
        entranceLabel: "Eingang:",
        parkingLabel: "Parken:",
        arrivalLabel: "Ankunft:",
        entranceText:
          "Der Eingang zum Studio befindet sich in der Wettersteinstraße, durch das Gartentor.",
        parkingText:
          "Direkt vor dem Tor stehen Ihnen zwei kostenlose Parkplätze zur Verfügung. Sollten diese belegt sein, finden Sie in den umliegenden Straßen problemlos weitere kostenfreie Parkmöglichkeiten.",
        arrivalText:
          "Bitte kommen Sie nach Ihrer Ankunft in den Warteraum und nehmen Sie dort Platz – ich bin gleich für Sie da.",
      },
      footer: {
        text: "© 2026 Christina Massage",
        imprint: "Impressum",
        privacy: "Datenschutz",
      },
      close: "Schließen",
    };

    const hu = {
      brand: {
        city: "Hohenpeißenberg",
        whatsappLink:
          "https://wa.me/491722664648?text=Szia%2C%20időpontot%20szeretnék%20foglalni",
        hiemtWhatsappLink:
          "https://wa.me/491722664648?text=Szia%2C%20érdeklődni%20szeretnék%20a%20HIEMT%20kezelésről.",
      },
      nav: {
        about: "Rólam",
        services: "Masszázsok",
        special: "HIEMT",
        methods: "Kiegészítő kezelések",
        location: "Megközelítés",
        booking: "Időpontfoglalás",
        login: "Bejelentkezés / Regisztráció",
        account: "Felhasználói fiók",
      },
      hero: {
        title: "Harmónia testnek és léleknek",
        subtitle:
          "Egyéni kezelések, Holisztikus szemlélet és nyugodt környezet a személyes jóllétedért.",
        primary: "Időpontfoglalás",
        secondary: "Hívás vagy WhatsApp",
      },
      about: {
        eyebrow: "Rólam",
        title: "Szakértelem és biztonság – Az Ön egyensúlyáért",
        text: [
          "A mozgás és a test harmóniája nemcsak a hivatásom, hanem az életszemléletem is. A sport és a mozgás szeretete gyermekkorom óta végigkíséri az életemet.",
          "Több mint 10 éve segítek vendégeimnek kiszakadni a mindennapi stresszből. Minden kezelés során az egyéni igények állnak a középpontban.",
          "Hiszem, hogy a masszázs több mint testi kezelés. Ez egy értékes énidő – a nyugalom pillanata.",
        ],
        qualificationsTitle: "Szakmai pályafutásom és képesítéseim",
        qualificationsText: [
          "Pályafutásomat 2007-ben aerobik edzőként kezdtem, ahol alapos anatómiai ismeretekre tettem szert.",
          "Szakmai pályafutásom során többek között elsajátítottam a svédmasszázst, wellness masszázsokat, a kínai és indiai fejmasszázst, valamint speciális technikákat is.",
          "Az FDM megközelítés központi szerepet játszik a munkámban, és az embert egészként szemlélem.",
        ],
      },
      services: {
        eyebrow: "Masszázsok",
        title: "Masszázsok személyre szabva",
        text:
          "A nyilakkal válthatsz a kezelések között, telefonon pedig egyszerűen lapozhatsz.",
        button: "Időpontfoglalás",
        info: "Információ",
        items: [
          {
            key: "swedish",
            title: "Svédmasszázs",
            description:
              "Klasszikus teljes vagy résztest masszázs relaxációra, izomlazításra és az általános jó közérzet támogatására.",
            durations: ["60 perc · 60 €", "90 perc · 90 €", "120 perc · 120 €"],
            image: "/swedish.png",
          },
          {
            key: "backNeck",
            title: "Hát- és nyakmasszázs",
            description:
              "Célzott kezelés a váll, a nyak és a hát területére feszültség, helytelen tartás és stressz okozta panaszok esetén.",
            durations: ["45 perc · 45 €", "60 perc · 60 €", "75 perc · 75 €"],
            image: "/back-neck.png",
          },
          {
            key: "individual",
            title: "Egyéni masszázs",
            description:
              "Személyre szabott és rugalmas kezelés, amely pontosan az egyéni panaszokhoz és igényekhez igazodik. Szükség esetén FDM, köpölyözés vagy flossing is beépíthető a kezelésbe.",
            durations: ["60 perc · 60 €", "90 perc · 90 €", "120 perc · 120 €"],
            image: "/individual.png",
          },
          {
            key: "foot",
            title: "Talpmasszázs",
            description:
              "Kellemes kezelés a lábak és a lábfejek tehermentesítésére, ellazítására és aktiválására.",
            durations: ["45 perc · 45 €", "60 perc · 60 €"],
            image: "/foot.png",
          },
          {
            key: "lymph",
            title: "Nyirokelvezetés",
            description:
              "Különösen gyengéd és ritmikus kezelés a nyirokkeringés támogatására és a duzzanatok csökkentésére.",
            durations: ["60 perc · 60 €", "90 perc · 90 €"],
            image: "/lymph.png",
          },
          {
            key: "vagus",
            title: "Vagus / stresszoldás",
            description:
              "Gyengéd és mélyen ellazító kezelés az idegrendszer nyugtatására és a belső egyensúly támogatására.",
            durations: ["45 perc · 45 €", "60 perc · 60 €"],
            image: "/vagus.png",
          },
          {
            key: "champi",
            title: "Champi – indiai fejmasszázs",
            description:
              "Hagyományos ájurvédikus fejmasszázs a mély relaxációért, mentális nyugalomért és új energiáért.",
            durations: ["45 perc · 45 €"],
            image: "/champi.png",
          },
        ] as ServiceCard[],
      },
      methods: {
        eyebrow: "Kiegészítő kezelések",
        title: "Terápiás és kiegészítő kezelések",
        text:
          "Ezeket a kezeléseket részletesen is meg tudod nézni az információ gombbal. Az FDM, flossing és köpölyözés szükség szerint az egyéni kezelés része lehet.",
        info: "Információ",
        items: [
          {
            key: "fdm",
            title: "FDM",
            text:
              "Innovatív kezelési koncepció a mozgásszervi fájdalmak és mozgáskorlátozottság kezelésére.",
            image: "/fdm.png",
          },
          {
            key: "flossing",
            title: "Flossing",
            text:
              "Komplex fizioterápiás kezelés a kötőszövet, az izmok és az ízületek számára.",
            image: "/flossing.png",
          },
          {
            key: "schroepfen",
            title: "Köpölyözés",
            text:
              "Hagyományos vákuumterápia a keringés javítására, izomlazításra és letapadások oldására.",
            image: "/cupping.png",
          },
          {
            key: "scarTreatment",
            title: "Hegkezelés",
            text:
              "Célzott kezelés a hegek mozgathatóságának, szöveti minőségének és funkciójának javítására.",
            image: "/Narbenbehandlung.png",
          },
        ] as MethodCard[],
      },
      special: {
        eyebrow: "Különleges kezelés",
        title: "HIEMT medencefenék-tréning",
        text:
          "Különleges kiegészítő kezelés a medencefenék célzott támogatására – diszkréten, korszerűen és kényelmesen.",
        bullets: [
          "30 perc egy alkalom",
          "Alkalmazás csak ruhában",
          "Nem invazív kezelés",
          "A medencefenék célzott aktiválása és erősítése",
        ],
        trialLabel: "Próbaalkalom",
        trialPrice: "30 €",
        packLabel: "10 alkalmas bérlet",
        packPrice: "280 €",
        note:
          "Ideális mindazoknak, akik célzottan szeretnék erősíteni a medencefeneküket és javítani testérzetüket.",
        whatsappText: "Egyéni tanácsadás kizárólag WhatsAppon lehetséges.",
        whatsappButton: "Tanácsadás WhatsAppon",
        infoButton: "További információ",
        pdfDe: "PDF letöltés DE",
        pdfHu: "PDF letöltés HU",
      },
      booking: {
        eyebrow: "Online foglalás",
        title: "Kényelmes online időpontkérés",
        text:
          "Válaszd ki a kezelést, az időtartamot és a kívánt időpontot. A foglaláshoz regisztráció szükséges.",
        button: "Naptár megnyitása",
        note: "Bejelentkezés vagy regisztráció kötelező",
      },
      testimonials: {
        eyebrow: "Vélemények",
        title: "Vendégvélemények",
        subtitle:
          "Visszajelzések a masszázsokról és a HIEMT kezelésekről.",
        massageTitle: "Masszázs",
        hiemtTitle: "HIEMT",
        items: {
          massage: [
            {
              name: "Vendég",
              text: "Már az első pillanattól nagyon jól éreztem magam. A masszázs teljesen az igényeimhez igazodott, és sokkal ellazultabban mentem haza.",
            },
            {
              name: "Vendég",
              text: "Nyugodt légkör, profi kezelés és érezhető javulás a nyak- és hátterületen. Biztosan visszatérek.",
            },
            {
              name: "Vendég",
              text: "Azonnal érezhető a tapasztalat és a figyelmesség. Az egyéni masszázs valóban nagyon sokat segített nekem.",
            },
          ],
          hiemt: [
            {
              name: "Vendég",
              text: "A HIEMT kezelés kellemes, diszkrét és könnyen beilleszthető volt a mindennapokba. Nagyon jó tanácsadást kaptam.",
            },
            {
              name: "Vendég",
              text: "Már néhány alkalom után jobb lett a testérzetem. A kezelés egyszerű volt és végig profi kíséretet kaptam.",
            },
          ],
        },
      },
      location: {
        eyebrow: "Megközelítés",
        title: "Így találsz meg",
        intro:
          "Szeretettel várom Önt stúdiómban, ahol a pihenés és a feltöltődés áll a középpontban.",
        seoText:
          "A Christina Massage Hohenpeißenbergben található, és a környező településekről is könnyen megközelíthető.",
        addressLabel: "Cím:",
        entranceLabel: "Bejárat:",
        parkingLabel: "Parkolás:",
        arrivalLabel: "Érkezés:",
        entranceText:
          "A stúdió bejárata a Wettersteinstraße felől, a kerti kapun keresztül érhető el.",
        parkingText:
          "Közvetlenül a kapu előtt két ingyenes parkolóhely áll rendelkezésre. Amennyiben ezek foglaltak, a környező utcákban további ingyenes parkolási lehetőségek találhatók.",
        arrivalText:
          "Kérjük, érkezés után fáradjon be a váróhelyiségbe, és foglaljon helyet – hamarosan Önhöz megyek.",
      },
      footer: {
        text: "© 2026 Christina Massage",
        imprint: "Impresszum",
        privacy: "Adatvédelem",
      },
      close: "Bezárás",
    };

    return language === "de" ? de : hu;
  }, [language]);

  const c = content;

  const accountHref = isLoggedIn ? "/my-bookings" : "/booking?auth=1&mode=login";
  const accountLabel = isLoggedIn ? c.nav.account : c.nav.login;

  const hiemtInfo = useMemo<{ de: InfoEntry; hu: InfoEntry }>(
    () => ({
      de: {
        title: "HIEMT Beckenboden-Training",
        sections: [
          {
            heading:
              "Revolutionäre Lösung für die Gesundheit des Beckenbodens",
            paragraphs: [
              "Die Gesundheit der Beckenbodenmuskulatur ist für die Funktion unserer Beckenorgane von zentraler Bedeutung. Eine Schwächung dieser Muskulatur kann nicht nur unangenehm sein, sondern die Lebensqualität erheblich beeinträchtigen.",
              "Unser modernes HIEMT-System bietet eine komfortable, effektive und nicht-invasive Lösung für Frauen und Männer. Die Behandlung erfolgt bequem in Alltagskleidung, ohne Entkleiden und ohne direkten Körperkontakt.",
            ],
          },
          {
            heading: "Warum elektromagnetische Behandlung?",
            bullets: [
              "Sicher, schmerzfrei und nicht invasiv",
              "Für Frauen und Männer geeignet",
              "Hocheffiziente Aktivierung der Beckenbodenmuskulatur",
              "Diskret in normaler Kleidung",
              "Nur 30 Minuten pro Sitzung",
              "Keine Ausfallzeit",
            ],
          },
        ],
      },
      hu: {
        title: "HIEMT medencefenék-tréning",
        sections: [
          {
            heading: "Forradalmi megoldás a medencefenék egészségéért",
            paragraphs: [
              "A medencefenék izomzatának egészsége kulcsfontosságú a kismedencei szervek megfelelő működéséhez. Az izmok gyengülése az életminőséget is jelentősen befolyásolhatja.",
              "A modern HIEMT rendszer kényelmes, hatékony és nem invazív megoldást kínál nőknek és férfiaknak egyaránt. A kezelés utcai ruhában történik, fizikai kontaktus nélkül.",
            ],
          },
          {
            heading: "Miért válassza az elektromágneses kezelést?",
            bullets: [
              "Biztonságos, fájdalommentes és nem invazív",
              "Nők és férfiak számára is alkalmas",
              "Hatékony medencefenék-aktiválás",
              "Diszkrét, ruhában végezhető",
              "Csak 30 perc egy alkalom",
              "Nincs felépülési idő",
            ],
          },
        ],
      },
    }),
    []
  );

  const infoContent = useMemo<Record<string, { de: InfoEntry; hu: InfoEntry }>>(
    () => ({
      swedish: {
        de: {
          title: "Schwedische Massage",
          sections: [
            {
              heading: "Allgemeine Beschreibung",
              paragraphs: [
                "Die schwedische Massage ist eine der bekanntesten und am weitesten verbreiteten Massageformen. Sie bildet die Grundlage vieler moderner Massagetechniken und dient in erster Linie der Entspannung, der Lockerung der Muskulatur sowie der Förderung des allgemeinen Wohlbefindens.",
                "Durch die Kombination aus sanften und kräftigeren Grifftechniken wird der gesamte Körper harmonisiert und revitalisiert. Diese Massage eignet sich besonders für Menschen, die unter Stress und Verspannungen leiden, sowie für alle, die eine erholsame Auszeit genießen und dem hektischen Alltag entfliehen möchten.",
              ],
            },
            {
              heading: "Ziele der schwedischen Massage",
              bullets: [
                "Förderung der Durchblutung",
                "Linderung von Muskelverspannungen",
                "Reduzierung von Stress und Förderung der mentalen Entspannung",
                "Verbesserung der Sauerstoffversorgung des Gewebes",
                "Unterstützung der Lymphzirkulation",
                "Steigerung des allgemeinen Wohlbefindens",
                "Förderung eines erholsamen Schlafs",
              ],
            },
            {
              heading: "Typische Grifftechniken",
              bullets: [
                "Effleurage (Streichungen)",
                "Petrissage (Knetungen)",
                "Friktionen (Reibungen)",
                "Tapotement (Klopfungen)",
                "Vibrationen",
              ],
            },
            {
              heading: "Behandlungsablauf",
              bullets: [
                "Vorgespräch zur Klärung individueller Beschwerden und Wünsche",
                "Vorbereitung mit warmem Massageöl und bequemer Lagerung auf der Massageliege",
                "Beginn mit sanften Griffen, gefolgt von intensiveren Techniken",
                "Individuelle Anpassung von Druck und Geschwindigkeit",
                "Kurze Ruhephase nach der Massage",
                "Abschluss der Behandlung",
              ],
            },
            {
              heading: "Dauer der Behandlung",
              bullets: [
                "60 Minuten – Teilkörpermassage",
                "90 Minuten – Klassische Ganzkörpermassage",
                "120 Minuten – Intensivere und besonders entspannende Behandlung",
              ],
            },
            {
              heading: "Für wen ist die schwedische Massage geeignet?",
              bullets: [
                "Menschen mit Stress und alltäglichen Belastungen",
                "Personen mit Muskelverspannungen",
                "Büroangestellte mit Nacken- und Rückenschmerzen",
                "Bei rheumatischen Beschwerden",
                "Sportler zur Unterstützung der Regeneration",
                "Zur Korrektur von Haltungsproblemen",
                "Für alle, die Entspannung und Wohlbefinden suchen",
              ],
            },
            {
              heading: "Positive Wirkungen",
              bullets: [
                "Senkung des Stresshormons Cortisol",
                "Förderung der Ausschüttung von Endorphinen",
                "Verbesserung der Beweglichkeit",
                "Stärkung des Immunsystems",
                "Erhöhung der Hautelastizität",
                "Harmonisierung von Körper und Geist",
              ],
            },
            {
              heading: "Kontraindikationen",
              bullets: [
                "Akute Entzündungen oder Infektionen",
                "Fieber",
                "Kürzlich erlittene Verletzungen oder Operationen",
                "Thrombose oder schwere Gefäßerkrankungen",
                "Offene Wunden oder Hauterkrankungen",
                "Bestimmte Herz-Kreislauf-Erkrankungen",
              ],
            },
          ],
        },
        hu: {
          title: "Svédmasszázs",
          sections: [
            {
              heading: "Általános leírás",
              paragraphs: [
                "A masszázs egyik legismertebb és legeljedtebb formája svédmasszázs a masszázs egyik legismertebb. Számos modern masszázstechnika alapját képezi, elsősorban a relaxációt, azmok ellazítását és az általános jó közérzet elősegítését szolgálja.",
                "A gyengéd és erősebb masszázstechnikák kombinációjával az egész test harmonizálódik és revitalizálódik. Ez a masszázs alkalmas stressztől és feszültségtől szenvedők számára, valamint azoknak, akik egyszerűen csak szeretnének egy pihentető szünetet élvezni és kiszakadni a mindennapi rohanó életükböl.",
              ],
            },
            {
              heading: "A svédmasszázs céljai",
              bullets: [
                "A vérkeringés elősegítése",
                "Azomfeszültség enyhítése",
                "Enyhül a stressz és megtörténik a lelki ellazulás",
                "A szövetek oxigénnellátásának javítása",
                "A nyirokkeringés támogatása",
                "Fokozott általános jólét",
                "A pihentető alvás elősegítése",
              ],
            },
            {
              heading: "Tipikus fogási technikák",
              bullets: [
                "Effleurage (simogatás) – Gyengéd, sikló mozdulatok a tenyérrel.",
                "Petrissage (gyúrás) – az izmokat megemelik, gyúrják és hengerelik.",
                "Súrlódás (dörzsölés) – Körkörös, mély mozdulatok az ujjakkal vagy a hüvelykujjal.",
                "Tapotement (kopogtatás) – Ritmikus kopogtató mozdulatok a kéz éleivel vagy az ujjbegyeivel.",
                "Rezgések – Finom, remegő mozdulatok azmok ellazítására.",
              ],
            },
            {
              heading: "Kezelesi foyamat",
              bullets: [
                "Előzetes konzultáció az egyéni panaszok és kívánságok tisztázása érdekében",
                "Előkészítés meleg masszázsolajjal és kényelmes elhelyezkedéssel a masszázsasztalon.",
                "Kezdjük gyengéd mozdulatokkal, majd intenzívebb technikákkal",
                "A nyomás és a sebesség egyedi beállítás",
                "Rövid pihenőidő a masszázs után",
                "A kezelés vége",
              ],
            },
            {
              heading: "A kezelés vége",
              bullets: [
                "60 perc – részleges testmasszázs",
                "90 perc – Classic Zikus teljes testes masszázs",
                "120 perc – Intenzívebb és különösen pihentető kezelés",
              ],
            },
            {
              heading: "Kinek ajánlott a svédmasszázs?",
              bullets: [
                "Stresszel és mindennapi terhekkel küzdő emberek",
                "Izomfeszültséggel küzdő emberek",
                "Nyak- és hatfájással küzdő irodai dolgozók",
                "Reumás betegségeknél",
                "Sportolók és regenerációért",
                "Tartáshibák korrigálása",
                "Bárki, aki pihenésre és jólétre vágyik",
              ],
            },
            {
              heading: "Pozitív hatások",
              bullets: [
                "A stresszhormon cortizol scintjének csökkentése",
                "Elősegíti az endorfin felszabadulását",
                "A mobilitás javítása",
                "Az immunrendszer erősítése",
                "Börünk visszakapja rugalmasságát",
                "Egy teszt tökéletes harmonizáció",
              ],
            },
            {
              heading: "Ellenjavallatok",
              bullets: [
                "Acutely gyulladás vagy fertőzés",
                "Laz",
                "Legutóbbi sérülések homályos műtétek",
                "Trombózis vagy súlyos érrendszeri betegségek",
                "Nyílt sebek homályos bőrbetegségek",
                "Bizonyos szív- és érrendszeri betegségek",
              ],
            },
          ],
        },
      },

      backNeck: {
        de: {
          title: "Rücken- und Nackenmassage",
          sections: [
            {
              heading: "Allgemeine Beschreibung",
              paragraphs: [
                "Die Nacken- und Rückenmassage ist eine gezielte Teilkörpermassage, die sich speziell auf die Körperbereiche konzentriert, die am häufigsten von Verspannungen betroffen sind.",
                "Langes Sitzen, Stress, wiederholte Belastungen oder körperliche Überanstrengung führen häufig zu Muskelverspannungen im Nacken-, Schulter- und Rückenbereich. Diese Massageform zielt darauf ab, Schmerzen zu lindern, Verspannungen zu lösen und das allgemeine Wohlbefinden zu verbessern.",
              ],
            },
            {
              heading: "Ziele der Nacken- und Rückenmassage",
              bullets: [
                "Linderung von Muskelverspannungen im Nacken- und Rückenbereich",
                "Schmerzlinderung bei Verspannungen und Fehlhaltungen",
                "Förderung der Durchblutung und Sauerstoffversorgung der Muskulatur",
                "Verbesserung der Beweglichkeit von Nacken und Schultern",
                "Stressabbau und mentale Entspannung",
                "Vorbeugung von Kopfschmerzen und spannungsbedingten Beschwerden",
                "Unterstützung einer gesunden Körperhaltung",
              ],
            },
            {
              heading: "Typische Massagetechniken",
              bullets: [
                "Streichungen",
                "Knetungen",
                "Reibungen",
                "Triggerpunkt-Therapie",
                "Dehnungen und Mobilisationen",
              ],
            },
            {
              heading: "Dauer der Behandlung",
              bullets: [
                "45 Minuten – Kurze, gezielte Behandlung bei akuten Verspannungen",
                "60 Minuten – Intensivere Behandlung mit Fokus auf Problembereiche",
                "75 Minuten – Umfassende und besonders entspannende Therapie",
              ],
            },
            {
              heading: "Positive Wirkungen",
              bullets: [
                "Reduzierung von Muskelsteifheit und Schmerzen",
                "Verbesserung der Körperhaltung",
                "Erhöhung des Bewegungsumfangs",
                "Aktivierung des parasympathischen Nervensystems",
                "Förderung von Entspannung und innerer Ruhe",
                "Verbesserung der Schlafqualität",
              ],
            },
            {
              heading: "Kontraindikationen",
              bullets: [
                "Akute Entzündungen oder Infektionen",
                "Fieber",
                "Frische Verletzungen oder kürzlich durchgeführte Operationen",
                "Akuter Bandscheibenvorfall",
                "Thrombose oder schwere Gefäßerkrankungen",
                "Offene Wunden oder Hauterkrankungen",
                "Schwere neurologische Erkrankungen",
              ],
            },
          ],
        },
        hu: {
          title: "Hát- és nyakmasszázs",
          sections: [
            {
              heading: "Általános leírás",
              paragraphs: [
                "A nyak- és hátmasszázs egy célzott részleges testmasszázs, amely kifejezetten a feszültség által leggyakrabban érintett testrészekre összpontosít.",
                "A hosszan tartó ülés, a stressz, az ismétlődő megterhelés vagy a fizikai túlterhelés gyakran izomfeszültséghez vezet a nyakban, a vállakban és a hátban. Ez a fajta masszázs célja a fájdalom enyhítése, a feszültség oldása és az általános közérzet javítása.",
              ],
            },
            {
              heading: "Nyak- és hátmasszázs céljai",
              bullets: [
                "A nyak és a hát izomfeszültségének enyhítése",
                "A feszültség és a rossz testtartás okozta fájdalom csillapítása",
                "Az izmok vérkeringésének és oxigénellátásának elősegítése",
                "A nyak és a vállak mozgékonyságának javítása",
                "Stresszcsökkentés és mentális relaxáció",
                "Fejfájás és feszültség okozta fejfájás megelőzése",
                "Az egészséges testtartás támogatása",
              ],
            },
            {
              heading: "Tipikus masszázstechnikák",
              bullets: [
                "simogatás",
                "gyúrás",
                "Dörzsölés ",
                "Triggerpont terápia",
                "Nyújtások és mobilizációk",
              ],
            },
            {
              heading: "A kezelés időtartama",
              bullets: [
                "45 perc – Rövid, célzott kezelés akut feszültség esetén",
                "60 perc – Intenzívebb kezelés, amely a problémás területekre összpontosít",
                "75 perc – Átfogó és különösen pihentető terápia",
              ],
            },
            {
              heading: "Pozitív hatások",
              bullets: [
                "Izommerevség és fájdalom csökkentése",
                "Javuló testtartás",
                "Mozgástartomány növelése",
                "A paraszimpatikus idegrendszer aktiválása",
                "Ellazulás és belső béke elősegítése",
                "Javuló alvásminőség",
              ],
            },
            {
              heading: "Ellazintok",
              bullets: [
                "Akut gyulladás vagy fertőzés",
                "Láz",
                "Friss vagy műtét utáni sérülések vagy műtétek",
                "Akut porckorongsérv",
                "Trombózis vagy súlyos érbetegség",
                "Nyílt sebek vagy bőrsérülések betegségek",
                "Súlyos neurológiai rendellenességek",
              ],
            },
          ],
        },
      },
      individual: {
        de: {
          title: "Individuelle Massage",
          sections: [
            {
              heading: "Allgemeine Beschreibung",
              paragraphs: [
                "Die individuelle Massage ist eine maßgeschneiderte Behandlung, die speziell auf die persönlichen Bedürfnisse, Beschwerden und Wünsche des Klienten abgestimmt wird.",
                "Im Gegensatz zu standardisierten Massageformen kombiniert sie verschiedene manuelle Techniken, um optimale therapeutische und entspannende Ergebnisse zu erzielen.",
              ],
            },
            {
              heading: "Ziele der individuellen Massage",
              bullets: [
                "Individuelle Linderung von Muskelverspannungen",
                "Schmerzlinderung bei spezifischen Beschwerden",
                "Förderung der Durchblutung und des Stoffwechsels",
                "Verbesserung der Beweglichkeit",
                "Stressabbau und mentale Entspannung",
                "Unterstützung der Regeneration nach körperlicher Belastung",
                "Steigerung des allgemeinen Wohlbefindens",
              ],
            },
            {
              heading: "Typische Techniken",
              bullets: [
                "Streichungen",
                "Knetungen",
                "Reibungen",
                "Triggerpunkt-Therapie",
                "Dehnungen und Mobilisationen",
                "Fasziale Techniken (FDM, Flossing, Schöpfen)",
              ],
            },
            {
              heading: "Dauer der Behandlung",
              bullets: [
                "60 Minuten – Gezielte Behandlung einzelner Problemzonen",
                "90 Minuten – Umfassende, individuell angepasste Massage",
                "120 Minuten – Intensive Ganzkörperbehandlung mit Fokus auf mehrere Beschwerdebereiche",
              ],
            },
          ],
        },
        hu: {
          title: "Egyéni masszázs",
          sections: [
            {
              heading: "Általános leírás",
              paragraphs: [
                "Az egyéni masszázs egy személyre szabott kezelés, amelyet kifejezetten a kliens személyes igényeihez, betegségeihez és kívánságaihoz igazítanak.",
                "A standardizált masszázstechnikákkal ellentétben különféle manuális technikákat kombinál az optimális terápiás és relaxációs eredmények elérése érdekében.",
              ],
            },
            {
              heading: "Az egyéni masszázs céljai",
              bullets: [
                "Az izomfeszültség egyénre szabott enyhítése",
                "Fájdalomcsillapítás specifikus panasz esetén",
                "A vérkeringés és az anyagcsere elősegítése",
                "A mobilitás javítása",
                "Stresszcsökkentés és mentális relaxáció",
                "A regeneráció támogatása fizikai megterhelés után",
                "Az általános jólét növelése",
              ],
            },
            {
              heading: "Tipikus technikák",
              bullets: [
                "simogatás",
                "gyúrás",
                "Dörzsölés ",
                "Triggerpont terápia",
                "Nyújtások és mobilizációk",
                "Fasciális technikák Flossing,köpöly,FDM kezeles",
              ],
            },
            {
              heading: "A kezelés időtartama",
              bullets: [
                "60 perc – Az egyes problémás területek célzott kezelése",
                "90 perc – Átfogó, személyre szabott masszázs",
                "120 perc – Intenzív teljes testes kezelés, amely a kellemetlenségek több területére összpontosít",
              ],
            },
          ],
        },
      },

      foot: {
        de: {
          title: "Fußmassage",
          sections: [
            {
              heading: "Allgemeine Beschreibung",
              paragraphs: [
                "Die Fußmassage ist eine beruhigende und therapeutische Behandlung, die sich auf die Entspannung und Aktivierung der Füße konzentriert. Unsere Füße begleiten uns durch den gesamten Alltag und sind dabei einer erheblichen Belastung ausgesetzt.",
                "Gezielte Massagetechniken lösen Verspannungen, fördern die Durchblutung und verbessern das allgemeine Wohlbefinden.",
              ],
            },
            {
              heading: "Ziele der Fußmassage",
              bullets: [
                "Förderung der Durchblutung der Füße",
                "Linderung von Muskelverspannungen",
                "Entspannung von Körper und Geist",
                "Erleichterung bei müden und schweren Beinen",
                "Unterstützung der Regeneration nach körperlicher Belastung",
                "Verbesserung der Beweglichkeit des Sprunggelenks",
                "Steigerung des allgemeinen Wohlbefindens",
              ],
            },
            {
              heading: "Dauer der Behandlung",
              bullets: [
                "45 Minuten – Intensivere Massage mit zusätzlicher Mobilisation",
                "60 Minuten – Umfassende Behandlung mit optionalem Fußbad",
              ],
            },
            {
              heading: "Kontraindikationen",
              bullets: [
                "Offene Wunden oder Hauterkrankungen an den Füßen",
                "Akute Entzündungen oder Infektionen",
                "Frisch überstandene Verletzungen oder Operationen",
                "Thrombose oder schwere Gefäßerkrankungen",
                "Schwere Krampfadern im akuten Stadium",
                "Ansteckender Fußpilz",
              ],
            },
          ],
        },
        hu: {
          title: "Talpmasszázs",
          sections: [
            {
              heading: "Általános leírás",
              paragraphs: [
                "A talpmasszázs egy nyugtató és terápiás kezelés, amely a lábak ellazítására és aktiválására összpontosít. Lábunk végigkísér minket a mindennapi életben, és hatalmas terhelésnek van kitéve.",
                "A célzott masszázstechnikák oldják a feszültséget, serkentik a vérkeringést és javítják az általános közérzetet.",
              ],
            },
            {
              heading: "A talpmasszázs céljai",
              bullets: [
                "A láb vérkeringésének serkentése",
                "Izomfeszültség enyhítése",
                "Test és lélek ellazítása",
                "Fáradt és nehéz lábak enyhítése",
                "Fizikai megterhelés utáni regeneráció támogatása",
                "Boka mozgásának javítása",
                "Általános közérzet növelése",
              ],
            },
            {
              heading: "A kezelés időtartama",
              bullets: [
                "45 perc – Intenzívebb masszázs további mobilizációval",
                "60 perc – Átfogó kezelés, opcionális lábfürdővel",
              ],
            },
            {
              heading: "Ellenjavallatok",
              bullets: [
                "Nyílt sebek vagy bőrbetegségek a lábon",
                "Akut gyulladás vagy fertőzés",
                "Frissen lezajlott sérülések vagy műtétek",
                "Trombózis vagy súlyos érrendszeri betegségek",
                "Súlyos visszér akut stádiumban",
                "Fertőző lábgomba",
              ],
            },
          ],
        },
      },

      lymph: {
        de: {
          title: "Lymphdrainage",
          sections: [
            {
              heading: "Allgemeine Beschreibung",
              paragraphs: [
                "Die Lymphdrainage ist eine besonders sanfte und rhythmische Behandlung zur Unterstützung des Lymphflusses.",
                "Sie wird eingesetzt, um Schwellungen zu reduzieren, Gewebe zu entlasten und den Flüssigkeitstransport im Körper zu fördern.",
              ],
            },
            {
              heading: "Ziele",
              bullets: [
                "Förderung des Lymphflusses",
                "Reduktion von Schwellungen",
                "Entlastung des Gewebes",
                "Sanfte Unterstützung der Regeneration",
              ],
            },
            {
              heading: "Dauer der Behandlung",
              bullets: [
                "60 Minuten – gezielte lymphatische Behandlung",
                "90 Minuten – umfassendere Entlastung und Unterstützung",
              ],
            },
          ],
        },
        hu: {
          title: "Nyirokelvezetés",
          sections: [
            {
              heading: "Általános leírás",
              paragraphs: [
                "A nyirokelvezetés különösen gyengéd és ritmikus kezelés, amely támogatja a nyirokkeringést.",
                "A kezelés célja a duzzanatok csökkentése, a szövetek tehermentesítése és a folyadékszállítás serkentése a szervezetben.",
              ],
            },
            {
              heading: "Célok",
              bullets: [
                "A nyirokkeringés támogatása",
                "A duzzanatok csökkentése",
                "A szövetek tehermentesítése",
                "A immunrendszer támogatása",
                "duzzanat okozta fájdalomcsillapitás",
                "A méregtelenítés elösegítése",
                "Mély ellazulás és stresszcsökkentést",
              ],
            },
            {
              heading: "A kezelés időtartama",
              bullets: [
                "60 perc – célzott nyirokkezelés",
                "90 perc – átfogóbb tehermentesítés és támogatás",
              ],
            },
          ],
        },
      },

      vagus: {
        de: {
          title: "Vagus / Stressabbau",
          sections: [
            {
              heading: "Allgemeine Beschreibung",
              paragraphs: [
                "Die Vagus-Massage ist eine sanfte und tief entspannende Behandlung, die darauf abzielt, das Nervensystem zu beruhigen und den Körper in einen Zustand tiefer Regeneration zu begleiten.",
                "Durch ruhige, achtsame Berührungen wird die parasympathische Regulation unterstützt.",
              ],
            },
            {
              heading: "Ziele",
              bullets: [
                "Reduktion von Stress und innerer Anspannung",
                "Förderung von Ruhe und Ausgeglichenheit",
                "Unterstützung der Regeneration",
                "Verbesserung des Körpergefühls",
              ],
            },
            {
              heading: "Dauer der Behandlung",
              bullets: [
                "45 Minuten – gezielte Entspannungsbehandlung",
                "60 Minuten – intensivere nervliche und körperliche Entlastung",
              ],
            },
          ],
        },
        hu: {
          title: "Vagus / stresszoldás",
          sections: [
            {
              heading: "Általános leírás",
              paragraphs: [
                "A vagus masszázs egy gyengéd és mélyen ellazító kezelés, amelynek célja az idegrendszer megnyugtatása és a test mély regenerációjának támogatása.",
                "A nyugodt, figyelmes érintések támogatják a paraszimpatikus szabályozást.",
                "A nyak, a torok, a fej és az arc célzott, nyugtató érintésein keresztül aktiválódik a paraszimpatikus idegrendszer – más néven a test nyugalmi és regenerációs üzemmódja.",
              ],
            },
            {
              heading: "Célok",
              bullets: [
                "A stressz és belső feszültség csökkentése",
                "A nyugalom és egyensúly támogatása",
                "A regeneráció elősegítése",
                "A paraszimpatikus idegrendszer aktiválása",
                "A belső béke és nyugalom elősegítése",
                "Az alvásminőség javítása",
                "Az érzelmi egyensúly támogatása",
                "A pulzusszám szabályozása",
                "Az emésztés elősegítése",
                "A feszültség okozta fejfájás enyhítése",
              ],
            },
            {
              heading: "A kezelés időtartama",
              bullets: [
                "45 perc – célzott relaxációs kezelés",
                "60 perc – intenzívebb idegrendszeri és testi tehermentesítés",
              ],
            },
          ],
        },
      },

      champi: {
        de: {
          title: "Champi – Indische Kopfmassage",
          sections: [
            {
              heading: "Allgemeine Beschreibung",
              paragraphs: [
                "Die Champi-Kopfmassage, auch bekannt als indische Kopfmassage, ist eine traditionelle Behandlung, die aus der heilenden Kunst des indischen Ayurveda stammt.",
                "Diese Massage konzentriert sich auf Kopf, Nacken, Schultern und Gesicht und hat das Ziel, Körper und Geist in Einklang zu bringen.",
              ],
            },
            {
              heading: "Ziele der Champi-Kopfmassage",
              bullets: [
                "Tiefe Entspannung von Körper und Geist",
                "Reduzierung von Stress und Linderung innerer Unruhe",
                "Förderung der Durchblutung der Kopfhaut",
                "Unterstützung des Haarwachstums",
                "Linderung von spannungsbedingten Kopfschmerzen",
                "Verbesserung der Konzentrationsfähigkeit",
                "Aktivierung des Energieflusses im Körper",
                "Förderung eines erholsamen Schlafs",
              ],
            },
            {
              heading: "Dauer der Behandlung",
              bullets: [
                "45 Minuten – Umfassende Massage von Kopf, Nacken und Schultern",
              ],
            },
          ],
        },
        hu: {
          title: "Champi – indiai fejmasszázs",
          sections: [
            {
              heading: "Általános leírás",
              paragraphs: [
                "A Champi fejmasszázs, más néven indiai fejmasszázs, egy hagyományos kezelés, amely az indiai ájurvéda gyógyító művészetéből ered.",
                "Ez a masszázs a fejre, a nyakra, a vállakra és az arcra összpontosít, célja a test és az elme harmonizálása.",
              ],
            },
            {
              heading: "A Champi fejmasszázs céljai",
              bullets: [
                "A test és az elme mély ellazulása",
                "A stressz csökkentése és a belső nyugtalanság enyhítése",
                "A vérkeringés fokozása a fejbőrben",
                "A hajnövekedés támogatása",
                "A feszültség okozta fejfájás enyhítése",
                "A koncentráció javítása",
                "Az energiaáramlás aktiválása a testben",
                "A pihentető alvás elősegítése",
              ],
            },
            {
              heading: "Kezelés időtartama",
              bullets: [
                "45 perc – A fej, a nyak és a vállak átfogó masszázsa",
              ],
            },
          ],
        },
      },

      fdm: {
        de: {
          title: "FDM – Faszien-Distorsions-Modell",
          sections: [
            {
              heading: "Allgemeine Beschreibung",
              paragraphs: [
                "Das Faszien-Distorsions-Modell (FDM) ist ein innovatives und effektives Behandlungskonzept zur Therapie von Schmerzen und Bewegungseinschränkungen des Bewegungsapparates.",
                "Es basiert auf der Annahme, dass viele Schmerzen und funktionelle Störungen auf Verformungen der Faszien zurückzuführen sind. Durch die Interpretation der Körpersprache des Patienten ermöglicht die Methode eine schnelle Schmerzlinderung und eine verbesserte Bewegungsfreiheit – häufig bereits nach ein bis zwei Behandlungen.",
              ],
            },
            {
              heading: "Ziele der FDM-Behandlung",
              bullets: [
                "Schnelle Schmerzlinderung",
                "Verbesserung der Beweglichkeit",
                "Wiederherstellung der faszialen Funktion",
                "Behandlung akuter und chronischer Beschwerden",
                "Unterstützung der sportlichen Leistungsfähigkeit",
                "Beschleunigung der Regeneration nach Verletzungen",
              ],
            },
            {
              heading: "Warum ist die FDM-Methode besonders?",
              bullets: [
                "Patientenzentrierte Diagnostik: Die Behandlung basiert auf der Körpersprache des Patienten. Spontane Gesten zur Beschreibung des Schmerzes zeigen präzise die Art der faszialen Veränderung.",
                "Schnelle Ergebnisse: Zielgerichtete manuelle Techniken führen häufig bereits bei der ersten Behandlung zu einer deutlichen Schmerzlinderung.",
                "Natürlicher Ansatz: Die Methode orientiert sich an den intuitiven Signalen des Körpers und setzt genau dort an, wo die Gewebeverformung entstanden ist.",
                "Hohe Effektivität: Besonders geeignet bei akuten Sportverletzungen, chronischen Beschwerden des Bewegungsapparates und eingeschränktem Bewegungsumfang.",
              ],
            },
          ],
        },
        hu: {
          title: "Fasciális Distorció Modell (FDM)",
          sections: [
            {
              heading: "Általános leírás",
              paragraphs: [
                "A Fasciális Distorció Modell (FDM) egy innovatív és hatékony kezelési koncepció a mozgásszervi rendszer fájdalmának és mozgáskorlátozottságának terápiájára.",
                "Azon a feltételezésen alapul, hogy számos fájdalom és funkcionális rendellenesség a fascia torzulásainak köszönhető. A beteg testbeszédére építve gyors fájdalomcsillapítást és mozgásszabadságot eredményez, gyakran már egy-két kezelés után.",
              ],
            },
            {
              heading: "Az FDM kezelés céljai",
              bullets: [
                "Gyors fájdalomcsillapítás",
                "Javított mobilitás",
                "A fasciális funkció helyreállítása",
                "Akut és krónikus állapotok kezelése",
                "A sportteljesítmény támogatása",
                "Sérülések utáni regeneráció felgyorsítása",
              ],
            },
            {
              heading: "Miért különleges az FDM módszer?",
              bullets: [
                "Páciensközpontú diagnosztika: A kezelés alapja az Ön testbeszéde – a fájdalom leírására használt spontán gesztusok pontosan megmutatják a fascia elváltozásának típusát.",
                "Gyors eredmények: A célzott manuális fogások gyakran már az első alkalommal jelentős fájdalomcsillapító hatást érnek el.",
                "Természetes megközelítés: A módszer a test ösztönös jelzéseire épít, így a kezelés pontosan ott avatkozik be, ahol a szöveti torzulás történt.",
                "Hatékonyság: Kiválóan alkalmazható akut sportsérülések, krónikus mozgásszervi panaszok és beszűkült mozgástartomány esetén is.",
              ],
            },
          ],
        },
      },

      flossing: {
        de: {
          title: "Flossing",
          sections: [
            {
              heading: "Allgemeine Beschreibung",
              paragraphs: [
                "Flossing ist eine komplexe physiotherapeutische Behandlung, die das Bindegewebe, die Muskulatur und die Gelenke betrifft.",
                "Der Kern der Behandlung besteht in der Anwendung eines speziellen elastischen Bandes, das durch gezielten Druck über mechanische und physiologische Mechanismen eine positive Wirkung entfaltet.",
              ],
            },
            {
              heading: "Hauptanwendungsgebiete",
              bullets: [
                "Verbesserung der Gelenkbeweglichkeit",
                "Rehabilitation nach Verstauchungen und Zerrungen",
                "Schmerzlinderung bei akuten und chronischen Beschwerden",
                "Reduktion von Ödemen und Schwellungen",
                "Mobilisation von Narbengewebe",
              ],
            },
            {
              heading: "Dauer der Behandlung",
              bullets: ["30 Minuten – Gezielte Behandlung"],
            },
            {
              heading: "Hinweis",
              paragraphs: [
                "Die Flossing-Behandlung kann je nach individuellem Bedarf in die individuelle Massagetherapie integriert werden.",
              ],
            },
          ],
        },
        hu: {
          title: "Flossing",
          sections: [
            {
              heading: "Általános leírás",
              paragraphs: [
                "A fogselyemhasználat egy komplex fizioterápiás kezelés, amely a kötőszövetet, az izmokat és az ízületeket érinti.",
                "A kezelés lényege egy speciális rugalmas szalag határozott nyomásában rejlik, amely mechanikai és fiziológiai mechanizmusokon keresztül fejti ki pozitív hatását.",
              ],
            },
            {
              heading: "Főbb alkalmazások",
              bullets: [
                "Ízületi mobilitás javítása",
                "Rándulások és húzódások utáni rehabilitáció",
                "Fájdalomcsillapítás akut és krónikus állapotokban",
                "Ödéma és duzzanat csökkentése",
                "Hegszövet mobilizálása",
              ],
            },
            {
              heading: "Kezelés időtartama",
              bullets: ["30 perc – Célzott kezelés"],
            },
            {
              heading: "Megjegyzés",
              paragraphs: [
                "A floss kezelés az egyéni masszázsterápiában szükség szerint alkalmazható",
              ],
            },
          ],
        },
      },
      schroepfen: {
        de: {
          title: "Schröpfen",
          sections: [
            {
              heading: "Allgemeine Beschreibung",
              paragraphs: [
                "Schröpfen ist eine Vakuumtherapie mit jahrtausendealter Tradition. Dabei werden Glas-, Silikon- oder Kunststoffgläser verwendet, um auf der Hautoberfläche ein Vakuum zu erzeugen. Dieser Sog fördert die lokale Blut- und Lymphzirkulation, löst Muskelverhärtungen, lockert verklebtes Bindegewebe und unterstützt den Abtransport von Giftstoffen.",
              ],
            },
            {
              heading: "Wichtigste Anwendungsbereiche und Wirkungen",
              bullets: [
                "Muskelentspannung: Effektiv bei Rücken-, Schulter- und Lendenbeschwerden sowie bei myofaszialen Verklebungen.",
                "Verbesserung der Durchblutung: Fördert den Stoffwechsel und die Sauerstoffversorgung des Gewebes.",
                "Schmerzlinderung: Reduziert myofasziale Spannungen und aktiviert das parasympathische Nervensystem.",
                "Entgiftung: Die verstärkte Durchblutung unterstützt den Abtransport von Stoffwechselrückständen.",
                "Leitsatz: Gute Durchblutung – gute Funktion – gutes Bewegungsmuster – qualitativ hochwertige Heilung.",
              ],
            },
            {
              heading: "Schröpftechniken",
              bullets: [
                "Trockenes / fixes Schröpfen: Die Schröpfgläser verbleiben für etwa 10–15 Minuten an einer Stelle.",
                "Gleitendes / dynamisches Schröpfen: Das Glas wird in massierenden Bewegungen über die eingeölte Haut bewegt. „Wohlbefinden für den Rücken“ harmonisiert die Funktion der inneren Organe.",
              ],
            },
            {
              heading: "Wichtige Hinweise",
              paragraphs: [
                "Nach der Behandlung können violett-blaue Flecken (Blutungen) auftreten, die innerhalb von 2–3 Tagen von selbst abklingen. Nicht empfohlen bei Blutgerinnungsstörungen, Hauterkrankungen, großen Muttermalen, älteren Patienten mit pergamentartiger Haut, akuter Thrombose, akuten Krampfadern, Krebs, Osteoporose oder während der Schwangerschaft.",
              ],
            },
            {
              heading: "Kontraindikationen",
              bullets: [
                "Blutgerinnungsstörungen",
                "Hauterkrankungen oder großen Muttermalen im Behandlungsbereich",
                "Sehr empfindlicher, dünner Haut (z. B. bei älteren Patienten)",
                "Akuter Thrombose",
                "Akuten Venenerkrankungen oder starken Krampfadern",
                "Tumorerkrankungen",
                "Osteoporose",
                "Schwangerschaft",
              ],
            },
          ],
        },
        hu: {
          title: "Köpölyözés",
          sections: [
            {
              heading: "Általános leírás",
              paragraphs: [
                "A köpölyözés egy évezredes hagyományokra visszatekintő vákuumterápia, amely során üveg-, szilikon- vagy műanyag csészékkel vákuumot hoznak létre a bőr felszínén. Ez a szívóhatás fokozza a helyi vér- és nyirokkeringést, oldja az izomcsomókat, lazítja a letapadt kötőszövetet, valamint segíti a méreganyagok eltávolítását.",
              ],
            },
            {
              heading: "Főbb alkalmazási területek és hatások:",
              bullets: [
                "Izomlazítás: Hatékony hát-, váll- és derékfájdalmak, valamint mozgásszervi letapadások kezelésére.",
                "Keringésjavítás: Fokozza a szövetek anyagcseréjét és oxigénellátását.",
                "Fájdalomcsillapítás: Csökkenti a myofascialis feszültséget és aktiválja a paraszimpatikus idegrendszert.",
                "Salaktalanítás: A fokozott vérbőség segíti a salakanyagok távozását.",
                "jó keringés-jó funkció-jó mozgásminta-minöségi gyógyulás",
              ],
            },
            {
              heading: "Köpölyözési technikák:",
              bullets: [
                "Száraz/fix köpölyözés: A csészéket 10-15 percig egy helyen hagyják.",
                'Csúszó/dinamikus köpölyözés: Olajos bőrfelületen a csészét mozgatják, masszázs jelleggel. "Nagy háti wellness" amely a belsöszervek müködését egymáshoz hangolják.',
              ],
            },
            {
              heading: "Fontos tudnivalók:",
              paragraphs: [
                "A kezelés után gyakran lilás-kékes foltok (bevérzések) keletkeznek, amelyek 2-3 nap alatt maguktól felszívódnak.",
              ],
            },
            {
              heading: "Ellenjavallatok:",
              bullets: [
                "Nem javasolt véralvadási problémák, bőrbetegségek, nagy anyajegyek, idös paciens pergamenbörének, akut trombozis esetén, akut vénatágulatnál, daganatos betegségek, csontritkulás esetén, illetve terhesség alatt.",
              ],
            },
          ],
        },
      },

      scarTreatment: {
        de: {
          title: "Narbenbehandlung",
          sections: [
            {
              heading: "Allgemeine Beschreibung",
              paragraphs: [
                "Die Narbenbehandlung umfasst verschiedene Verfahren zur ästhetischen und funktionellen Verbesserung des Narbengewebes. Sie beinhaltet manuelle Techniken wie Massage und Mobilisation. Ziel ist es, Spannungen zu lösen, Verklebungen zu beseitigen, die Durchblutung zu fördern und die Sichtbarkeit von Narben zu reduzieren.",
                "Die Behandlung ist besonders wichtig nach Operationen (z. B. Kaiserschnitt), um den Bewegungsumfang wiederherzustellen und die Funktion des betroffenen Gewebes zu verbessern.",
              ],
            },
            {
              heading: "Wichtigste Methoden der Narbenbehandlung",
              bullets: [
                "Manuelle Narbenbehandlung / Massage: Mobilisation des Narbengewebes durch feine, kreisende Bewegungen, die auch tiefere Gewebeschichten einbeziehen.",
                "Schröpfen und fasziale Techniken: Einsatz von Schröpftechniken, Flossing, FDM-Techniken, speziellen Narbenbehandlungsstäben sowie Kinesio-Tape zur Lockerung tiefer Verklebungen.",
              ],
            },
            {
              heading: "Wann ist eine Narbenbehandlung empfehlenswert?",
              bullets: [
                "Bei verklebten Operationsnarben (z. B. Kaiserschnitt oder Laparoskopie) sowie bei postoperativen Ödemen",
                "Zur Behandlung von Narben nach Verbrennungen",
                "Bei spannenden, ziehenden, schmerzhaften oder rötlich-violetten Narben",
                "Wenn die Narbe die Beweglichkeit des betroffenen Körperbereichs einschränkt",
              ],
            },
            {
              heading: "Mögliche Komplikationen",
              paragraphs: [
                "Unbehandelte Narben können zu Verklebungen führen, die chronische Schmerzen, Bewegungseinschränkungen oder sogar Beschwerden im Lendenbereich, Verstopfung und Ödeme verursachen können.",
              ],
            },
            {
              heading: "Arten von Narben",
              bullets: [
                "Atrophe Narbe – eingesunkene oder auseinandergezogene Haut.",
                "Hypertrophe Narbe – erhaben, jedoch auf den Bereich der ursprünglichen Wunde begrenzt; häufig rötlich und verhärtet.",
                "Keloid – stark erhabene, über die ursprüngliche Wunde hinauswachsende, glänzend-weiße und feste Narbe.",
                "Kontrakte Narbe – führt zu einem Zusammenziehen des Gewebes in die Tiefe und kann die Beweglichkeit einschränken.",
              ],
            },
            {
              heading: "Narben und Adhäsionen (Verklebungen)",
              paragraphs: [
                "Nach Immobilisation kann sich ein chaotisches Netzwerk aus Bindegewebe im Bewegungsapparat sowie in der Bauch- und Brusthöhle bilden. Diese Adhäsionen können schmerzhaft sein, müssen es jedoch nicht.",
                "Am häufigsten treten sie im Becken, in der Bauchhöhle und im Bereich des Herzens (Perikard) auf. In etwa 10 % der Fälle entstehen Adhäsionen auch ohne vorherige Operation, insbesondere bei Personen über 30 Jahren mit sitzender Lebensweise.",
                "In 30–40 % der Fälle verursachen sie keine Beschwerden, während sie in 60–70 % der Fälle zu erheblichen Problemen führen können, wie z. B. Darmbeschwerden, inneren Beckenorganproblemen oder Ödemen in den Beinen.",
              ],
            },
          ],
        },
        hu: {
          title: "Hegkezelés",
          sections: [
            {
              heading: "Általános leírás",
              paragraphs: [
                "A hegkezelés a hegszövet esztétikai és funkcionális javítását célzó eljárások összessége, amely magában foglalja a manuális technikákat (masszázs, mobilizálás).  Célja a feszülés oldása, a letapadások megszüntetése, a vérkeringés fokozása és a hegek láthatóságának csökkentése. A kezelés elengedhetetlen műtétek (pl. császármetszés) után a mozgásterjedelem visszaállításához.",
              ],
            },
            {
              heading: "A hegkezelés főbb módszerei:",
              paragraphs: [
                "Manuális hegkezelés/masszázs: a szakember által végzett, vagy otthon megtanulható, a hegszövet finom, körkörös, majd mélyebb rétegeket is érintő kimozgatása, kézi technikák",
                "Köpölyözés és fascia technikák: A mélyebben letapadt hegek fellazítására használhatunk köpölyt, flosst, és FDM technikákat , valamint dolgozhatunk a hegkezelö pálcánkkal, alkalmazhatunk kienzio tape-t.",
              ],
            },
            {
              heading: "Mikor ajánlott?",
              bullets: [
                "Műtéti hegek (császármetszés, laporoszkópia) letapadása esetén, illetve mütét után fellépö ödéma esetén.",
                "Égési sérülések utáni hegek kezelésére.",
                "Feszülő, húzódó, fájdalmas, vagy vöröses-lilás hegek esetén.",
                "Ha a heg korlátozza az érintett testrész mozgását.",
              ],
            },
            {
              heading: "Szövődmények:",
              paragraphs: [
                "A kezeletlen heg letapadhat, ami krónikus fájdalmat, mozgáskorlátozottságot, vagy akár deréktáji panaszokat, székrekedést, ödémát is okozhat.",
              ],
            },
            {
              heading: "Hegesedési defektusok:",
              bullets: [
                "Atróf: a bőr szétnyúlt, széjjelszakad",
                "Hipertróf: a heg kiemelkedő, de csak a seb fölött, vöröses, kemény (vörös kukac)",
                "Keloid:  a heg kiemelkedő, folyton növő a seb, csillogó fehér, kemény",
                "Kontratúrás: behúz a mélybe",
              ],
            },
            {
              heading: "Hegekröl és az adhéziókról (összetapadás)",
              paragraphs: [
                "immobilizálást követően létrejött kaotikus kötőszövetes háló mozgásszervben, hasüregben, mellüregben egyaránt",
                "Fájhat vagy nem",
                "Leggyakoribb: medencében, hasüregben, szív-pericardium területén",
                "10%-ban akkor is van, ha soha nem volt operálva, 30 fölött, ülő életmódnál!",
                "30-40%-ban soha nem fog zavarni, 60-70%-ban leggyakrabban bélelhalás és medence belszervi panaszokat okoz, valamint lábi ödémásodást.",
              ],
            },
          ],
        },
      },
    }),
    []
  );

  return (
    <div className="min-h-screen bg-[#f6efe5] text-stone-800">
      <header className="sticky top-0 z-50 border-b border-[#6f7d58] bg-[#7a8662]/95 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 lg:px-10">
          <div className="flex items-center justify-between py-3">
            <nav className="hidden items-center gap-8 text-base text-white lg:flex">
              <a href="#ueber" className="transition hover:text-[#f5efe3]">
                {c.nav.about}
              </a>
              <a href="#leistungen" className="transition hover:text-[#f5efe3]">
                {c.nav.services}
              </a>
              <a href="#special" className="transition hover:text-[#f5efe3]">
                {c.nav.special}
              </a>
            </nav>

            <div className="flex flex-col items-center">
              <Image
                src="/logo-christina-massage.png"
                alt="Christina Massage Logo"
                width={220}
                height={100}
                className="h-16 w-auto object-contain md:h-20"
                priority
              />
              <p className="mt-1 text-center text-sm uppercase tracking-[0.3em] text-[#f2ecdf]">
                {c.brand.city}
              </p>
            </div>

            <div className="hidden items-center gap-4 text-base text-white lg:flex">
              <a
                href="#zusatzangebote"
                className="transition hover:text-[#f5efe3]"
              >
                {c.nav.methods}
              </a>
              <a href="#anfahrt" className="transition hover:text-[#f5efe3]">
                {c.nav.location}
              </a>
              <a
                href={accountHref}
                className="rounded-full border border-white/70 px-5 py-2 text-base font-medium text-white transition hover:bg-white/10"
              >
                {accountLabel}
              </a>
              <a
                href="#booking"
                className="rounded-full border border-[#f5efe3] px-5 py-2 text-base font-medium text-[#f5efe3] transition hover:bg-[#f5efe3] hover:text-[#556246]"
              >
                {c.nav.booking}
              </a>
            </div>
          </div>

          <div className="flex flex-col gap-3 pb-3 lg:hidden">
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-sm text-white/95">
              <a href="#ueber">{c.nav.about}</a>
              <a href="#leistungen">{c.nav.services}</a>
              <a href="#special">{c.nav.special}</a>
              <a href="#zusatzangebote">{c.nav.methods}</a>
              <a href="#anfahrt">{c.nav.location}</a>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <a
                href={accountHref}
                className="rounded-full border border-white/70 px-4 py-2 text-sm font-medium text-white"
              >
                {accountLabel}
              </a>
              <a
                href="#booking"
                className="rounded-full border border-[#f5efe3] px-4 py-2 text-sm font-medium text-[#f5efe3]"
              >
                {c.nav.booking}
              </a>
              <div className="rounded-full border border-[#d8d0c2] bg-white/90 p-1">
                <button
                  onClick={() => setLanguage("de")}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                    language === "de"
                      ? "bg-stone-800 text-white"
                      : "text-stone-700"
                  }`}
                >
                  DE
                </button>
                <button
                  onClick={() => setLanguage("hu")}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                    language === "hu"
                      ? "bg-stone-800 text-white"
                      : "text-stone-700"
                  }`}
                >
                  HU
                </button>
              </div>
            </div>
          </div>

          <div className="hidden justify-end pb-3 lg:flex">
            <div className="rounded-full border border-[#d8d0c2] bg-white/90 p-1">
              <button
                onClick={() => setLanguage("de")}
                className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                  language === "de"
                    ? "bg-stone-800 text-white"
                    : "text-stone-700"
                }`}
              >
                DE
              </button>
              <button
                onClick={() => setLanguage("hu")}
                className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                  language === "hu"
                    ? "bg-stone-800 text-white"
                    : "text-stone-700"
                }`}
              >
                HU
              </button>
            </div>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(64,94,63,0.28),rgba(64,94,63,0.2))]" />
        <Image
          src="/massage-hero.png"
          alt="Massage Hero"
          fill
          priority
          className="object-cover"
        />
        <div className="relative mx-auto flex min-h-[74vh] max-w-7xl flex-col items-center justify-center px-6 py-20 text-center lg:min-h-[78vh] lg:px-10">
          <h1 className="max-w-5xl text-4xl font-light tracking-wide text-white md:text-7xl">
            {c.hero.title}
          </h1>
          <div className="mt-8 h-px w-40 bg-white/50" />
          <p className="mt-8 max-w-3xl text-base leading-7 text-white/90 md:text-2xl md:leading-8">
            {c.hero.subtitle}
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <a
              href="#booking"
              className="border border-[#d6b36a] bg-[#d6b36a] px-8 py-4 text-base font-medium text-stone-900 transition hover:opacity-90 md:px-10"
            >
              {c.hero.primary}
            </a>
            <a
              href={c.brand.whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="border border-[#d6b36a] bg-[#d6b36a] px-8 py-4 text-base font-medium text-stone-900 transition hover:opacity-90 md:px-10"
            >
              {c.hero.secondary}
            </a>
          </div>
        </div>
      </section>

      <section id="ueber" className="bg-[#f8f2e9] py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="mb-10 text-center">
            <p className="text-sm uppercase tracking-[0.28em] text-stone-500">
              {c.about.eyebrow}
            </p>
            <h2 className="mt-4 text-3xl font-semibold text-stone-900 md:text-5xl">
              {c.about.title}
            </h2>
          </div>

          <div className="grid gap-8 lg:grid-cols-[0.78fr_1.22fr] lg:items-start">
            <div className="overflow-hidden rounded-[2rem] border border-stone-200 bg-white shadow-sm">
              <div className="relative h-[380px] md:h-[520px]">
                <Image
                  src="/christina-about.jpg"
                  alt="Christina"
                  fill
                  className="object-cover object-center"
                />
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm md:p-8">
                <div className="space-y-3 text-base leading-8 text-stone-700">
                  {c.about.text.map((paragraph: string) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              </div>

              <div className="rounded-[2rem] border border-[#ddd3c2] bg-[#efe7da] p-6 shadow-sm md:p-8">
                <h3 className="text-2xl font-semibold text-stone-900">
                  {c.about.qualificationsTitle}
                </h3>
                <div className="mt-5 space-y-3 text-base leading-8 text-stone-700">
                  {c.about.qualificationsText.map((paragraph: string) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="special" className="py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="overflow-hidden rounded-[2.2rem] border border-stone-200 bg-white shadow-[0_30px_80px_rgba(120,100,80,0.12)]">
            <div className="grid lg:grid-cols-[0.95fr_1.05fr]">
              <div className="relative min-h-[320px] bg-[#16212a] md:min-h-[360px]">
                <Image
                  src="/hiemt-pad.jpg"
                  alt="HIEMT Gerät"
                  fill
                  className="object-cover"
                />
              </div>

              <div className="bg-[#f8f5ef] p-6 md:p-10">
                <div className="inline-flex rounded-full bg-[#dfe6da] px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-stone-700">
                  {c.special.eyebrow}
                </div>
                <h2 className="mt-4 text-3xl font-semibold text-stone-900 md:text-5xl">
                  {c.special.title}
                </h2>
                <p className="mt-5 text-base leading-7 text-stone-600 md:text-lg md:leading-8">
                  {c.special.text}
                </p>

                <div className="mt-8 grid gap-4 sm:grid-cols-2">
                  {c.special.bullets.map((bullet: string) => (
                    <div
                      key={bullet}
                      className="rounded-2xl border border-stone-200 bg-white p-4 text-sm text-stone-700 shadow-sm"
                    >
                      {bullet}
                    </div>
                  ))}
                </div>

                <div className="mt-8 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-[1.6rem] bg-[#567a57] p-6 text-white">
                    <div className="text-sm uppercase tracking-[0.18em] text-white/70">
                      {c.special.trialLabel}
                    </div>
                    <div className="mt-2 text-3xl font-semibold">
                      {c.special.trialPrice}
                    </div>
                  </div>
                  <div className="rounded-[1.6rem] bg-[#a8b79a] p-6 text-stone-900">
                    <div className="text-sm uppercase tracking-[0.18em] text-stone-700">
                      {c.special.packLabel}
                    </div>
                    <div className="mt-2 text-3xl font-semibold">
                      {c.special.packPrice}
                    </div>
                  </div>
                </div>

                <div className="mt-6 rounded-2xl border border-dashed border-stone-300 p-5 text-sm leading-7 text-stone-600">
                  {c.special.note}
                </div>

                <div className="mt-6 rounded-2xl border border-[#cfd8bf] bg-[#edf4e3] p-5">
                  <p className="text-sm font-medium text-[#4e5f3f]">
                    {c.special.whatsappText}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <a
                      href={c.brand.hiemtWhatsappLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block rounded-full bg-[#6f7d58] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#5f6c4a]"
                    >
                      {c.special.whatsappButton}
                    </a>
                    <button
                      onClick={() => setShowHiemtInfo(true)}
                      className="inline-block rounded-full border border-[#6f7d58] px-6 py-3 text-sm font-semibold text-[#556246] transition hover:bg-[#eef3e6]"
                    >
                      {c.special.infoButton}
                    </button>
                    <a
                      href="/hiemt-de.pdf"
                      download
                      className="inline-block rounded-full border border-stone-300 bg-white px-6 py-3 text-sm font-semibold text-stone-700 transition hover:bg-stone-50"
                    >
                      {c.special.pdfDe}
                    </a>
                    <a
                      href="/hiemt-hu.pdf"
                      download
                      className="inline-block rounded-full border border-stone-300 bg-white px-6 py-3 text-sm font-semibold text-stone-700 transition hover:bg-stone-50"
                    >
                      {c.special.pdfHu}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="leistungen" className="pt-16 pb-4 md:pt-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="mb-10 text-center">
            <p className="text-sm uppercase tracking-[0.28em] text-stone-500">
              {c.services.eyebrow}
            </p>
            <h2 className="mt-4 text-3xl font-semibold text-stone-900 md:text-5xl">
              {c.services.title}
            </h2>
            <p className="mx-auto mt-5 max-w-3xl text-base leading-7 text-stone-600 md:text-lg md:leading-8">
              {c.services.text}
            </p>
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => scrollSlider(servicesSliderRef, "left")}
              className="absolute left-0 top-1/2 z-10 hidden -translate-x-1/2 -translate-y-1/2 rounded-full border border-stone-300 bg-white/90 p-4 text-stone-700 shadow-md transition hover:bg-white lg:flex"
              aria-label="Nach links scrollen"
            >
              <span className="text-2xl leading-none">‹</span>
            </button>

            <div
              ref={servicesSliderRef}
              className="flex snap-x snap-mandatory gap-6 overflow-x-auto pb-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
            >
              {c.services.items.map((service: ServiceCard) => (
                <div
                  key={service.key}
                  className="min-w-full snap-center lg:min-w-[92%]"
                >
                  <div className="grid overflow-hidden rounded-[2.2rem] border border-stone-200 bg-white shadow-[0_20px_60px_rgba(120,100,80,0.12)] lg:grid-cols-[0.92fr_1.08fr]">
                    <div className="flex items-center bg-[#f7f2ea] p-5 md:p-8 lg:p-10">
                      <div className="w-full rounded-[2rem] bg-[#cfd5cb] p-6 shadow-sm md:p-8">
                        <h3 className="text-2xl font-medium leading-tight text-stone-800 md:text-4xl">
                          {service.title}
                        </h3>
                        <p className="mt-5 text-sm leading-7 text-stone-700 md:mt-6 md:text-base md:leading-8">
                          {service.description}
                        </p>
                        <div className="mt-6 space-y-2 text-sm font-medium text-stone-700">
                          {service.durations.map((duration) => (
                            <div key={duration}>{duration}</div>
                          ))}
                        </div>
                        <div className="mt-8 flex flex-wrap items-center gap-3">
                          <a
                            href="/booking"
                            className="inline-block bg-[#405e3f] px-6 py-3 text-sm font-medium text-white transition hover:-translate-y-0.5 md:px-8 md:py-4 md:text-base"
                          >
                            {c.services.button}
                          </a>
                          <button
                            type="button"
                            onClick={() => setActiveInfo(service.key)}
                            className="border border-[#405e3f] px-6 py-3 text-sm font-medium text-[#405e3f] transition hover:bg-[#eef3e6] md:px-8 md:py-4 md:text-base"
                          >
                            {c.services.info}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="relative h-[300px] sm:h-[360px] md:h-[420px] lg:h-full lg:min-h-[560px]">
                      <Image
                        src={service.image}
                        alt={service.title}
                        fill
                        className="object-cover object-center"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => scrollSlider(servicesSliderRef, "right")}
              className="absolute right-0 top-1/2 z-10 hidden translate-x-1/2 -translate-y-1/2 rounded-full border border-stone-300 bg-white/90 p-4 text-stone-700 shadow-md transition hover:bg-white lg:flex"
              aria-label="Nach rechts scrollen"
            >
              <span className="text-2xl leading-none">›</span>
            </button>
          </div>
        </div>
      </section>

      <section id="zusatzangebote" className="bg-[#f8f2e9] pt-8 pb-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="mb-10 text-center">
            <p className="text-sm uppercase tracking-[0.28em] text-stone-500">
              {c.methods.eyebrow}
            </p>
            <h2 className="mt-4 text-3xl font-semibold text-stone-900 md:text-5xl">
              {c.methods.title}
            </h2>
            <p className="mx-auto mt-5 max-w-3xl text-base leading-7 text-stone-600 md:text-lg md:leading-8">
              {c.methods.text}
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-4">
            {c.methods.items.map((item: MethodCard) => (
              <div
                key={item.key}
                className="overflow-hidden rounded-[2rem] border border-stone-200 bg-white shadow-sm transition hover:-translate-y-1"
              >
                <div className="relative h-64 w-full bg-stone-100">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    className="object-cover object-center"
                  />
                </div>
                <div className="flex min-h-[250px] flex-col p-8">
                  <h3 className="text-2xl font-semibold text-stone-900">
                    {item.title}
                  </h3>
                  <p className="mt-5 flex-1 text-sm leading-7 text-stone-600 md:text-base md:leading-8">
                    {item.text}
                  </p>
                  <div className="mt-6">
                    <button
                      onClick={() => setActiveInfo(item.key)}
                      className="border border-[#405e3f] px-6 py-3 text-[#405e3f] transition hover:bg-[#eef3e6]"
                    >
                      {c.methods.info}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="booking" className="py-16 md:py-20">
        <div className="mx-auto max-w-5xl px-6 text-center lg:px-10">
          <p className="text-sm uppercase tracking-[0.28em] text-stone-500">
            {c.booking.eyebrow}
          </p>
          <h2 className="mt-4 text-3xl font-semibold text-stone-900 md:text-5xl">
            {c.booking.title}
          </h2>
          <p className="mx-auto mt-5 max-w-3xl text-base leading-7 text-stone-600 md:text-lg md:leading-8">
            {c.booking.text}
          </p>

          <div className="mt-4 inline-flex rounded-full border border-[#cfd8bf] bg-[#edf4e3] px-4 py-2 text-sm font-medium text-[#4e5f3f]">
            {c.booking.note}
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <a
              href={accountHref}
              className="rounded-full border border-[#567a57] bg-white px-8 py-4 text-base font-medium text-[#567a57] transition hover:bg-[#f4f8ef]"
            >
              {accountLabel}
            </a>
            <a
              href="/booking"
              className="inline-block rounded-full bg-[#567a57] px-8 py-4 text-base font-medium text-white transition hover:opacity-90"
            >
              {c.booking.button}
            </a>
          </div>
        </div>
      </section>

      <section id="bewertungen" className="bg-[#f8f2e9] py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="mb-10 text-center">
            <p className="text-sm uppercase tracking-[0.28em] text-stone-500">
              {c.testimonials.eyebrow}
            </p>
            <h2 className="mt-4 text-3xl font-semibold text-stone-900 md:text-5xl">
              {c.testimonials.title}
            </h2>
            <p className="mx-auto mt-5 max-w-3xl text-base leading-7 text-stone-600 md:text-lg md:leading-8">
              {c.testimonials.subtitle}
            </p>
          </div>

          <div className="grid gap-10 lg:grid-cols-2">
            <div>
              <div className="mb-5 inline-flex rounded-full bg-[#dfe6da] px-4 py-2 text-xs font-medium uppercase tracking-[0.18em] text-stone-700">
                {c.testimonials.massageTitle}
              </div>

              <div className="space-y-5">
                {c.testimonials.items.massage.map(
                  (
                    item: {
                      name: string;
                      text: string;
                    },
                    index: number
                  ) => (
                    <div
                      key={`${item.name}-${index}`}
                      className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm"
                    >
                      <div className="mb-3 text-xl text-[#d6b36a]">★★★★★</div>
                      <p className="text-base leading-8 text-stone-700">
                        {item.text}
                      </p>
                      <p className="mt-4 text-sm font-semibold uppercase tracking-[0.14em] text-stone-500">
                        {item.name}
                      </p>
                    </div>
                  )
                )}
              </div>
            </div>

            <div>
              <div className="mb-5 inline-flex rounded-full bg-[#edf4e3] px-4 py-2 text-xs font-medium uppercase tracking-[0.18em] text-[#4e5f3f]">
                {c.testimonials.hiemtTitle}
              </div>

              <div className="space-y-5">
                {c.testimonials.items.hiemt.map(
                  (
                    item: {
                      name: string;
                      text: string;
                    },
                    index: number
                  ) => (
                    <div
                      key={`${item.name}-${index}`}
                      className="rounded-[2rem] border border-[#cfd8bf] bg-white p-6 shadow-sm"
                    >
                      <div className="mb-3 text-xl text-[#d6b36a]">★★★★★</div>
                      <p className="text-base leading-8 text-stone-700">
                        {item.text}
                      </p>
                      <p className="mt-4 text-sm font-semibold uppercase tracking-[0.14em] text-stone-500">
                        {item.name}
                      </p>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="anfahrt" className="py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="mb-10 text-center">
            <p className="text-sm uppercase tracking-[0.28em] text-stone-500">
              {c.location.eyebrow}
            </p>
            <h2 className="mt-4 text-3xl font-semibold text-stone-900 md:text-5xl">
              {c.location.title}
            </h2>
          </div>

          <div className="mx-auto max-w-6xl rounded-[2rem] bg-[#f8f1e6] px-4 pb-4 pt-4 shadow-sm">
            <div className="overflow-hidden rounded-[1.5rem] border border-stone-200 bg-white shadow-sm">
              <iframe
                src="https://www.google.com/maps?q=Bahnhofstraße%2021,%2082383%20Hohenpeißenberg&output=embed"
                width="100%"
                height="500"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Google Maps Standort Christina Massage"
              />
            </div>
          </div>

          <div className="mt-12 grid gap-8 lg:grid-cols-2 lg:items-center">
            <div className="overflow-hidden rounded-[2rem] border border-stone-200 bg-white shadow-sm">
              <div className="relative h-[320px] md:h-[450px]">
                <Image
                  src="/entrance.jpeg"
                  alt="Eingang Christina Massage"
                  fill
                  className="object-cover"
                />
              </div>
            </div>

            <div className="rounded-[2rem] border border-stone-200 bg-white p-8 shadow-sm">
              <p className="text-base leading-8 text-stone-700">
                {c.location.intro}
              </p>
              <p className="mt-4 text-base leading-8 text-stone-700">
                <strong>{c.location.seoText}</strong>
              </p>
              <div className="mt-6 space-y-3 text-base leading-7 text-stone-700">
                <p>
                  <strong>{c.location.addressLabel}</strong> Bahnhofstraße 21,
                  82383 Hohenpeißenberg
                </p>
                <p>
                  <strong>{c.location.entranceLabel}</strong>{" "}
                  {c.location.entranceText}
                </p>
                <p>
                  <strong>{c.location.parkingLabel}</strong>{" "}
                  {c.location.parkingText}
                </p>
                <p>
                  <strong>{c.location.arrivalLabel}</strong>{" "}
                  {c.location.arrivalText}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-stone-200 bg-white/50 px-6 py-8 text-sm text-stone-500 lg:px-10">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <p>{c.footer.text}</p>
          <div className="flex gap-6">
            <a href="/impressum" className="transition hover:text-stone-800">
              {c.footer.imprint}
            </a>
            <a href="/datenschutz" className="transition hover:text-stone-800">
              {c.footer.privacy}
            </a>
          </div>
        </div>
      </footer>

      {showHiemtInfo && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4"
          onClick={() => setShowHiemtInfo(false)}
        >
          <div
            className="max-h-[88vh] w-full max-w-4xl overflow-y-auto rounded-[2rem] bg-[#f8f5ef] p-6 shadow-2xl md:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.18em] text-[#7a8566]">
                  HIEMT
                </p>
                <h3 className="mt-2 text-2xl font-semibold text-stone-900 md:text-3xl">
                  {hiemtInfo[language].title}
                </h3>
              </div>
              <button
                onClick={() => setShowHiemtInfo(false)}
                className="rounded-full bg-white px-4 py-2 text-sm text-stone-700 shadow-sm"
              >
                {c.close}
              </button>
            </div>

            <div className="mt-8 space-y-8">
              {hiemtInfo[language].sections.map((section, index) => (
                <div key={`${section.heading}-${index}`}>
                  <h4 className="text-lg font-semibold text-[#556246]">
                    {section.heading}
                  </h4>
                  {section.paragraphs && (
                    <div className="mt-4 space-y-4 text-sm leading-8 text-stone-700 md:text-base">
                      {section.paragraphs.map((paragraph, i) => (
                        <p key={`${paragraph}-${i}`}>{paragraph}</p>
                      ))}
                    </div>
                  )}
                  {section.bullets && (
                    <ul className="mt-4 space-y-3 text-sm leading-7 text-stone-700 md:text-base">
                      {section.bullets.map((bullet, i) => (
                        <li key={`${bullet}-${i}`} className="flex gap-3">
                          <span className="mt-[10px] h-2 w-2 rounded-full bg-[#6f7d58]" />
                          <span>{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeInfo && infoContent[activeInfo] && (
        <div
          className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 p-4"
          onClick={() => setActiveInfo(null)}
        >
          <div
            className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-[2rem] bg-[#f8f5ef] p-6 shadow-2xl md:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <h3 className="pr-4 text-xl font-semibold text-stone-900 md:text-2xl">
                {infoContent[activeInfo][language].title}
              </h3>
              <button
                onClick={() => setActiveInfo(null)}
                className="shrink-0 rounded-full bg-white px-4 py-2 text-sm text-stone-700 shadow-sm"
              >
                {c.close}
              </button>
            </div>

            <div className="mt-6 space-y-6 text-stone-700">
              {infoContent[activeInfo][language].sections.map(
                (section, index) => (
                  <div key={`${section.heading}-${index}`}>
                    <h4 className="text-lg font-semibold text-[#405e3f]">
                      {section.heading}
                    </h4>

                    {section.paragraphs && (
                      <div className="mt-3 space-y-3 text-sm leading-7 md:text-base">
                        {section.paragraphs.map((p, i) => (
                          <p key={`${p}-${i}`}>{p}</p>
                        ))}
                      </div>
                    )}

                    {section.bullets && (
                      <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-7 md:text-base">
                        {section.bullets.map((b, i) => (
                          <li key={`${b}-${i}`}>{b}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}