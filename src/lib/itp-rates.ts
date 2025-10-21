
export interface ItpBonus {
  type: 'joven';
  rate: number;
  conditions: {
    maxAge?: number;
    maxPropertyPrice?: number;
    maxIncome?: number;
    maxJointIncome?: number;
  };
}

export interface ItpRate {
  general: number;
  bonuses?: ItpBonus[];
}

export const ITP_RATES: { [key: string]: ItpRate } = {
    'Andalucía': {
        general: 7,
        bonuses: [{ type: 'joven', rate: 3.5, conditions: { maxAge: 34, maxPropertyPrice: 150000 } }]
    },
    'Aragón': { general: 8 },
    'Asturias': {
        general: 8,
        bonuses: [{ type: 'joven', rate: 4, conditions: { maxAge: 35, maxPropertyPrice: 150000 } }]
    },
    'Baleares': {
        general: 8,
        bonuses: [{ type: 'joven', rate: 2, conditions: { maxAge: 35 } }]
    },
    'Canarias': {
        general: 6.5,
        bonuses: [{ type: 'joven', rate: 5.2, conditions: { maxAge: 34, maxPropertyPrice: 150000 } }] // "Importe recomendado" is not a hard rule, so I'll interpret it as a max price for the bonus
    },
    'Cantabria': {
        general: 9,
        // The user mentioned "límite de precio y renta" but didn't provide values. I will omit for now.
        bonuses: [{ type: 'joven', rate: 4, conditions: { maxAge: 35 } }]
    },
    'Castilla y León': {
        general: 8,
        bonuses: [{ type: 'joven', rate: 4, conditions: { maxAge: 35 } }] // "hay límites de valor" is unspecific, implementing general age bonus
    },
    'Castilla-La Mancha': {
        general: 9,
        bonuses: [{ type: 'joven', rate: 5, conditions: { maxAge: 35, maxPropertyPrice: 180000 } }]
    },
    'Cataluña': {
        general: 10,
        bonuses: [{ type: 'joven', rate: 5, conditions: { maxAge: 35, maxIncome: 36000 } }]
    },
    'Ceuta': { general: 6 },
    'Comunidad Valenciana': {
        general: 10,
        bonuses: [{ type: 'joven', rate: 8, conditions: { maxAge: 34 } }]
    },
    'Extremadura': {
        general: 8,
        bonuses: [{ type: 'joven', rate: 6, conditions: { maxAge: 35, maxPropertyPrice: 122000, maxIncome: 28000, maxJointIncome: 45000 } }]
    },
    'Galicia': {
        general: 9,
        bonuses: [{ type: 'joven', rate: 4, conditions: { maxAge: 35, maxPropertyPrice: 150000 } }] // "Importe recomendado" interpreted as max price
    },
    'La Rioja': {
        general: 7,
        bonuses: [{ type: 'joven', rate: 5, conditions: { maxAge: 35 } }]
    },
    'Madrid': { general: 6 },
    'Melilla': { general: 6 },
    'Murcia': {
        general: 8,
        bonuses: [{ type: 'joven', rate: 3, conditions: { maxAge: 34 } }]
    },
    'Navarra': { general: 6 },
    'País Vasco': { general: 7 },
};

export const provinces = Object.keys(ITP_RATES);
