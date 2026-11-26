// Everything the author still needs to fill in lives here.
// Paths under `assets/` are relative to public/ and get the deploy base path
// prepended automatically (see src/lib/url.ts).

export const site = {
  name: 'GECKOGuard',
  title: 'GECKOGuard: is this WiFi really who it says it is?',
  description:
    'GECKOGuard checks every WiFi network against a public register of who is allowed to run which network, where.',

  author: 'Pablo Tanner',
  thesisTitle: 'ETH Zurich',
  githubUrl: 'https://github.com/pablotanner',
  thesisPdfUrl: '#', // e.g. 'assets/thesis.pdf' or an external URL
  geopkiUrl: 'https://github.com/netsec-ethz/geopki',

  // Shown in the FAQ ("Is my location sent anywhere?").
  // TODO(author): confirm. The prototype's default query radius is 50 m.
  lookupRadiusMeters: 50,
  lookupAnswerConfirmed: false,
};

export interface VideoConfig {
  /** File under public/, e.g. 'assets/video/attack-without.mp4'. Missing file -> placeholder. */
  src: string;
  poster: string;
  captions: string;
  title: string;
  /** Caption timeline under the player. TODO(author): match the final recordings. */
  steps: { time: string; text: string }[];
}

export const videos = {
  attackWithout: {
    src: 'assets/video/attack-without.mp4',
    poster: 'assets/video/attack-without.jpg',
    captions: 'assets/video/attack-without.vtt',
    title: 'Your Phone',
    steps: [
      { time: '0:03', text: 'Phone joins Wipkingen Airport Free' },
      { time: '0:08', text: "The attacker's sign-in page opens" },
      { time: '0:15', text: 'Email and password are typed in' },
    ],
  },
  attackWith: {
    src: 'assets/video/attack-with.mp4',
    poster: 'assets/video/attack-with.jpg',
    captions: 'assets/video/attack-with.vtt',
    title: 'With GECKOGuard',
    steps: [
      { time: '0:03', text: 'Phone joins the same network' },
      { time: '0:06', text: 'GECKOGuard looks up what is registered here' },
      { time: '0:08', text: 'Conflict shown before anything is typed' },
    ],
  },
  eduroam: {
    src: 'assets/video/eduroam-ios.mp4',
    poster: 'assets/video/eduroam-ios.jpg',
    captions: 'assets/video/eduroam-ios.vtt',
    title: 'The trust prompt on an iPhone',
    steps: [
      { time: '0:00', text: 'Connected to eduroam-lab.' },
      { time: '0:05', text: 'The connection drops (e.g. due to jamming): an impostor takes over' },
      { time: '0:16', text: 'User is asked to accept the new certificate' },
      { time: '0:18', text: 'User taps "Accept" and their plaintext credentials are sent to the attacker' },
    ],
  },
} satisfies Record<string, VideoConfig>;

export const nav = [
  { id: 'problem', label: 'Problem' },
  { id: 'demo', label: 'Demo' },
  { id: 'how-it-works', label: 'The Solution' },
  { id: 'try-it', label: 'Try it' },
  { id: 'enterprise', label: 'Enterprise WiFi' },
  { id: 'who', label: "Who it's for" },
  { id: 'faq', label: 'Q & A' },
] as const;
