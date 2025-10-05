'use client';

import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';

export function ToastDemo() {
  const { success, error, warning, info } = useToast();

  return (
    <div className="p-6  bg-white rounded-lg shadow-lg max-w-md mx-auto">
      <h3 className="text-lg text-red-200 font-semibold mb-4 text-center"> الإشعارات</h3>
      <div className="space-y-3">
        <Button
          onClick={() => success({
            title: "نجح!",
            description: "تم حفظ التغييرات بنجاح",
          })}
          className="w-full bg-green-600 hover:bg-green-700"
        >
          نجاح
        </Button>

        <Button
          onClick={() => error({
            title: "خطأ",
            description: "حدث خطأ ما. يرجى المحاولة مرة أخرى",
          })}
          className="w-full bg-red-600 hover:bg-red-700"
        >
          خطأ
        </Button>

        <Button
          onClick={() => warning({
            title: "تحذير",
            description: "يرجى التحقق من البيانات المدخلة",
          })}
          className="w-full bg-yellow-600 hover:bg-yellow-700"
        >
          تحذير
        </Button>

        <Button
          onClick={() => info({
            title: "معلومة",
            description: "هذه معلومة مفيدة لك",
          })}
          className="w-full bg-blue-600 hover:bg-blue-700"
        >
          معلومة
        </Button>
      </div>
    </div>
  );
}
