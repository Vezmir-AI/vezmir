import VisaLogo from '@/assets/visa.svg';
import MastercardLogo from '@/assets/mastercard.svg';
import CreditCardLogo from '@/assets/credit-card.svg';

export const getIssuerLogo = (issuer: string): string => {
    switch (issuer.toLowerCase()) {
      case 'visa':
        return VisaLogo;
      case 'mastercard':
        return MastercardLogo;
      default:
        return CreditCardLogo;
    }
  };
