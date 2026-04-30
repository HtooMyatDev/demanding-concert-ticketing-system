import { customAlphabet } from 'nanoid';

const alphabet = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
const generateResId = customAlphabet(alphabet, 8);

export const generateReservationId = () => `RES-${generateResId()}`;
