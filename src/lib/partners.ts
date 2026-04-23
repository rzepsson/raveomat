export interface Partner {
  name: string;
  type: string;
  city: string;
  events: number;
  description: string;
}

export const partners: Partner[] = [
  { name: "Baza", type: "Klub", city: "Warszawa", events: 23, description: "Jedna z najlepszych technicznych scen w Polsce" },
  { name: "Jasna 1", type: "Klub", city: "Warszawa", events: 15, description: "Legendarne miejsce undergroundowych imprez" },
  { name: "Prozak 2.0", type: "Klub", city: "Kraków", events: 12, description: "Krakowski klasyk z najlepszym sound systemem" },
  { name: "Pień", type: "Klub", city: "Wrocław", events: 11, description: "Wrocławska świątynia techno" },
  { name: "Resort", type: "Klub", city: "Warszawa", events: 9, description: "Najlepsze imprezy hard techno w stolicy" },
  { name: "Tama", type: "Klub", city: "Poznań", events: 8, description: "Poznański klub z bogatą historią" },
  { name: "Locomotiv", type: "Klub", city: "Wrocław", events: 7, description: "Wielofunkcyjna przestrzeń kulturalna" },
  { name: "Szopp", type: "Klub", city: "Kraków", events: 6, description: "Mały, ale głośny" },
  { name: "Halerta", type: "Klub", city: "Poznań", events: 5, description: "Industrialne brzmienia w sercu miasta" },
  { name: "Weird", type: "Klub", city: "Warszawa", events: 4, description: "Eksperymentalne techno w undergroundowej atmosferze" },
  { name: "Żywilla", type: "Klub", city: "Gdańsk", events: 3, description: "Trójmiejska scena undergroundowa" },
  { name: "Czarny Piątek", type: "Kolektyw", city: "Online", events: 18, description: "Wirtualne imprezy dla globalnej społeczności" },
];

export const partnersSortedByEvents = [...partners].sort((a, b) => b.events - a.events);

export const marqueePartners = [...partnersSortedByEvents, ...partnersSortedByEvents];
