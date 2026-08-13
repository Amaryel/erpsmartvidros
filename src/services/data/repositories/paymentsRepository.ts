import { SalePayment, PaymentMethod } from '../../../types';
import { getSaleById, updateSale } from './salesRepository';
import { generateUUID } from '../uuid';

export function getPaymentsBySale(saleId: string): SalePayment[] {
  const sale = getSaleById(saleId);
  return sale ? sale.payments || [] : [];
}

export function createPayment(
  saleId: string,
  paymentData: Omit<SalePayment, 'id'>
): SalePayment | null {
  const sale = getSaleById(saleId);
  if (!sale) return null;

  const newPayment: SalePayment = {
    ...paymentData,
    id: generateUUID(),
  };

  const updatedPayments = [...(sale.payments || []), newPayment];

  const totalPaid = updatedPayments
    .filter((p) => p.method !== 'fiado')
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  const totalFiado = updatedPayments
    .filter((p) => p.method === 'fiado')
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  updateSale(saleId, {
    payments: updatedPayments,
    totalPaid,
    totalFiado,
  });

  return newPayment;
}
