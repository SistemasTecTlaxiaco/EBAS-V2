import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CreateCreditProfileInput, RequestLoanInput, ProvideLiquidityInput } from '@/types';
import { useEbasStore } from '@/store';
import { useNotifications } from './useNotifications';

// Schemas de validación
const creditProfileSchema = z.object({
  total_income: z.string()
    .min(1, 'Los ingresos totales son requeridos')
    .regex(/^\d+$/, 'Debe ser un número válido'),
  avg_monthly_income: z.string()
    .min(1, 'El ingreso mensual promedio es requerido')
    .regex(/^\d+$/, 'Debe ser un número válido'),
  gig_platforms: z.array(z.string())
    .min(1, 'Selecciona al menos una plataforma')
    .max(10, 'Máximo 10 plataformas'),
});

const loanRequestSchema = z.object({
  amount: z.string()
    .min(1, 'El monto es requerido')
    .regex(/^\d+$/, 'Debe ser un número válido'),
  collateral: z.string()
    .min(1, 'El colateral es requerido')
    .regex(/^\d+$/, 'Debe ser un número válido'),
  duration: z.number()
    .min(86400, 'Mínimo 1 día') // 1 día en segundos
    .max(31536000, 'Máximo 1 año'), // 1 año en segundos
});

const liquiditySchema = z.object({
  amount: z.string()
    .min(1, 'El monto es requerido')
    .regex(/^\d+$/, 'Debe ser un número válido'),
});

// Hook para formulario de perfil crediticio
export const useCreditProfileForm = (initialData?: CreateCreditProfileInput) => {
  const { updateCreditProfile } = useEbasStore();
  const { showSuccess, showError, showLoading, dismissToast } = useNotifications();

  const form = useForm<CreateCreditProfileInput>({
    resolver: zodResolver(creditProfileSchema),
    defaultValues: initialData || {
      total_income: '',
      avg_monthly_income: '',
      gig_platforms: [],
    },
  });

  const onSubmit = async (data: CreateCreditProfileInput) => {
    const loadingToast = showLoading('Actualizando perfil crediticio...');

    try {
      await updateCreditProfile(data);
      showSuccess('¡Perfil crediticio actualizado exitosamente!');
      form.reset();
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Error desconocido');
    } finally {
      dismissToast(loadingToast);
    }
  };

  return {
    form,
    onSubmit: form.handleSubmit(onSubmit),
    isSubmitting: form.formState.isSubmitting,
  };
};

// Hook para formulario de solicitud de préstamo
export const useLoanRequestForm = (initialData?: RequestLoanInput) => {
  const { requestLoan } = useEbasStore();
  const { showSuccess, showError, showLoading, dismissToast } = useNotifications();

  const form = useForm<RequestLoanInput>({
    resolver: zodResolver(loanRequestSchema),
    defaultValues: initialData || {
      amount: '',
      collateral: '',
      duration: 2592000, // 30 días por defecto
    },
  });

  const onSubmit = async (data: RequestLoanInput) => {
    const loadingToast = showLoading('Solicitando préstamo...');

    try {
      const loanId = await requestLoan(data);
      showSuccess(`¡Préstamo solicitado exitosamente! ID: ${loanId}`);
      form.reset();
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Error desconocido');
    } finally {
      dismissToast(loadingToast);
    }
  };

  return {
    form,
    onSubmit: form.handleSubmit(onSubmit),
    isSubmitting: form.formState.isSubmitting,
  };
};

// Hook para formulario de liquidez
export const useLiquidityForm = (initialData?: ProvideLiquidityInput) => {
  const { provideLiquidity } = useEbasStore();
  const { showSuccess, showError, showLoading, dismissToast } = useNotifications();

  const form = useForm<ProvideLiquidityInput>({
    resolver: zodResolver(liquiditySchema),
    defaultValues: initialData || {
      amount: '',
    },
  });

  const onSubmit = async (data: ProvideLiquidityInput) => {
    const loadingToast = showLoading('Proporcionando liquidez...');

    try {
      await provideLiquidity(data);
      showSuccess('¡Liquidez agregada exitosamente!');
      form.reset();
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Error desconocido');
    } finally {
      dismissToast(loadingToast);
    }
  };

  return {
    form,
    onSubmit: form.handleSubmit(onSubmit),
    isSubmitting: form.formState.isSubmitting,
  };
};