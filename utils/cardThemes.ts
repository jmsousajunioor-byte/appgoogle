import { Gradient } from '../types';

export interface CardTheme {
    name: string;
    gradient: Gradient;
}

export const cardThemes: CardTheme[] = [
    { name: 'Nubank Ultravioleta', gradient: { start: '#3C1E5A', end: '#5D2E8C' } },
    { name: 'Inter Black', gradient: { start: '#4D4D4D', end: '#FF8A00' } },
    { name: 'XP Visa Infinite', gradient: { start: '#212121', end: '#000000' } },
    { name: 'Itaú Uniclass', gradient: { start: '#00599B', end: '#003C6A' } },
    { name: 'Bradesco Prime', gradient: { start: '#990000', end: '#5C0000' } },
    { name: 'Santander Unique', gradient: { start: '#333333', end: '#D40000' } },
    { name: 'Banco do Brasil', gradient: { start: '#0033A0', end: '#FDC500' } },
    { name: 'C6 Carbon', gradient: { start: '#222222', end: '#444444' } },
    { name: 'BTG Pactual Black', gradient: { start: '#001A2C', end: '#005288' } },
];