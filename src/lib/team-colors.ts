export const TEAM_COLORS = {
  default: '#4ff5df',
  mercedes: '#00D2BE',
  redbull: '#0600EF', 
  ferrari: '#DC0000',
  mclaren: '#FF8700',
  astonmartin: '#006F62',
  alpine: '#0090FF',
  williams: '#005AFF',
  rb: '#2B4562',
  sauber: '#52E252',
  haas: '#FFFFFF'
};

export type TeamId = keyof typeof TEAM_COLORS;

export const DRIVER_DATA: Record<string, { name: string, team: string, number: number, teamId: TeamId }> = {
  VER: { name: "Max Verstappen", team: "Red Bull Racing", number: 1, teamId: "redbull" },
  PER: { name: "Sergio Perez", team: "Red Bull Racing", number: 11, teamId: "redbull" },
  HAM: { name: "Lewis Hamilton", team: "Mercedes", number: 44, teamId: "mercedes" },
  RUS: { name: "George Russell", team: "Mercedes", number: 63, teamId: "mercedes" },
  LEC: { name: "Charles Leclerc", team: "Ferrari", number: 16, teamId: "ferrari" },
  SAI: { name: "Carlos Sainz", team: "Ferrari", number: 55, teamId: "ferrari" },
  NOR: { name: "Lando Norris", team: "McLaren", number: 4, teamId: "mclaren" },
  PIA: { name: "Oscar Piastri", team: "McLaren", number: 81, teamId: "mclaren" },
  ALO: { name: "Fernando Alonso", team: "Aston Martin", number: 14, teamId: "astonmartin" },
  STR: { name: "Lance Stroll", team: "Aston Martin", number: 18, teamId: "astonmartin" },
  GAS: { name: "Pierre Gasly", team: "Alpine", number: 10, teamId: "alpine" },
  OCO: { name: "Esteban Ocon", team: "Alpine", number: 31, teamId: "alpine" },
  ALB: { name: "Alexander Albon", team: "Williams", number: 23, teamId: "williams" },
  SAR: { name: "Logan Sargeant", team: "Williams", number: 2, teamId: "williams" },
  TSU: { name: "Yuki Tsunoda", team: "AlphaTauri", number: 22, teamId: "rb" },
  DEV: { name: "Nyck De Vries", team: "AlphaTauri", number: 21, teamId: "rb" },
  RIC: { name: "Daniel Ricciardo", team: "AlphaTauri", number: 3, teamId: "rb" },
  LAW: { name: "Liam Lawson", team: "AlphaTauri", number: 40, teamId: "rb" },
  BOT: { name: "Valtteri Bottas", team: "Alfa Romeo", number: 77, teamId: "sauber" },
  ZHO: { name: "Zhou Guanyu", team: "Alfa Romeo", number: 24, teamId: "sauber" },
  HUL: { name: "Nico Hulkenberg", team: "Haas", number: 27, teamId: "haas" },
  MAG: { name: "Kevin Magnussen", team: "Haas", number: 20, teamId: "haas" }
};

export function getDriverData(code: string) {
  return DRIVER_DATA[code.toUpperCase()] || { name: code, team: "Unknown", number: 0, teamId: "default" };
}

// Utility to convert Driver ID or string into canonical TeamId for backward compatibility
export function mapDriverToTeam(driverId: string): TeamId {
  const upper = driverId.toUpperCase();
  if (DRIVER_DATA[upper]) return DRIVER_DATA[upper].teamId;

  // Fallback for full strings (max-verstappen)
  const lookup: Record<string, TeamId> = {
    'max-verstappen': 'redbull',
    'charles-leclerc': 'ferrari',
    'lewis-hamilton': 'mercedes',
    'lando-norris': 'mclaren',
    'oscar-piastri': 'mclaren',
    'george-russell': 'mercedes'
  };
  return lookup[driverId] || 'default';
}
