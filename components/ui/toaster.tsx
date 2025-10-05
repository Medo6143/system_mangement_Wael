'use client';

import { useToast } from '@/hooks/use-toast';
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from '@/components/ui/toast';
import { CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';

const getToastIcon = (variant?: string) => {
  switch (variant) {
    case 'success':
      return <CheckCircle className="h-5 w-5 text-green-600" />;
    case 'error':
      return <AlertCircle className="h-5 w-5 text-red-600" />;
    case 'warning':
      return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
    case 'info':
      return <Info className="h-5 w-5 text-blue-600" />;
    default:
      return null;
  }
};

export function Toaster() {
  const { toasts } = useToast();

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, variant, ...props }) {
        const Icon = getToastIcon(variant || undefined);

        return (
          <Toast key={id} variant={variant} {...props}>
            <div className="flex items-start space-x-3">
              {Icon && (
                <div className="flex-shrink-0 mt-0.5">
                  {Icon}
                </div>
              )}
              <div className="grid gap-1 flex-1">
                {title && <ToastTitle className="font-medium">{title}</ToastTitle>}
                {description && (
                  <ToastDescription className="text-sm opacity-90">
                    {description}
                  </ToastDescription>
                )}
              </div>
              {action}
              <ToastClose className="flex-shrink-0" />
            </div>
          </Toast>
        );
      })}
      <ToastViewport />
    </ToastProvider>
  );
}
